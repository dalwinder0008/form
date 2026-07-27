const path = require('path');
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();

const PORT = 3000;
const PAYU_KEY = "v7ZP0D";
const PAYU_SALT = "Gd0WkF1HOA76KOnVoZzAodKbzkZdnPLd";
const PAYU_BASE_URL = "https://test.payu.in/_payment";
const RESPONSE_URL = "http://localhost:3000/api/response";

const SMTP_EMAIL = "dalwinderkarnawal1322@gmail.com";
const SMTP_PASS = "wuhltpeexwxzdsst";

app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASS
    }
});

async function sendPaymentNotification(userEmail, txnid, amount, isSuccess) {
    try {
        const mailSubject = isSuccess ? 'Payment Done' : 'Payment Failed';

        const mailBody = isSuccess 
            ? `Payment Done!\n\nTransaction ID: ${txnid}\nAmount Paid: $${amount}`
            : `Payment Failed!\n\nTransaction ID: ${txnid}\nAmount Attempted: $${amount}`;
        const mailOptions = {
            from: `"Store" <${SMTP_EMAIL}>`,
            to: userEmail,
            subject: mailSubject,
            text: mailBody
        };
        await transporter.sendMail(mailOptions);
        console.log(` Notification email sent to ${userEmail}`);
    } catch (error) {
        console.error(" Email Sending Failed:", error.message);
    }
}
function generatePayUHash(data) {
    const { key, txnid, amount, productinfo, firstname, email, udf1, salt } = data;
    const udf2 = '', udf3 = '', udf4 = '', udf5 = '';
    
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
    return crypto.createHash('sha512').update(hashString).digest('hex');
}
app.post('/api/payment', (req, res) => {
    try {
        const { 
            firstName, 
            lastName = '', 
            email, 
            phone = '', 
            address = '', 
            amount = 10, 
            productinfo = "Checkout Order" 
        } = req.body;

        const txnid = "TXN" + Date.now() + Math.floor(1000 + Math.random() * 9000);
        const sanitizeAmount = parseFloat(amount).toFixed(2);

        const hash = generatePayUHash({
            key: PAYU_KEY,
            txnid: txnid,
            amount: sanitizeAmount,
            productinfo: productinfo,
            firstname: firstName,
            email: email,
            udf1: address,
            salt: PAYU_SALT
        });

        const actionData = {
            key: PAYU_KEY,
            txnid: txnid,
            amount: sanitizeAmount,
            productinfo: productinfo,
            firstname: firstName,
            lastname: lastName,
            email: email,
            phone: phone,
            surl: RESPONSE_URL,
            furl: RESPONSE_URL,
            udf1: address,
            hash: hash
        };

        res.json({
            success: true,
            payuUrl: PAYU_BASE_URL,
            actionData: actionData
        });

    } catch (error) {
        console.error("Payment Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
app.post('/api/response', async (req, res) => {
    try {
        const { status, txnid, amount, email } = req.body;
        
        if (status === 'success') {
            console.log(` Payment Successful: ${txnid}`);

            if (email) {
                await sendPaymentNotification(email, txnid, amount, true);
            }

            res.type('text/plain').send(`Payment Done!\n\nTransaction ID: ${txnid}\nAmount Paid: $${amount}`);

        } else {
            console.log(` Payment Failed: ${txnid}`);

            if (email) {
                await sendPaymentNotification(email, txnid, amount, false);
            }

            res.type('text/plain').send(`Payment Failed!\n\nTransaction ID: ${txnid}\nAmount Attempted: $${amount}`);
        }
    } catch (error) {
        console.error("Response Handler Error:", error);
        res.status(500).send("Error processing payment response");
    }
});

app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
});
