import { Router, type Request, type Response } from "express";
import { prisma } from "../../lib/prisma";

const router = Router();

// POST /api/public/contact
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, phone, message } = req.body;

    if (!name || !phone || !message) {
      return res.status(400).json({ error: "Campos obrigatórios faltando" });
    }

    const saved = await prisma.contactMessage.create({
      data: { name, phone, message },
    });

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error("Erro ao salvar mensagem de contato:", err);
    res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

export default router;
