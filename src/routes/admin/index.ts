// src/routes/admin/index.ts
import { Router } from "express";
import authRouter from "./auth";
import usersRouter from "./users";
import uploadsRouter from "./uploads";
import colorsAdmin from "./colors";
import projectsAdmin from "./projects";

const router = Router();

// ROTAS ADMIN ORGANIZADAS
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/colors", colorsAdmin);
router.use("/projects", projectsAdmin);
router.use("/upload-image", uploadsRouter); // 👈 AQUI! Correto, limpo, seguro

export default router;
