// ===============================
// CARTIVA API URL
// ===============================

const API_URL = "http://localhost:5000/api";


// =====================================================
// ADMIN LOGIN
// =====================================================

const adminLoginForm =
    document.getElementById("adminLoginForm");

const adminLoginMessage =
    document.getElementById("adminLoginMessage");


if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const email =
                document.getElementById(
                    "adminEmail"
                ).value.trim();

            const password =
                document.getElementById(
                    "adminPassword"
                ).value;

            adminLoginMessage.textContent =
                "Logging in...";

            try {

                const response = await fetch(
                    `${API_URL}/admin/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );

                const data =
                    await response.json();


                if (response.ok) {

                    adminLoginMessage.textContent =
                        data.message;

                    localStorage.setItem(
                        "cartivaAdmin",
                        JSON.stringify(data.admin)
                    );

                    setTimeout(() => {

                        window.location.href =
                            "admin-dashboard.html";

                    }, 1000);

                } else {

                    adminLoginMessage.textContent =
                        data.message ||
                        "Admin login failed.";

                }

            } catch (error) {

                console.error(
                    "Admin login error:",
                    error
                );

                adminLoginMessage.textContent =
                    "Unable to connect to server.";

            }

        }
    );

}


// =====================================================
// ADMIN DASHBOARD
// =====================================================

const adminWelcome =
    document.getElementById("adminWelcome");

const adminLogout =
    document.getElementById("adminLogout");


const savedAdmin =
    localStorage.getItem("cartivaAdmin");


if (!savedAdmin) {

    if (
        window.location.pathname.includes(
            "admin-dashboard.html"
        )
    ) {

        window.location.href =
            "admin-login.html";

    }

} else {

    const admin =
        JSON.parse(savedAdmin);

    if (adminWelcome) {

        adminWelcome.textContent =
            `Welcome, ${admin.name}`;

    }

}


// =====================================================
// ADMIN LOGOUT
// =====================================================

if (adminLogout) {

    adminLogout.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            localStorage.removeItem(
                "cartivaAdmin"
            );

            window.location.href =
                "admin-login.html";

        }
    );

}


// =====================================================
// ADMIN PRODUCT MANAGEMENT
// =====================================================

const productForm =
    document.getElementById("productForm");

const adminProductsContainer =
    document.getElementById(
        "adminProductsContainer"
    );

const productMessage =
    document.getElementById(
        "productMessage"
    );


// =====================================================
// LOAD ADMIN PRODUCTS
// =====================================================

async function loadAdminProducts() {

    if (!adminProductsContainer) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/products`
        );

        const data =
            await response.json();


        if (!response.ok) {

            adminProductsContainer.innerHTML =
                "<p>Failed to load products.</p>";

            return;
        }


        displayAdminProducts(
            data.products
        );

    } catch (error) {

        console.error(
            "Admin products error:",
            error
        );

        adminProductsContainer.innerHTML =
            "<p>Unable to connect to server.</p>";

    }

}


// =====================================================
// DISPLAY PRODUCTS
// =====================================================

function displayAdminProducts(products) {

    adminProductsContainer.innerHTML = "";


    if (products.length === 0) {

        adminProductsContainer.innerHTML =
            "<p>No products available.</p>";

        return;
    }


    products.forEach((product) => {

        const productCard =
            document.createElement("div");

        productCard.className =
            "dashboard-card";


        productCard.innerHTML = `

            <h3>
                ${product.name}
            </h3>

            <p>
                Category ID:
                ${product.category_id}
            </p>

            <p>
                Price:
                ₹${product.price}
            </p>

            <p>
                Discount:
                ${product.discount}%
            </p>

            <p>
                Stock:
                ${product.stock}
            </p>

            <p>
                ${product.description}
            </p>

            <button
                class="admin-button"
                onclick="deleteProduct(${product.id})"
            >
                Delete Product
            </button>

        `;


        adminProductsContainer.appendChild(
            productCard
        );

    });

}


// =====================================================
// ADD PRODUCT
// =====================================================

if (productForm) {

    productForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const name =
                document.getElementById(
                    "productName"
                ).value.trim();

            const category_id =
                document.getElementById(
                    "categoryId"
                ).value;

            const description =
                document.getElementById(
                    "productDescription"
                ).value.trim();

            const price =
                document.getElementById(
                    "productPrice"
                ).value;

            const discount =
                document.getElementById(
                    "productDiscount"
                ).value || 0;

            const stock =
                document.getElementById(
                    "productStock"
                ).value;

            const image =
                document.getElementById(
                    "productImage"
                ).value.trim();


            productMessage.textContent =
                "Adding product...";


            try {

                const response = await fetch(
                    `${API_URL}/products`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            name: name,

                            category_id:
                                Number(category_id),

                            description:
                                description,

                            price:
                                Number(price),

                            discount:
                                Number(discount),

                            stock:
                                Number(stock),

                            image:
                                image || null

                        })
                    }
                );


                const data =
                    await response.json();


                if (response.ok) {

                    productMessage.textContent =
                        data.message;


                    productForm.reset();


                    loadAdminProducts();

                } else {

                    productMessage.textContent =
                        data.message ||
                        "Failed to add product.";

                }

            } catch (error) {

                console.error(
                    "Add product error:",
                    error
                );

                productMessage.textContent =
                    "Unable to connect to server.";

            }

        }
    );

}


// =====================================================
// DELETE PRODUCT
// =====================================================

async function deleteProduct(productId) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/products/${productId}`,
            {
                method: "DELETE"
            }
        );


        const data =
            await response.json();


        if (response.ok) {

            alert(
                data.message
            );

            loadAdminProducts();

        } else {

            alert(
                data.message ||
                "Failed to delete product."
            );

        }

    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );

        alert(
            "Unable to connect to server."
        );

    }

}


// =====================================================
// LOAD PRODUCTS WHEN PAGE OPENS
// =====================================================

loadAdminProducts();