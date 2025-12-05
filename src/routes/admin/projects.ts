import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { requireAdmin } from "../../middlewares/requireAdmin";

const router = Router();

// LISTAR COMPLETO
router.get("/", requireAdmin, async (_, res) => {
  const projetos = await prisma.projeto.findMany({
    include: {
      imagens: true,
      coresUsadas: { include: { cor: true } },
      tags: true,
    }
  });
  res.json(projetos);
});

// CRIAR
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { nome, ambiente, descricao, capa, imagens, cores, tags } = req.body;

    const projeto = await prisma.projeto.create({
      data: {
        nome,
        ambiente,
        descricao,
        capa,
        imagens: {
          create: imagens.map((url: string) => ({ url })),
        },
        tags: {
          create: tags.map((tag: string) => ({ tag })),
        },
        coresUsadas: {
          create: cores.map((corId: number) => ({ corId })),
        },
      },
      include: {
        imagens: true,
        coresUsadas: true,
        tags: true,
      },
    });

    res.status(201).json(projeto);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao criar projeto." });
  }
});

// DELETAR
router.delete("/:id", requireAdmin, async (req, res) => {
  await prisma.projeto.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});

export default router;
