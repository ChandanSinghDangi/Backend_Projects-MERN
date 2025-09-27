import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        console.log(`MongoDB connected :: DB HOST :: ${connectionInstance}`); // look at this in console .....
        
        console.log(`MongoDB connected :: DB HOST :: ${connectionInstance.connection.host}`);

    } catch (error) {
        console.log('MONGODB Connection Failed Error :: ', error);
        process.exit(1) // what is this??
    }
}

export default connectDB;
