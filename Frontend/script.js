document.getElementById("paymentForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Frontend se data collect kiya
    const formData = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value
    };

    // Backend server par data send karna (Fetch API)
    fetch("http://localhost:3000/payment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData) // Data ko JSON string me badla
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Backend Response: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Server se connect nahi ho paya!");
    });
});