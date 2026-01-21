import express from "express";
import {
  createResource,
  getUserResources,
  getResourceById,
  updateResource,
  deleteResource,
  generateSummary,
} from "../controllers/resourceController";

const router = express.Router();

router.route("/").get(getUserResources).post(createResource);

router
  .route("/:id")
  .get(getResourceById)
  .patch(updateResource)
  .delete(deleteResource);

router.post("/:id/summary", generateSummary);

export default router;
