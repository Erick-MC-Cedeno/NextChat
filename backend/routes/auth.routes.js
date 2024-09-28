import express from "express";
import multer from "multer";
import { login, logout, signup } from "../controllers/auth.controller.js";

const router = express.Router();
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

router.post("/signup", upload.single("image"), signup); 

router.post("/login", login);

router.post("/logout", logout);

export default router;
