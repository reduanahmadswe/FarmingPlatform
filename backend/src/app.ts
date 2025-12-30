import express from "express";
import cors from "cors";
import postRoutes from "./modules/post/post.routes";
import marketRoutes from "./modules/marketplace/marketplace.routes";
import iotRoutes from "./modules/iot/iot.routes";
import authRoutes from "./modules/auth/auth.routes";
import weatherRoutes from "./modules/weather/weather.routes";

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use("/api/posts", postRoutes);
app.use("/api/marketplace", marketRoutes);
app.use("/api/iot", iotRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/weather", weatherRoutes);

app.get("/", (req, res) => {
    res.send("Farming Platform API Running");
});

export default app;
