const API_URL =
    "http://localhost:5000/api";


const userData =
    localStorage.getItem(
        "cartivaUser"
    );


if (!userData) {

    window.location.href =
        "login.html";
}


const user =
    JSON.parse(userData);


const ordersContainer =
    document.getElementById(
        "ordersContainer"
    );


async function loadOrders() {

    try {

        const response =
            await fetch(
                `${API_URL}/orders/user/${user.id}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            ordersContainer.innerHTML =
                "<p>Failed to load orders.</p>";

            return;
        }


        displayOrders(
            data.orders
        );


    } catch (error) {

        console.error(
            "Orders error:",
            error
        );


        ordersContainer.innerHTML =
            "<p>Unable to connect to server.</p>";
    }
}


function displayOrders(orders) {

    ordersContainer.innerHTML = "";


    if (orders.length === 0) {

        ordersContainer.innerHTML =
            "<p>No orders found.</p>";

        return;
    }


    orders.forEach(
        (order) => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "product-card";


            div.innerHTML = `

                <div class="product-info">

                    <h2>
                        Order #${order.id}
                    </h2>

                    <p>
                        Total:
                        ₹${order.total_amount}
                    </p>

                    <p>
                        Status:
                        ${order.status}
                    </p>

                    <p>
                        Payment:
                        ${order.payment_method}
                    </p>

                    <p>
                        Address:
                        ${order.shipping_address}
                    </p>

                    <p>
                        Date:
                        ${new Date(
                            order.created_at
                        ).toLocaleString()}
                    </p>

                </div>

            `;


            ordersContainer.appendChild(
                div
            );

        }
    );
}


loadOrders();