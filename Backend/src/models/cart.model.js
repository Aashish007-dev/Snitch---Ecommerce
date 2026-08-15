import mongoose from "mongoose";
import priceSchema from "./price.schema.js";

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user"
    },

    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "product"
            },

            variant: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "variant"
            },
            quantity: {
                type: Number,
                default: 1
            },
            price: {
                type: priceSchema,
                required: true
            }
        }
    ]


})




const cartModel = mongoose.model("cart", cartSchema);

export default cartModel;