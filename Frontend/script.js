document.getElementById("paymentForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const amountField = document.getElementById("amount");
    const productField = document.getElementById("productinfo");

    const formData = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        amount: amountField ? amountField.value : "10.00",
        productinfo: productField ? productField.value : "Checkout Items"
    };

    console.log("Sending data to backend...", formData);

    fetch("http://localhost:3000/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Backend response error status: " + response.status);
        }
        return response.json();
    })
    .then(resData => {
        if (resData.success && resData.actionData) {
            console.log("Hash generated successfully. Redirecting to PayU...");
            
            const hiddenForm = document.createElement("form");
            hiddenForm.method = "POST";
            hiddenForm.action = resData.payuUrl;
            hiddenForm.style.display = "none";

            Object.keys(resData.actionData).forEach(key => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = resData.actionData[key];
                hiddenForm.appendChild(input);
            });

            document.body.appendChild(hiddenForm);
            hiddenForm.submit();
        } else {
            alert("Payment failed");
        }
    })
    .catch(error => {
        console.error("Network :", error);
        alert("Server failure");
    });
});
