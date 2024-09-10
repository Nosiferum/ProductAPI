import {Schema, model} from "mongoose";

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
    }
})

const Product = model("Product", productSchema);
export default Product;