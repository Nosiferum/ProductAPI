import {Schema, model} from "mongoose";

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price must be a positive number"]
    }
}, {strict: "throw"})

const Product = model("Product", productSchema);
export default Product;