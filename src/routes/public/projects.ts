// src/routes/public/projects.ts
import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { Ambiente, Prisma } from "@prisma/client";

const router = Router();

/**
 * GET /api/public/projects
 * ?ambiente=COZINHA
 * ?search=led
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { ambiente, search } = req.query;

    const where: Prisma.ProjetoWhereInput = {};

    // 🌟 filtro por ambiente (enum)
    if (ambiente) {
      where.ambiente = ambiente as Ambiente;
    }

    // 🔎 filtro de busca geral
    if (search) {
      const s = String(search).toLowerCase();

      where.OR = [
        { nome: { contains: s } },
        { descricao: { contains: s } },

        // busca em tags (tabela ProjetoTag)
        {
          tags: {
            some: {
              tag: { contains: s },
            },
          },
        },
      ];
    }

    const projetos = await prisma.projeto.findMany({
      where,
      include: {
        imagens: true,
        coresUsadas: {
          include: { cor: true },
        },
        tags: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(projetos);
  } catch (err) {
    console.error("Erro ao buscar projetos:", err);
    res.status(500).json({ error: "Erro ao buscar projetos" });
  }
});

router.get("/recentes", async (req, res) => {
  try {
    const projetos = await prisma.projeto.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        imagens: true,
      },
    });

    res.json(projetos);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao buscar projetos recentes" });
  }
});



export default router;
