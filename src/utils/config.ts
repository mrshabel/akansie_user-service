import mongoose from "mongoose";

export async function connectDb() {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log("database connection successful");
    } catch (error) {
        console.error("Database connection failed:\n", error);
        // process.exit(1);
    }
}
