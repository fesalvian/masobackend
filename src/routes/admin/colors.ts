// src/routes/admin/colors.ts
import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { requireAdmin } from "../../middlewares/requireAdmin";

const router = Router();

// LISTAR
router.get("/", requireAdmin, async (_, res) => {
  const cores = await prisma.cores.findMany();
  res.json(cores);
});

// CRIAR
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { nome, linha, colecao, tipo, imagem } = req.body;

    if (!nome || !linha || !colecao || !tipo || !imagem)
      return res.status(400).json({ error: "Dados incompletos." });

    const cor = await prisma.cores.create({
      data: { nome, linha, colecao, tipo, imagem },
    });

    res.status(201).json(cor);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao criar cor." });
  }
});

// ATUALIZAR
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nome, linha, colecao, tipo, imagem } = req.body;

    if (!nome || !linha || !colecao || !tipo || !imagem)
      return res.status(400).json({ error: "Dados incompletos." });

    const updated = await prisma.cores.update({
      where: { id },
      data: { nome, linha, colecao, tipo, imagem },
    });

    res.json(updated);
  } catch (e) {
    console.error("Erro ao atualizar cor:", e);
    res.status(500).json({ error: "Erro ao atualizar cor." });
  }
});


// DELETAR
router.delete("/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.cores.delete({ where: { id } });
  res.status(204).send();
});

export default router;
