// src/routes/public/colors.ts
import { Router, type Request, type Response } from "express";
import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";

const router = Router();

// GET /api/public/colors?linha=&tipo=&search=
router.get("/", async (req: Request, res: Response) => {
  try {
    const { linha, tipo, search } = req.query;

    const where: Prisma.CoresWhereInput = {};

    if (linha) {
      where.linha = String(linha);
    }

    if (tipo) {
      // espera: "MADEIRA" | "NEUTRO" | "ROCHOSO"
      where.tipo = String(tipo) as any;
    }

    if (search) {
      const s = String(search);
      where.OR = [
        { nome: { contains: s } },
        { colecao: { contains: s } },
        { linha: { contains: s } },
      ];
    }

    const cores = await prisma.cores.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(cores);
  } catch (err) {
    console.error("Erro ao buscar cores:", err);
    res.status(500).json({ error: "Erro ao buscar cores" });
  }
});

export default router;
