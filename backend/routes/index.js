import { Router } from "express";

import authRoutes from "./auth.js";
import productRoutes from "./products.js";
import orderRoutes from "./order.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);

router.get("/health", (req, res) =>
  res.json({ status: "ok", time: new Date() })
);

export default router;