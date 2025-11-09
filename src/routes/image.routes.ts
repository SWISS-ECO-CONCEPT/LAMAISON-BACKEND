import { Router } from "express";
import multer from "multer";
import path from "path";
import { createImage } from "../controllers/image.controller"


const router = Router();

// config multer (local dev)
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Upload only
router.post("/", upload.single("file"), createImage);

export default router;