const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    Products: [
        {
            productId: { type: String,},
            quantity:{
                type: String,
                default: 1,
            },
        },
    ],
    amount: {type: Number, required: true},
    address:{type: Object, required: true},
    status:{type: String, default: "pending"},
},
    { timeseries: true}
);
module.exports = mongoose.model("Order", OrderSchema);