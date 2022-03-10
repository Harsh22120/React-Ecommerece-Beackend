const mongoose = require("mongoose");

const ProductSchema = new mongoose .Schema(
    {
        title: { type: String, required: true, unique: true },
        desc: { type: String, require: true, },
        img: { type: String, required: true },
        categories: { type: Array },
        size: { type: Number },
        color: { type: String },
        price: { type: Number, required: true },
    },
);


module.exports = mongoose.model("Product", ProductSchema);