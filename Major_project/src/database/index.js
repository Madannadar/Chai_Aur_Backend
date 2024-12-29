import mongoose from 'mongoose';
import { DB_NAME } from "../constents.js"

const connectDB = async () => {
    try {
        // console.log(process.env.MONGODB_URI);
        console.log(DB_NAME);
        
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`/n MongoDB connected !! DB Host: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("error in db connection",error);
        process.exit(1)
    }
}

export default connectDB;