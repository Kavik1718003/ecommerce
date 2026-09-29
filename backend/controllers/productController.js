const db = require("../config/db");


// ===============================
// GET ALL PRODUCTS
// ===============================

const getAllProducts = (req, res) => {

    const sql = `
        SELECT
            id,
            name,
            category_id,
            description,
            price,
            discount,
            stock,
            image,
            created_at
        FROM products
        ORDER BY id DESC
    `;


    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "Products database error:",
                err
            );

            return res.status(500).json({
                message: "Failed to fetch products",
                error: err.message
            });
        }


        res.status(200).json({

            message:
                "Products fetched successfully",

            products: results

        });

    });

};


// ===============================
// GET PRODUCT BY ID
// ===============================

const getProductById = (req, res) => {

    const productId =
        req.params.id;


    const sql = `
        SELECT
            id,
            name,
            category_id,
            description,
            price,
            discount,
            stock,
            image,
            created_at
        FROM products
        WHERE id = ?
    `;


    db.query(
        sql,
        [productId],
        (err, results) => {

            if (err) {

                console.error(
                    "Product database error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to fetch product",
                    error:
                        err.message
                });

            }


            if (results.length === 0) {

                return res.status(404).json({
                    message:
                        "Product not found"
                });

            }


            res.status(200).json({

                message:
                    "Product fetched successfully",

                product:
                    results[0]

            });

        }
    );

};


// ===============================
// ADD PRODUCT
// ===============================

const addProduct = (req, res) => {

    const {
        name,
        category_id,
        description,
        price,
        discount,
        stock,
        image
    } = req.body;


    // Check required fields

    if (
        !name ||
        !category_id ||
        !description ||
        price === undefined ||
        stock === undefined
    ) {

        return res.status(400).json({

            message:
                "Name, category, description, price and stock are required"

        });

    }


    const sql = `
        INSERT INTO products
        (
            name,
            category_id,
            description,
            price,
            discount,
            stock,
            image
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;


    db.query(
        sql,
        [
            name,
            category_id,
            description,
            price,
            discount || 0,
            stock,
            image || null
        ],
        (err, result) => {

            if (err) {

                console.error(
                    "Add product database error:",
                    err
                );

                return res.status(500).json({

                    message:
                        "Failed to add product",

                    error:
                        err.message

                });

            }


            res.status(201).json({

                message:
                    "Product added successfully",

                productId:
                    result.insertId

            });

        }
    );

};


// ===============================
// DELETE PRODUCT
// ===============================

const deleteProduct = (req, res) => {

    const productId =
        req.params.id;


    const sql =
        "DELETE FROM products WHERE id = ?";


    db.query(
        sql,
        [productId],
        (err, result) => {

            if (err) {

                console.error(
                    "Delete product error:",
                    err
                );

                return res.status(500).json({

                    message:
                        "Failed to delete product",

                    error:
                        err.message

                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({

                    message:
                        "Product not found"

                });

            }


            res.status(200).json({

                message:
                    "Product deleted successfully"

            });

        }
    );

};


// ===============================
// EXPORT
// ===============================

module.exports = {

    getAllProducts,
    getProductById,
    addProduct,
    deleteProduct

};