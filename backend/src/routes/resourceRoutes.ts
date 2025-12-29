import express from "express";
import {
  createResource,
  getUserResources,
  getResourceById,
  updateResource,
  deleteResource,
} from "../controllers/resourceController";
import { mockAuth } from "../middleware/auth";

const router = express.Router();

// Apply mock auth to all resource routes (replace with real auth middleware later)
router.use(mockAuth);

router
  .route("/")
  .get(getUserResources)
  .post(createResource);

router
  .route("/:id")
  .get(getResourceById)
  .patch(updateResource)
  .delete(deleteResource);

export default router;
