import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config()

const { URL } = process.env

async function connectDB() {
    try {
        await mongoose.connect(URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully!');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit process with failure
    }
}

export const getObjString = async (id) => {
    return new mongoose.Types.ObjectId(id);
}

export default connectDB;