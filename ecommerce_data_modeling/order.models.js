import mongoose from " mongoose"
// second model in a single file because it is used in this schema only
const orderItemSchema = new mongoose.Schema({
    ProductId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    quantity: {
        type: Number,
        required: true
    },
})

const orderSchema = new mongoose.schema({
    orderPrice: {
        type: Number,
        required: true
    },
    customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    orderItems: {
        type:[orderItemSchema] 
    },
    address: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending","cancelled","delivered"],// enum matlab choise 
        default: "pending"
    }
},{timestamps: true})

export const Order = mongoose.model("Order",orderSchema)