import express from "express";
import { askAi } from "../controllers/ai.controller";

const router = express.Router();

router.post("/ai/ask", askAi);

export default router;
