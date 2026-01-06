import app from "./app";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;
// Use env-provided MongoDB URI in production; only fall back to local when explicitly available.
const MONGO_URI = process.env.MONGO_URI || (process.env.NODE_ENV === "production" ? "" : "mongodb://localhost:27017/farming-platform");

if (!MONGO_URI) {
    console.error("Missing MONGO_URI environment variable. Set it to your MongoDB connection string (e.g., Atlas) before starting the server.");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });
