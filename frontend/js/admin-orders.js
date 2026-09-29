// =====================================================
// ELEMENTS
// =====================================================

const adminOrdersContainer =
    document.getElementById(
        "adminOrdersContainer"
    );


const orderMessage =
    document.getElementById(
        "orderMessage"
    );


// =====================================================
// CHECK ADMIN LOGIN
// =====================================================

const savedAdmin =
    localStorage.getItem(
        "cartivaAdmin"
    );


if (!savedAdmin) {

    window.location.href =
        "admin-login.html";

}


// =====================================================
// LOAD ORDERS
// =====================================================

async function loadAdminOrders() {

    try {

        adminOrdersContainer.innerHTML =
            "<p>Loading orders...</p>";


        const response =
            await fetch(
                `${API_URL}/admin/orders`
            );


        const data =
            await response.json();


        if (!response.ok) {

            adminOrdersContainer.innerHTML =
                `<p>
                    ${data.message ||
                    "Failed to load orders."}
                </p>`;

            return;

        }


        displayAdminOrders(
            data.orders
        );


    } catch (error) {

        console.error(
            "Admin orders error:",
            error
        );


        adminOrdersContainer.innerHTML =
            "<p>Unable to connect to server.</p>";

    }

}


// =====================================================
// DISPLAY ORDERS
// =====================================================

function displayAdminOrders(orders) {

    adminOrdersContainer.innerHTML = "";


    if (orders.length === 0) {

        adminOrdersContainer.innerHTML =
            "<p>No orders available.</p>";

        return;

    }


    orders.forEach((order) => {

        const orderCard =
            document.createElement("div");


        orderCard.className =
            "dashboard-card";


        orderCard.innerHTML = `

            <h2>
                Order #${order.id}
            </h2>


            <p>
                Customer:
                ${order.customer_name}
            </p>


            <p>
                Email:
                ${order.customer_email}
            </p>


            <p>
                Total:
                ₹${order.total_amount}
            </p>


            <p>
                Shipping Address:
                ${order.address},
                ${order.city},
                ${order.state} -
                ${order.pincode}
            </p>


            <p>
                Payment Method:
                ${order.payment_method}
            </p>


            <p>
                Created:
                ${new Date(
                    order.created_at
                ).toLocaleString()}
            </p>


            <p>
                Current Status:
                <strong>
                    ${order.status}
                </strong>
            </p>


            <label>
                Update Status:
            </label>


            <select
                id="status-${order.id}"
            >

                <option
                    value="Order Placed"
                    ${order.status === "Order Placed"
                        ? "selected"
                        : ""}
                >
                    Order Placed
                </option>


                <option
                    value="Processing"
                    ${order.status === "Processing"
                        ? "selected"
                        : ""}
                >
                    Processing
                </option>


                <option
                    value="Shipped"
                    ${order.status === "Shipped"
                        ? "selected"
                        : ""}
                >
                    Shipped
                </option>


                <option
                    value="Delivered"
                    ${order.status === "Delivered"
                        ? "selected"
                        : ""}
                >
                    Delivered
                </option>


                <option
                    value="Cancelled"
                    ${order.status === "Cancelled"
                        ? "selected"
                        : ""}
                >
                    Cancelled
                </option>

            </select>


            <br><br>


            <button
                class="admin-button"
                onclick="updateOrderStatus(${order.id})"
            >
                Update Status
            </button>

        `;


        adminOrdersContainer.appendChild(
            orderCard
        );

    });

}


// =====================================================
// UPDATE ORDER STATUS
// =====================================================

async function updateOrderStatus(orderId) {

    const statusSelect =
        document.getElementById(
            `status-${orderId}`
        );


    const status =
        statusSelect.value;


    try {

        orderMessage.textContent =
            "Updating order status...";


        const response =
            await fetch(
                `${API_URL}/admin/orders/${orderId}/status`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        status:
                            status

                    })

                }
            );


        const data =
            await response.json();


        if (response.ok) {

            orderMessage.textContent =
                data.message;


            await loadAdminOrders();

        } else {

            orderMessage.textContent =
                data.message ||
                "Failed to update status.";

        }


    } catch (error) {

        console.error(
            "Order status error:",
            error
        );


        orderMessage.textContent =
            "Unable to connect to server.";

    }

}


// =====================================================
// LOAD ORDERS WHEN PAGE OPENS
// =====================================================

loadAdminOrders();