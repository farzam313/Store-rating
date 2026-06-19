import express from "express";
import cors from "cors";
import userRoutes from "./src/routes/user.routes.js";
import reviewRoutes from "./src/routes/review.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import storeRoutes from "./src/routes/store.routes.js";

const app = express();
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
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
app.use("/stores", storeRoutes);

const PORT = process.env.PORT || 4000;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!", error: err.message });
});

// Start server with error handling
const server = app
  .listen(PORT, () => {
    console.log(`🚀 The Server is Running on localhost:${PORT}`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Please try a different port or stop the other process.`,
      );
    } else {
      console.error("Failed to start server:", err);
    }
    process.exit(1);
  });
