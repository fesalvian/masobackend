// src/routes/admin/uploads.ts
import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "../../middlewares/requireAdmin";

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/admin/upload-image
router.post("/", requireAdmin, async (req, res) => {
  try {
    let { base64, folder } = req.body;

    if (!base64) {
      return res.status(400).json({ error: "Nenhuma imagem enviada." });
    }

    if (!base64.startsWith("data:"))
      base64 = `data:image/jpeg;base64,${base64}`;

    // pasta final
    const finalFolder = `maso-site/${folder ?? "geral"}`;

    const upload = await cloudinary.uploader.upload(base64, {
      folder: finalFolder,
    });

    return res.json({ url: upload.secure_url });

  } catch (e) {
    console.error("Erro no upload:", e);
    return res.status(500).json({ error: "Falha ao enviar a imagem." });
  }
});

export default router;
