import mongoose,{Schema} from "mongoose";

const subscriptionShema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscripting
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // one who the subscripter is subscriping
        ref: "User"
    },
},{timestamps: true})


export const Subscription = mongoose.model("subscription",subscriptionShema)

