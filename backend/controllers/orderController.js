const db = require("../config/db");


// ===============================
// CREATE ORDER
// ===============================

const createOrder = (req, res) => {

    const {
        userId,
        address,
        city,
        state,
        pincode,
        paymentMethod
    } = req.body;


    // ===============================
    // VALIDATION
    // ===============================

    if (
        !userId ||
        !address ||
        !city ||
        !state ||
        !pincode ||
        !paymentMethod
    ) {

        return res.status(400).json({
            message:
                "User ID, address, city, state, pincode and payment method are required"
        });

    }


    // ===============================
    // GET CART
    // ===============================

    const cartSql = `
        SELECT
            cart.id AS cart_id,
            cart_items.product_id,
            cart_items.quantity,
            products.name,
            products.price,
            products.stock
        FROM cart
        JOIN cart_items
            ON cart.id = cart_items.cart_id
        JOIN products
            ON products.id = cart_items.product_id
        WHERE cart.user_id = ?
    `;


    db.query(
        cartSql,
        [userId],
        (err, cartItems) => {

            if (err) {

                console.error(
                    "Cart database error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to fetch cart",
                    error: err.message
                });

            }


            // ===============================
            // CHECK EMPTY CART
            // ===============================

            if (cartItems.length === 0) {

                return res.status(400).json({
                    message: "Cart is empty"
                });

            }


            // ===============================
            // CHECK STOCK
            // ===============================

            for (const item of cartItems) {

                if (item.quantity > item.stock) {

                    return res.status(400).json({
                        message:
                            `Insufficient stock for ${item.name}`
                    });

                }

            }


            // ===============================
            // CALCULATE TOTAL
            // ===============================

            let totalAmount = 0;


            cartItems.forEach((item) => {

                totalAmount +=
                    Number(item.price) *
                    Number(item.quantity);

            });


            // ===============================
            // CREATE ORDER
            // ===============================

            const orderSql = `
                INSERT INTO orders
                (
                    user_id,
                    total_amount,
                    address,
                    city,
                    state,
                    pincode,
                    payment_method,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;


            db.query(
                orderSql,
                [
                    userId,
                    totalAmount,
                    address,
                    city,
                    state,
                    pincode,
                    paymentMethod,
                    "Order Placed"
                ],

                (err, orderResult) => {

                    if (err) {

                        console.error(
                            "Order creation error:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to create order",
                            error: err.message
                        });

                    }


                    const orderId =
                        orderResult.insertId;


                    let completedItems = 0;


                    // ===============================
                    // ADD ORDER ITEMS
                    // ===============================

                    cartItems.forEach((item) => {

                        const orderItemSql = `
                            INSERT INTO order_items
                            (
                                order_id,
                                product_id,
                                quantity,
                                price
                            )
                            VALUES (?, ?, ?, ?)
                        `;


                        db.query(
                            orderItemSql,
                            [
                                orderId,
                                item.product_id,
                                item.quantity,
                                item.price
                            ],

                            (err) => {

                                if (err) {

                                    console.error(
                                        "Order item error:",
                                        err
                                    );

                                    return res.status(500).json({
                                        message:
                                            "Failed to add order items",
                                        error:
                                            err.message
                                    });

                                }


                                // ===============================
                                // UPDATE STOCK
                                // ===============================

                                const updateStockSql = `
                                    UPDATE products
                                    SET stock = stock - ?
                                    WHERE id = ?
                                `;


                                db.query(
                                    updateStockSql,
                                    [
                                        item.quantity,
                                        item.product_id
                                    ],

                                    (err) => {

                                        if (err) {

                                            console.error(
                                                "Stock update error:",
                                                err
                                            );

                                            return res.status(500).json({
                                                message:
                                                    "Failed to update stock",
                                                error:
                                                    err.message
                                            });

                                        }


                                        completedItems++;


                                        // ===============================
                                        // ALL ITEMS COMPLETED
                                        // ===============================

                                        if (
                                            completedItems ===
                                            cartItems.length
                                        ) {

                                            const cartId =
                                                cartItems[0]
                                                    .cart_id;


                                            // ===============================
                                            // CLEAR CART
                                            // ===============================

                                            const clearCartSql = `
                                                DELETE FROM cart_items
                                                WHERE cart_id = ?
                                            `;


                                            db.query(
                                                clearCartSql,
                                                [cartId],

                                                (err) => {

                                                    if (err) {

                                                        console.error(
                                                            "Clear cart error:",
                                                            err
                                                        );

                                                        return res.status(500).json({
                                                            message:
                                                                "Order created but failed to clear cart",
                                                            error:
                                                                err.message
                                                        });

                                                    }


                                                    // ===============================
                                                    // SUCCESS
                                                    // ===============================

                                                    res.status(201).json({

                                                        message:
                                                            "Order placed successfully",

                                                        orderId:
                                                            orderId,

                                                        totalAmount:
                                                            totalAmount

                                                    });

                                                }
                                            );

                                        }

                                    }
                                );

                            }
                        );

                    });

                }
            );

        }
    );

};


// ===============================
// GET USER ORDERS
// ===============================

const getUserOrders = (req, res) => {

    const userId =
        req.params.userId;


    const sql = `
        SELECT
            id,
            total_amount,
            address,
            city,
            state,
            pincode,
            payment_method,
            status,
            created_at
        FROM orders
        WHERE user_id = ?
        ORDER BY id DESC
    `;


    db.query(
        sql,
        [userId],
        (err, results) => {

            if (err) {

                console.error(
                    "Orders database error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to fetch orders",
                    error:
                        err.message
                });

            }


            res.status(200).json({

                message:
                    "Orders fetched successfully",

                orders:
                    results

            });

        }
    );

};


// ===============================
// EXPORT
// ===============================

module.exports = {
    createOrder,
    getUserOrders
};