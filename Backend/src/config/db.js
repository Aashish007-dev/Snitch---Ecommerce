import mongoose from "mongoose";
import { config } from "./config.js";


export const connectToDB = async () => {
    try {
        await mongoose.connect(config.MONGODB_URI);
        console.log("MongoDB Connected")
    } catch (error) {
        console.log("Error in Connect to DB:", error)
    }
}