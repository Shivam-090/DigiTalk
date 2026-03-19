import mongoose from "mongoose";
import { seedAdminFromEnv } from "./seedAdmin.js";


export const connectDB = async ()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`)
        await seedAdminFromEnv();
    }catch (error){
        console.log("Error in connecting to MongoDB", error);
        process.exit(1); // 1 means Failure

    }
}
