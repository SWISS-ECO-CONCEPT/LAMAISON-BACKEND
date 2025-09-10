import { Router } from "express";
import multer from "multer";
import path from "path";
import * as imageController from "../controllers/image.controller"

import { isAuthenticated } from "../middlewares/auth.middleware";

const router = Router();

// config multer (local dev)
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// CRUD
router.post("/", isAuthenticated, upload.single("file"), imageController.createImage);
router.get("/", imageController.getAllImages);
router.get("/:id", imageController.getImageById);
router.put("/:id", isAuthenticated, imageController.updateImage);
router.delete("/:id", isAuthenticated, imageController.deleteImage);

export default router;