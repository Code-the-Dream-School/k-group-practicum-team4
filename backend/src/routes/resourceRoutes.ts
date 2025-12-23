import express from "express";
import { createResource } from "../controllers/resourceController";
import { mockAuth } from "../middleware/auth";

const router = express.Router();

// Apply mock auth to all resource routes
router.use(mockAuth);

// POST /api/resources - Create resource with plain text
router.post("/", createResource);

export default router;
