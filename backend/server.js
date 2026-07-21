const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'api', '.env') });

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "http://127.0.0.1:5500" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function generatePayUHash(data) {
    const { key, txnid, amount, productinfo, firstname, email, udf1, salt } = data;
    const udf2 = '', udf3 = '', udf4 = '', udf5 = '';
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
    return crypto.createHash('sha512').update(hashString).digest('hex');
}
app.post('/api/payment', (req, res) => {
    try {
        const { firstName, lastName, email, phone, address, amount, productinfo } = req.body;

        const PAYU_KEY = process.env.PAYU_KEY;
        const PAYU_SALT = process.env.PAYU_SALT;
        const PAYU_BASE_URL = process.env.PAYU_BASE_URL;
        const RESPONSE_URL = process.env.PAYU_RESPONSE_URL;

        const txnid = "TXN" + Date.now() + Math.floor(1000 + Math.random() * 9000);
       const Amount = parseFloat(amount).toFixed(2);
        const Product = productinfo;
        const hash = generatePayUHash({
            key:PAYU_KEY,
            txnid:txnid,
            amount:Amount,
            productinfo:Product,
            firstname:firstName,
            email:email,
            udf1:address,
            salt:PAYU_SALT
        });

        const actionData = {
            key:PAYU_KEY,
            txnid:txnid,
            amount:Amount,
            productinfo:Product,
            firstname:firstName,
            lastname:lastName,
            email:email,
            phone:phone,
            surl:RESPONSE_URL,
            furl:RESPONSE_URL,
            currency:"USD",
            udf1:address ,
            hash:hash
        };

        res.json({
            success:true,
            payuUrl:PAYU_BASE_URL,
            actionData:actionData
        });

    } catch (error) {
        console.error("Payment Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

app.post('/api/response', (req, res) => {
    const { status } = req.body;
    if (status === 'success') {
        res.send("Transaction Success");
    } else {
        res.send("Transaction Fail");
    }
});

app.listen(PORT, () => {
    console.log(` Loaded .env from: ${path.join(__dirname, 'api', '.env')}`);
    console.log(` Server running on http://localhost:${PORT}`);
});
