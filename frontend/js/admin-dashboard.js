// =====================================================
// GET HTML ELEMENTS
// =====================================================

const productCount =
    document.getElementById("productCount");

const inventoryCount =
    document.getElementById("inventoryCount");

const orderCount =
    document.getElementById("orderCount");

const customerCount =
    document.getElementById("customerCount");


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
// LOAD DASHBOARD DATA
// =====================================================

async function loadDashboardData() {

    try {

        // ---------------------------------------------
        // PRODUCTS
        // ---------------------------------------------

        const productsResponse =
            await fetch(
                `${API_URL}/products`
            );

        const productsData =
            await productsResponse.json();

        if (productsResponse.ok) {

            productCount.textContent =
                `${productsData.products.length} Products`;

        }


        // ---------------------------------------------
        // INVENTORY
        // ---------------------------------------------

        const inventoryResponse =
            await fetch(
                `${API_URL}/admin/inventory`
            );

        const inventoryData =
            await inventoryResponse.json();

        if (inventoryResponse.ok) {

            inventoryCount.textContent =
                `${inventoryData.inventory.length} Items`;

        }


        // ---------------------------------------------
        // ORDERS
        // ---------------------------------------------

        const ordersResponse =
            await fetch(
                `${API_URL}/admin/orders`
            );

        const ordersData =
            await ordersResponse.json();

        if (ordersResponse.ok) {

            orderCount.textContent =
                `${ordersData.orders.length} Orders`;

        }


        // ---------------------------------------------
        // CUSTOMERS
        // ---------------------------------------------

        const usersResponse =
            await fetch(
                `${API_URL}/admin/users`
            );

        const usersData =
            await usersResponse.json();

        if (usersResponse.ok) {

            customerCount.textContent =
                `${usersData.customers.length} Customers`;

        }


    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );


        productCount.textContent =
            "Unable to load";

        inventoryCount.textContent =
            "Unable to load";

        orderCount.textContent =
            "Unable to load";

        customerCount.textContent =
            "Unable to load";

    }

}


// =====================================================
// LOAD DATA WHEN PAGE OPENS
// =====================================================

loadDashboardData();