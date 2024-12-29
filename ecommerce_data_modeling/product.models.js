import mongoose from "mongoose"
import { Category } from "./category.models"

const productScheama = new mongoose.Schema({
    description: { // order does not matter 
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    productImage: {
        type: String
    },
    price: {
        type: Number,
        default: 0,
    },
    stock: {
        default: 0,
        type: Number
    },
    Category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    onwer:{
        type: mongoose.schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true})

export const Product = mongoose.model("Product",productScheama)