const mongoose = require ("mongoose");
//console.log("payment Model is getting called ")
const PaymentSchema = new mongoose.Schema(
    {
        UserId: { type: String, required: true},
        productId: { type: String, required: true},
        paymentId: { type: String, required: true},
        cartId: { type: String, required: true},
        orderId: { type: String, required: true}
    }
);
module.exports = mongoose.model("Payment", PaymentSchema);