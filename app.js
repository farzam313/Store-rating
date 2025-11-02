import express from "express";
import cors from "cors";
import userRoutes from "./src/routes/user.routes.js";
import reviewRoutes from "./src/routes/review.routes.js";
import authRoutes from "./src/routes/auth.routes.js";

const app = express();
const corsOptions = {
  origin: ["http://localhost:5174"],
  credentials: true,
  methods: "GET,PUT,POST,OPTIONS,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Application is Running... 🚀" });
});
app.use("/users", userRoutes);
app.use("/reviews", reviewRoutes);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 The Server is Running on localhost:${PORT}`);
});
