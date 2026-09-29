// Single source of truth for seeded categories/products (used by the image
// generator and by scripts/seed-sql.js which builds database/seed.sql).
const CATEGORIES = [
    { id: 1, name: "Electronics", slug: "electronics", palette: "electronics", kind: "laptop" },
    { id: 2, name: "Fashion", slug: "fashion", palette: "fashion", kind: "tshirt" },
    { id: 3, name: "Home & Kitchen", slug: "home-kitchen", palette: "home", kind: "kettle" },
    { id: 4, name: "Beauty & Care", slug: "beauty-care", palette: "beauty", kind: "perfume" },
    { id: 5, name: "Sports & Fitness", slug: "sports-fitness", palette: "sports", kind: "dumbbell" },
    { id: 6, name: "Books & Stationery", slug: "books-stationery", palette: "books", kind: "book" }
];

const P = (category_id, palette, kind, name, price, discount, stock, description) => ({
    category_id, palette, kind, name, price, discount, stock, description,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
});

const PRODUCTS = [
    P(1, "electronics", "headphones", "Wireless Noise-Cancelling Headphones", 2999, 10, 50, "Over-ear Bluetooth headphones with active noise cancelling and 30-hour battery life."),
    P(1, "electronics", "watch", "Smart Fitness Watch", 4999, 15, 30, "Heart-rate, sleep and step tracking with a bright AMOLED display and 7-day battery."),
    P(1, "electronics", "speaker", "Portable Bluetooth Speaker", 1999, 20, 80, "Water-resistant 360-degree speaker with deep bass and 12 hours of playtime."),
    P(1, "electronics", "laptop", "Ultra-Slim Laptop 14 inch", 54999, 8, 15, "Lightweight 14-inch laptop, 16 GB RAM, 512 GB SSD, all-day battery."),
    P(2, "fashion", "shoe", "Lightweight Running Shoes", 1999, 0, 100, "Breathable mesh running shoes with cushioned midsole and grippy outsole."),
    P(2, "fashion", "tshirt", "Classic Cotton T-Shirt", 599, 25, 200, "Soft 100% combed-cotton crew-neck tee in a regular fit."),
    P(2, "fashion", "jacket", "Windproof Casual Jacket", 3499, 30, 40, "Water-repellent, windproof jacket with zip pockets, ideal for all seasons."),
    P(2, "fashion", "sunglasses", "Polarised Sunglasses", 1299, 12, 60, "UV400 polarised lenses in a lightweight, durable frame."),
    P(3, "home", "lamp", "Modern Table Lamp", 1499, 15, 45, "Warm-light bedside lamp with a fabric shade and sturdy metal base."),
    P(3, "home", "kettle", "Electric Kettle 1.8L", 1199, 10, 70, "Fast-boil stainless-steel kettle with auto shut-off and boil-dry protection."),
    P(3, "home", "pan", "Non-Stick Frying Pan", 899, 20, 90, "Induction-friendly 28 cm non-stick pan with a heat-resistant handle."),
    P(3, "home", "pillow", "Memory Foam Pillow", 999, 18, 55, "Ergonomic memory-foam pillow that supports neck and shoulders."),
    P(4, "beauty", "cream", "Daily Moisturising Cream", 449, 10, 120, "Lightweight 24-hour hydrating cream for all skin types."),
    P(4, "beauty", "perfume", "Eau de Parfum 50ml", 2499, 22, 35, "Long-lasting floral-woody fragrance in a 50 ml glass bottle."),
    P(4, "beauty", "lipstick", "Matte Lipstick", 599, 0, 150, "Highly pigmented, non-drying matte lipstick that lasts through the day."),
    P(4, "beauty", "serum", "Vitamin C Face Serum", 799, 15, 85, "Brightening 10% Vitamin C serum with hyaluronic acid."),
    P(5, "sports", "dumbbell", "Adjustable Dumbbell Set", 3999, 12, 25, "Space-saving adjustable dumbbells, 2-20 kg per hand, with a storage tray."),
    P(5, "sports", "yogamat", "Anti-Slip Yoga Mat", 999, 20, 75, "6 mm thick, non-slip, eco-friendly TPE yoga mat with a carry strap."),
    P(5, "sports", "bottle", "Insulated Water Bottle 1L", 699, 5, 110, "Double-wall steel bottle that keeps drinks cold for 24 h or hot for 12 h."),
    P(5, "sports", "football", "Match Football Size 5", 1199, 10, 65, "Machine-stitched size-5 football with durable synthetic cover."),
    P(6, "books", "book", "The Art of Focus (Paperback)", 399, 0, 140, "A practical guide to deep work, habits and productivity."),
    P(6, "books", "notebook", "Hardcover Ruled Notebook", 249, 10, 300, "A5 hardcover notebook, 200 pages of 100 gsm acid-free paper."),
    P(6, "books", "pen", "Premium Gel Pen Set of 5", 199, 0, 400, "Smooth-writing 0.5 mm gel pens in five colours."),
    P(6, "books", "backpack", "Everyday Laptop Backpack", 1799, 25, 50, "Water-resistant 25 L backpack with padded laptop sleeve and USB port.")
];

module.exports = { CATEGORIES, PRODUCTS };
