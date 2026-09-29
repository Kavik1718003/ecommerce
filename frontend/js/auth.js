const API_URL = "http://localhost:5000/api/auth";

// ===============================
// REGISTER
// ===============================
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const message = document.getElementById("message");

        // Check password confirmation
        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match.";
            message.style.color = "red";
            return;
        }

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    phone: phone,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                message.textContent = data.message;
                message.style.color = "green";

                registerForm.reset();
            } else {
                message.textContent =
                    data.message || "Registration failed.";

                message.style.color = "red";
            }

        } catch (error) {
            console.error("Registration error:", error);

            message.textContent =
                "Unable to connect to the server.";

            message.style.color = "red";
        }
    });
}

// ===============================
// LOGIN
// ===============================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password =
            document.getElementById("loginPassword").value;

        const loginMessage =
            document.getElementById("loginMessage");

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                loginMessage.textContent = data.message;
                loginMessage.style.color = "green";

                // Save logged-in user information
                localStorage.setItem(
                    "cartivaUser",
                    JSON.stringify(data.user)
                );

                // Go to products page
                setTimeout(() => {
                    window.location.href = "products.html";
                }, 1000);

            } else {
                loginMessage.textContent =
                    data.message || "Login failed.";

                loginMessage.style.color = "red";
            }

        } catch (error) {
            console.error("Login error:", error);

            loginMessage.textContent =
                "Unable to connect to the server.";

            loginMessage.style.color = "red";
        }
    });
}