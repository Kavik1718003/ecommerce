const API_URL = "http://localhost:5000/api";

const productsContainer = document.getElementById("productsContainer");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const productCount = document.getElementById("productCount");

let allProducts = [];


/* =====================================================
   PRODUCT IMAGE LINKS
   50 PRODUCTS
===================================================== */

const productImages = {

    /* =================================================
       ORIGINAL PRODUCTS
    ================================================= */

    1: "https://loremflickr.com/600/600/wireless,headphones?lock=101",

    2: "https://loremflickr.com/600/600/smartwatch?lock=102",

    3: "https://loremflickr.com/600/600/cotton,tshirt?lock=103",

    4: "https://loremflickr.com/600/600/kitchen,storage?lock=104",

    5: "https://loremflickr.com/600/600/face,care?lock=105",

    6: "https://loremflickr.com/600/600/web,development,book?lock=106",


    /* =================================================
       ELECTRONICS
    ================================================= */

    52: "https://loremflickr.com/600/600/wireless,mouse?lock=152",

    53: "https://loremflickr.com/600/600/mechanical,keyboard?lock=153",

    54: "https://loremflickr.com/600/600/bluetooth,speaker?lock=154",

    55: "https://loremflickr.com/600/600/power,bank?lock=155",

    56: "https://loremflickr.com/600/600/webcam?lock=156",

    57: "https://loremflickr.com/600/600/usb,hub?lock=157",

    58: "https://loremflickr.com/600/600/gaming,headset?lock=158",

    59: "https://loremflickr.com/600/600/phone,stand?lock=159",

    60: "https://loremflickr.com/600/600/portable,ssd?lock=160",


    /* =================================================
       FASHION
    ================================================= */

    61: "https://loremflickr.com/600/600/slim,fit,jeans?lock=161",

    62: "https://loremflickr.com/600/600/cotton,casual,shirt?lock=162",

    63: "https://loremflickr.com/600/600/women,casual,dress?lock=163",

    64: "https://loremflickr.com/600/600/running,shoes?lock=164",

    65: "https://loremflickr.com/600/600/sports,tshirt?lock=165",

    66: "https://loremflickr.com/600/600/hooded,sweatshirt?lock=166",

    67: "https://loremflickr.com/600/600/leather,wallet?lock=167",

    68: "https://loremflickr.com/600/600/women,handbag?lock=168",

    69: "https://loremflickr.com/600/600/formal,trousers?lock=169",


    /* =================================================
       HOME & KITCHEN
    ================================================= */

    70: "https://loremflickr.com/600/600/nonstick,frying,pan?lock=170",

    71: "https://loremflickr.com/600/600/kitchen,knife,set?lock=171",

    72: "https://loremflickr.com/600/600/electric,kettle?lock=172",

    73: "https://loremflickr.com/600/600/stainless,steel,bottle?lock=173",

    74: "https://loremflickr.com/600/600/dinner,plate,set?lock=174",

    75: "https://loremflickr.com/600/600/storage,container,set?lock=175",

    76: "https://loremflickr.com/600/600/led,table,lamp?lock=176",

    77: "https://loremflickr.com/600/600/cotton,bedsheet?lock=177",

    78: "https://loremflickr.com/600/600/kitchen,organizer?lock=178",


    /* =================================================
       BEAUTY
    ================================================= */

    79: "https://loremflickr.com/600/600/face,wash?lock=179",

    80: "https://loremflickr.com/600/600/moisturizing,cream?lock=180",

    81: "https://loremflickr.com/600/600/sunscreen,spf?lock=181",

    82: "https://loremflickr.com/600/600/lip,balm?lock=182",

    83: "https://loremflickr.com/600/600/hair,shampoo?lock=183",

    84: "https://loremflickr.com/600/600/body,lotion?lock=184",

    85: "https://loremflickr.com/600/600/makeup,brush,set?lock=185",

    86: "https://loremflickr.com/600/600/perfume?lock=186",


    /* =================================================
       BOOKS
    ================================================= */

    87: "https://loremflickr.com/600/600/java,programming,book?lock=187",

    88: "https://loremflickr.com/600/600/python,programming,book?lock=188",

    89: "https://loremflickr.com/600/600/javascript,book?lock=189",

    90: "https://loremflickr.com/600/600/database,book?lock=190",

    91: "https://loremflickr.com/600/600/web,development,book?lock=191",


    /* =================================================
       ACCESSORIES
    ================================================= */

    92: "https://loremflickr.com/600/600/laptop,sleeve?lock=192",

    93: "https://loremflickr.com/600/600/phone,case?lock=193",

    94: "https://loremflickr.com/600/600/usb,flash,drive?lock=194",

    95: "https://loremflickr.com/600/600/wireless,charger?lock=195",

    96: "https://loremflickr.com/600/600/cable,organizer?lock=196"
};


/* =====================================================
   FALLBACK IMAGE
===================================================== */

function getFallbackImage(productId) {

    return `https://loremflickr.com/600/600/product,shopping?lock=fallback${productId}`;

}


/* =====================================================
   LOAD PRODUCTS
===================================================== */

async function loadProducts() {

    try {

        productsContainer.innerHTML = `
            <p class="product-message">
                Loading products...
            </p>
        `;


        const response = await fetch(
            `${API_URL}/products`
        );


        const data = await response.json();


        if (!response.ok) {

            productsContainer.innerHTML = `
                <p class="product-message">
                    ${data.message || "Failed to load products."}
                </p>
            `;

            return;
        }


        allProducts = data.products || [];


        displayProducts(allProducts);

    }

    catch (error) {

        console.error(
            "Product loading error:",
            error
        );


        productsContainer.innerHTML = `
            <p class="product-message">
                Unable to connect to the server.
            </p>
        `;

    }

}


/* =====================================================
   DISPLAY PRODUCTS
===================================================== */

function displayProducts(products) {

    productsContainer.innerHTML = "";


    /* -----------------------------------------------
       PRODUCT COUNT
    ------------------------------------------------ */

    if (productCount) {

        productCount.textContent =
            `${products.length} product${products.length !== 1 ? "s" : ""} found`;

    }


    /* -----------------------------------------------
       NO PRODUCTS
    ------------------------------------------------ */

    if (products.length === 0) {

        productsContainer.innerHTML = `
            <p class="product-message">
                No products found.
            </p>
        `;

        return;
    }


    /* -----------------------------------------------
       DISPLAY EACH PRODUCT
    ------------------------------------------------ */

    products.forEach((product) => {

        const productCard =
            document.createElement("div");


        productCard.className =
            "product-card";


        /* -------------------------------------------
           PRICE
        -------------------------------------------- */

        const price =
            Number(product.price);


        /* -------------------------------------------
           DISCOUNT
        -------------------------------------------- */

        const discount =
            Number(product.discount || 0);


        /* -------------------------------------------
           DISCOUNTED PRICE
        -------------------------------------------- */

        const discountedPrice =
            price -
            (price * discount / 100);


        /* -------------------------------------------
           STOCK
        -------------------------------------------- */

        const stock =
            Number(product.stock);


        /* -------------------------------------------
           IMAGE
        -------------------------------------------- */

        const imageUrl =
            productImages[product.id] ||
            getFallbackImage(product.id);


        /* -------------------------------------------
           STOCK CLASS
        -------------------------------------------- */

        let stockClass = "";

        let stockText = "";


        if (stock <= 0) {

            stockClass =
                "out-of-stock";

            stockText =
                "Out of Stock";

        }

        else if (stock <= 5) {

            stockClass =
                "low-stock";

            stockText =
                `Only ${stock} left`;

        }

        else {

            stockText =
                `In Stock (${stock})`;

        }


        /* -------------------------------------------
           PRODUCT CARD HTML
        -------------------------------------------- */

        productCard.innerHTML = `

            <div class="product-image-container">


                ${
                    discount > 0
                        ? `
                            <span class="discount-badge">
                                ${discount}% OFF
                            </span>
                          `
                        : ""
                }


                <img

                    class="product-image"

                    src="${imageUrl}"

                    alt="${product.name}"

                    loading="lazy"

                    onerror="
                        this.onerror = null;
                        this.src = getFallbackImage(${product.id});
                    "

                >

            </div>


            <div class="product-content">


                <h2 class="product-name">

                    ${product.name}

                </h2>


                <p class="product-description">

                    ${
                        product.description ||
                        "No description available."
                    }

                </p>


                <div class="product-price">


                    <span class="current-price">

                        ₹${discountedPrice.toFixed(2)}

                    </span>


                    ${
                        discount > 0
                            ? `
                                <span class="original-price">

                                    ₹${price.toFixed(2)}

                                </span>
                              `
                            : ""
                    }


                </div>


                <p class="product-stock ${stockClass}">

                    ${stockText}

                </p>


                <div class="product-actions">


                    <button

                        class="view-product-button"

                        onclick="
                            viewProduct(${product.id})
                        "

                    >

                        View Details

                    </button>


                    <button

                        class="add-cart-button"

                        onclick="
                            addToCart(${product.id})
                        "

                        ${stock <= 0 ? "disabled" : ""}

                    >

                        ${
                            stock <= 0
                                ? "Out of Stock"
                                : "Add to Cart"
                        }

                    </button>


                </div>


            </div>

        `;


        productsContainer.appendChild(
            productCard
        );

    });

}


/* =====================================================
   VIEW PRODUCT DETAILS
===================================================== */

function viewProduct(productId) {

    window.location.href =
        `product-details.html?id=${productId}`;

}


/* =====================================================
   ADD TO CART
===================================================== */

async function addToCart(productId) {

    /* -----------------------------------------------
       CHECK LOGIN
    ------------------------------------------------ */

    const savedUser =
        localStorage.getItem("cartivaUser");


    if (!savedUser) {

        alert(
            "Please login first."
        );


        window.location.href =
            "login.html";


        return;
    }


    /* -----------------------------------------------
       GET USER
    ------------------------------------------------ */

    let user;

    try {

        user =
            JSON.parse(savedUser);

    }

    catch (error) {

        console.error(
            "User data error:",
            error
        );


        localStorage.removeItem(
            "cartivaUser"
        );


        window.location.href =
            "login.html";


        return;
    }


    /* -----------------------------------------------
       SEND CART REQUEST
    ------------------------------------------------ */

    try {

        const response =
            await fetch(
                `${API_URL}/cart/add`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            userId:
                                user.id,

                            productId:
                                productId,

                            quantity:
                                1

                        })

                }
            );


        const data =
            await response.json();


        if (response.ok) {

            alert(
                data.message ||
                "Product added to cart successfully."
            );

        }

        else {

            alert(
                data.message ||
                "Failed to add product to cart."
            );

        }

    }

    catch (error) {

        console.error(
            "Add to cart error:",
            error
        );


        alert(
            "Unable to connect to the server."
        );

    }

}


/* =====================================================
   FILTER PRODUCTS
   SEARCH + CATEGORY
===================================================== */

function filterProducts() {


    /* -----------------------------------------------
       SEARCH TEXT
    ------------------------------------------------ */

    const searchText =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    /* -----------------------------------------------
       SELECTED CATEGORY
    ------------------------------------------------ */

    const selectedCategory =
        categoryFilter
            ? categoryFilter.value
            : "all";


    /* -----------------------------------------------
       FILTER
    ------------------------------------------------ */

    const filteredProducts =
        allProducts.filter(
            (product) => {


                /* -------------------------------
                   SEARCH MATCH
                -------------------------------- */

                const productName =
                    (product.name || "")
                        .toLowerCase();


                const productDescription =
                    (product.description || "")
                        .toLowerCase();


                const matchesSearch =
                    productName.includes(searchText) ||
                    productDescription.includes(searchText);


                /* -------------------------------
                   CATEGORY MATCH
                -------------------------------- */

                const matchesCategory =
                    selectedCategory === "all" ||
                    String(product.category_id) ===
                    String(selectedCategory);


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    displayProducts(
        filteredProducts
    );

}


/* =====================================================
   SEARCH EVENT
===================================================== */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterProducts
    );

}


/* =====================================================
   CATEGORY FILTER EVENT
===================================================== */

if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        filterProducts
    );

}


/* =====================================================
   START APPLICATION
===================================================== */

loadProducts();