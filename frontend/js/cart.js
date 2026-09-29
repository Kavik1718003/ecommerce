const API_URL =
    "http://localhost:5000/api";


// ===============================
// GET LOGGED USER
// ===============================

const userData =
    localStorage.getItem("cartivaUser");


if (!userData) {

    window.location.href =
        "login.html";
}


const user =
    JSON.parse(userData);


const cartContainer =
    document.getElementById(
        "cartContainer"
    );

const cartTotal =
    document.getElementById(
        "cartTotal"
    );


// ===============================
// LOAD CART
// ===============================

async function loadCart() {

    try {

        const response =
            await fetch(
                `${API_URL}/cart/${user.id}`
            );

        const data =
            await response.json();

        if (!response.ok) {

            cartContainer.innerHTML =
                "<p>Failed to load cart.</p>";

            return;
        }

        displayCart(data.cart);

    } catch (error) {

        console.error(
            "Cart error:",
            error
        );

        cartContainer.innerHTML =
            "<p>Unable to connect to server.</p>";
    }
}


// ===============================
// DISPLAY CART
// ===============================

function displayCart(cart) {

    cartContainer.innerHTML = "";

    if (cart.length === 0) {

        cartContainer.innerHTML =
            "<p>Your cart is empty.</p>";

        cartTotal.innerHTML = "";

        return;
    }


    let total = 0;


    cart.forEach((item) => {

        const itemTotal =
            Number(item.price) *
            Number(item.quantity);

        total += itemTotal;


        const div =
            document.createElement("div");

        div.className =
            "product-card";


        div.innerHTML = `

            <div class="product-info">

                <h2>
                    ${item.name}
                </h2>

                <p>
                    Price:
                    ₹${item.price}
                </p>

                <p>
                    Quantity:
                    ${item.quantity}
                </p>

                <p>
                    Item Total:
                    ₹${itemTotal}
                </p>

                <button
                    onclick="removeItem(${item.cart_item_id})"
                >
                    Remove
                </button>

            </div>

        `;


        cartContainer.appendChild(div);

    });


    cartTotal.innerHTML = `

        <h2>
            Total: ₹${total}
        </h2>

    `;
}


// ===============================
// REMOVE ITEM
// ===============================

async function removeItem(cartItemId) {

    try {

        const response =
            await fetch(
                `${API_URL}/cart/item/${cartItemId}`,
                {
                    method: "DELETE"
                }
            );

        const data =
            await response.json();

        alert(data.message);

        loadCart();

    } catch (error) {

        console.error(
            "Remove cart error:",
            error
        );

    }
}


// ===============================
// CHECKOUT
// ===============================

function goToCheckout() {

    window.location.href =
        "checkout.html";

}


// ===============================
// START
// ===============================

loadCart();