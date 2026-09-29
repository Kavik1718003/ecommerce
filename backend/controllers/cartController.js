const db = require("../config/db");


// ===============================
// GET USER CART
// ===============================

const getCart = (req, res) => {

    const userId = req.params.userId;

    const sql = `
        SELECT
            cart.id AS cart_id,
            cart_items.id AS cart_item_id,
            products.id AS product_id,
            products.name,
            products.price,
            products.discount,
            products.image,
            cart_items.quantity
        FROM cart
        JOIN cart_items
            ON cart.id = cart_items.cart_id
        JOIN products
            ON products.id = cart_items.product_id
        WHERE cart.user_id = ?
    `;

    db.query(
        sql,
        [userId],
        (err, results) => {

            if (err) {

                return res.status(500).json({
                    message: "Failed to fetch cart",
                    error: err.message
                });
            }

            res.status(200).json({
                message: "Cart fetched successfully",
                cart: results
            });

        }
    );
};


// ===============================
// ADD TO CART
// ===============================

const addToCart = (req, res) => {

    const { userId, productId, quantity } =
        req.body;

    if (!userId || !productId || !quantity) {

        return res.status(400).json({
            message:
                "userId, productId and quantity are required"
        });
    }

    const findCartSql =
        "SELECT id FROM cart WHERE user_id = ?";

    db.query(
        findCartSql,
        [userId],
        (err, cartResults) => {

            if (err) {

                return res.status(500).json({
                    message: "Database error",
                    error: err.message
                });
            }

            const createOrUseCart = () => {

                const cartId =
                    cartResults.length > 0
                        ? cartResults[0].id
                        : null;

                if (cartId) {

                    insertCartItem(cartId);

                } else {

                    const createCartSql =
                        "INSERT INTO cart (user_id) VALUES (?)";

                    db.query(
                        createCartSql,
                        [userId],
                        (err, result) => {

                            if (err) {

                                return res.status(500).json({
                                    message:
                                        "Failed to create cart",
                                    error: err.message
                                });
                            }

                            insertCartItem(
                                result.insertId
                            );
                        }
                    );
                }
            };


            const insertCartItem = (cartId) => {

                const checkItemSql = `
                    SELECT id, quantity
                    FROM cart_items
                    WHERE cart_id = ?
                    AND product_id = ?
                `;

                db.query(
                    checkItemSql,
                    [cartId, productId],
                    (err, itemResults) => {

                        if (err) {

                            return res.status(500).json({
                                message:
                                    "Database error",
                                error: err.message
                            });
                        }

                        if (itemResults.length > 0) {

                            const newQuantity =
                                itemResults[0].quantity +
                                Number(quantity);

                            const updateSql = `
                                UPDATE cart_items
                                SET quantity = ?
                                WHERE id = ?
                            `;

                            db.query(
                                updateSql,
                                [
                                    newQuantity,
                                    itemResults[0].id
                                ],
                                (err) => {

                                    if (err) {

                                        return res.status(500).json({
                                            message:
                                                "Failed to update cart",
                                            error: err.message
                                        });
                                    }

                                    res.status(200).json({
                                        message:
                                            "Cart updated successfully"
                                    });
                                }
                            );

                        } else {

                            const insertSql = `
                                INSERT INTO cart_items
                                (cart_id, product_id, quantity)
                                VALUES (?, ?, ?)
                            `;

                            db.query(
                                insertSql,
                                [
                                    cartId,
                                    productId,
                                    quantity
                                ],
                                (err) => {

                                    if (err) {

                                        return res.status(500).json({
                                            message:
                                                "Failed to add item",
                                            error: err.message
                                        });
                                    }

                                    res.status(201).json({
                                        message:
                                            "Product added to cart"
                                    });
                                }
                            );
                        }

                    }
                );
            };


            createOrUseCart();

        }
    );
};


// ===============================
// REMOVE CART ITEM
// ===============================

const removeCartItem = (req, res) => {

    const cartItemId = req.params.id;

    const sql =
        "DELETE FROM cart_items WHERE id = ?";

    db.query(
        sql,
        [cartItemId],
        (err) => {

            if (err) {

                return res.status(500).json({
                    message: "Failed to remove cart item",
                    error: err.message
                });
            }

            res.status(200).json({
                message: "Cart item removed"
            });

        }
    );
};


module.exports = {
    getCart,
    addToCart,
    removeCartItem
};