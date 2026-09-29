// =====================================================
// INVENTORY ELEMENTS
// =====================================================

const inventoryContainer =
    document.getElementById(
        "inventoryContainer"
    );


const inventoryMessage =
    document.getElementById(
        "inventoryMessage"
    );


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
// LOAD INVENTORY
// =====================================================

async function loadInventory() {

    try {

        inventoryContainer.innerHTML =
            "<p>Loading inventory...</p>";


        const response =
            await fetch(
                `${API_URL}/admin/inventory`
            );


        const data =
            await response.json();


        if (!response.ok) {

            inventoryContainer.innerHTML =
                `<p>
                    ${data.message ||
                    "Failed to load inventory."}
                </p>`;

            return;

        }


        displayInventory(
            data.inventory
        );


    } catch (error) {

        console.error(
            "Inventory loading error:",
            error
        );


        inventoryContainer.innerHTML =
            "<p>Unable to connect to server.</p>";

    }

}


// =====================================================
// DISPLAY INVENTORY
// =====================================================

function displayInventory(inventory) {

    inventoryContainer.innerHTML = "";


    if (inventory.length === 0) {

        inventoryContainer.innerHTML =
            "<p>No products found.</p>";

        return;

    }


    inventory.forEach((product) => {


        const inventoryCard =
            document.createElement("div");


        inventoryCard.className =
            "dashboard-card";


        inventoryCard.innerHTML = `

            <h2>
                ${product.name}
            </h2>


            <p>
                Product ID:
                ${product.id}
            </p>


            <p>
                Category ID:
                ${product.category_id}
            </p>


            <p>
                Price:
                ₹${product.price}
            </p>


            <p>
                Current Stock:
                <strong>
                    ${product.stock}
                </strong>
            </p>


            <div>

                <label>
                    Update Stock:
                </label>


                <input
                    type="number"
                    id="stock-${product.id}"
                    value="${product.stock}"
                    min="0"
                >


                <button
                    class="admin-button"
                    onclick="updateStock(${product.id})"
                >
                    Update Stock
                </button>

            </div>

        `;


        inventoryContainer.appendChild(
            inventoryCard
        );

    });

}


// =====================================================
// UPDATE STOCK
// =====================================================

async function updateStock(productId) {


    const stockInput =
        document.getElementById(
            `stock-${productId}`
        );


    const newStock =
        stockInput.value;


    if (
        newStock === "" ||
        Number(newStock) < 0
    ) {

        alert(
            "Please enter a valid stock value."
        );

        return;

    }


    try {

        inventoryMessage.textContent =
            "Updating stock...";


        const response =
            await fetch(
                `${API_URL}/admin/inventory/${productId}`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        stock:
                            Number(newStock)

                    })

                }
            );


        const data =
            await response.json();


        if (response.ok) {

            inventoryMessage.textContent =
                data.message;


            await loadInventory();


        } else {

            inventoryMessage.textContent =
                data.message ||
                "Failed to update stock.";

        }


    } catch (error) {

        console.error(
            "Stock update error:",
            error
        );


        inventoryMessage.textContent =
            "Unable to connect to server.";

    }

}


// =====================================================
// LOAD INVENTORY WHEN PAGE OPENS
// =====================================================

loadInventory();