// =====================================================
// GET HTML ELEMENTS
// =====================================================

const usersContainer =
    document.getElementById("usersContainer");

const usersMessage =
    document.getElementById("usersMessage");


// =====================================================
// CHECK ADMIN LOGIN
// =====================================================

const savedAdmin =
    localStorage.getItem("cartivaAdmin");

if (!savedAdmin) {

    window.location.href =
        "admin-login.html";

}


// =====================================================
// LOAD CUSTOMERS
// =====================================================

async function loadCustomers() {

    try {

        usersContainer.innerHTML =
            "<p>Loading customers...</p>";


        const response = await fetch(
            `${API_URL}/admin/users`
        );


        const data =
            await response.json();


        if (!response.ok) {

            usersContainer.innerHTML = `
                <p>
                    ${data.message ||
                    "Failed to load customers."}
                </p>
            `;

            return;

        }


        displayCustomers(
            data.customers
        );


    } catch (error) {

        console.error(
            "Customer loading error:",
            error
        );


        usersContainer.innerHTML = `
            <p>
                Unable to connect to server.
            </p>
        `;

    }

}


// =====================================================
// DISPLAY CUSTOMERS
// =====================================================

function displayCustomers(customers) {

    usersContainer.innerHTML = "";


    if (
        !customers ||
        customers.length === 0
    ) {

        usersContainer.innerHTML = `
            <p>
                No customers registered yet.
            </p>
        `;

        return;

    }


    customers.forEach((customer) => {

        const customerCard =
            document.createElement("div");


        customerCard.className =
            "dashboard-card";


        customerCard.innerHTML = `

            <h2>
                ${customer.name}
            </h2>

            <p>
                <strong>Customer ID:</strong>
                ${customer.id}
            </p>

            <p>
                <strong>Email:</strong>
                ${customer.email}
            </p>

            <p>
                <strong>Phone:</strong>
                ${customer.phone}
            </p>

            <p>
                <strong>Role:</strong>
                ${customer.role}
            </p>

            <p>
                <strong>Registered:</strong>
                ${new Date(
                    customer.created_at
                ).toLocaleString()}
            </p>

        `;


        usersContainer.appendChild(
            customerCard
        );

    });

}


// =====================================================
// LOAD CUSTOMERS WHEN PAGE OPENS
// =====================================================

loadCustomers();