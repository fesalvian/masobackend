// src/routes/public/home.ts
import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";

const router = Router();

/**
 * GET /api/public/home/carousel
 * → retorna imagens do carrossel em ordem
 */
router.get("/carousel", async (req: Request, res: Response) => {
  try {
    const items = await prisma.homeCarousel.findMany({
      where: { ativo: true },
      orderBy: { ordem: "asc" },
    });

    res.json(items);
  } catch (err) {
    console.error("Erro ao buscar carousel:", err);
    res.status(500).json({ error: "Erro ao buscar carousel" });
  }
});

/**
 * GET /api/public/home/hero
 * → retorna hero title, subtitle e imagens relacionadas
 */
router.get("/hero", async (req: Request, res: Response) => {
  try {
    const settings = await prisma.siteSettings.findFirst({
      include: {
        heroImages: {
          where: { ativo: true },
          orderBy: { ordem: "asc" },
        },
      },
    });

    if (!settings) {
      return res.status(404).json({ error: "Configurações não encontradas" });
    }

    res.json(settings);
  } catch (err) {
    console.error("Erro ao buscar hero settings:", err);
    res.status(500).json({ error: "Erro ao buscar dados da home" });
  }
});

/**
 * GET /api/public/home
 * → tudo de uma vez: hero + carousel
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const [carousel, settings] = await Promise.all([
      prisma.homeCarousel.findMany({
        where: { ativo: true },
        orderBy: { ordem: "asc" },
      }),

      prisma.siteSettings.findFirst({
        include: {
          heroImages: {
            where: { ativo: true },
            orderBy: { ordem: "asc" },
          },
        },
      }),
    ]);

    res.json({
      carousel,
      hero: settings ?? null,
    });
  } catch (err) {
    console.error("Erro ao buscar dados da home:", err);
    res.status(500).json({ error: "Erro ao buscar dados da home" });
  }
});

export default router;
