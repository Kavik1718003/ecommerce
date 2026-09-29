const API_URL = "http://localhost:5000/api";


// ===============================
// CHECK USER LOGIN
// ===============================

const userData = localStorage.getItem("cartivaUser");

if (!userData) {
    window.location.href = "login.html";
}

const user = JSON.parse(userData);


// ===============================
// GET FORM
// ===============================

const checkoutForm =
    document.getElementById("checkoutForm");

const checkoutMessage =
    document.getElementById("checkoutMessage");


// ===============================
// PLACE ORDER
// ===============================

checkoutForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        // Get address details

        const address =
            document.getElementById("address")
                .value.trim();

        const city =
            document.getElementById("city")
                .value.trim();

        const state =
            document.getElementById("state")
                .value.trim();

        const pincode =
            document.getElementById("pincode")
                .value.trim();


        // Get payment method

        const paymentMethod =
            document.getElementById("paymentMethod")
                .value;


        try {

            const response =
                await fetch(
                    `${API_URL}/orders`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            userId: user.id,

                            address: address,

                            city: city,

                            state: state,

                            pincode: pincode,

                            paymentMethod:
                                paymentMethod

                        })
                    }
                );


            const data =
                await response.json();


            // ===============================
            // SUCCESS
            // ===============================

            if (response.ok) {

                checkoutMessage.textContent =
                    data.message;

                checkoutMessage.style.color =
                    "green";


                setTimeout(
                    () => {

                        window.location.href =
                            "orders.html";

                    },
                    1000
                );


            }

            // ===============================
            // ERROR
            // ===============================

            else {

                checkoutMessage.textContent =
                    data.message ||
                    "Order failed.";

                checkoutMessage.style.color =
                    "red";

            }


        } catch (error) {

            console.error(
                "Checkout error:",
                error
            );

            checkoutMessage.textContent =
                "Unable to connect to server.";

            checkoutMessage.style.color =
                "red";

        }

    }
);