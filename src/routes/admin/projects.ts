// src/routes/admin/projects.ts
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
    },
  });

  res.json(projetos);
});

// CRIAR
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { nome, descricao, ambiente, capa, imagens, coresUsadas, tags } = req.body;

    const novo = await prisma.projeto.create({
      data: {
        nome,
        descricao,
        ambiente,
        capa,

        imagens: {
  create: imagens.map((url: string) => ({ url }))
},

coresUsadas: {
  create: coresUsadas.map((corId: number) => ({ corId }))
},

tags: {
  create: tags.map((tag: string) => ({ tag }))
},

      },
      include: {
        imagens: true,
        coresUsadas: { include: { cor: true } },
        tags: true,
      },
    });

    res.status(201).json(novo);
  } catch (err) {
    console.error("Erro ao criar projeto:", err);
    res.status(500).json({ error: "Erro ao criar projeto." });
  }
});

// ATUALIZAR PROJETO
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nome, ambiente, descricao, capa, imagens, coresUsadas, tags } = req.body;

    if (!nome || !ambiente || !descricao || !capa)
      return res.status(400).json({ error: "Dados incompletos." });

    // limpar relacionamentos
    await prisma.projetoImagem.deleteMany({ where: { projetoId: id } });
    await prisma.projetoCor.deleteMany({ where: { projetoId: id } });
    await prisma.projetoTag.deleteMany({ where: { projetoId: id } });

    const updated = await prisma.projeto.update({
  where: { id },
  data: {
    nome,
    ambiente,
    descricao,
    capa,

    imagens: {
      create: imagens.map((url: string) => ({ url }))
    },

    tags: {
      create: tags.map((tag: string) => ({ tag }))
    },

    coresUsadas: {
      create: coresUsadas.map((corId: number) => ({ corId }))
    }
  },
  include: {
    imagens: true,
    coresUsadas: { include: { cor: true } },
    tags: true
  }
});

    res.json(updated);
  } catch (e) {
    console.error("Erro ao atualizar projeto:", e);
    res.status(500).json({ error: "Erro ao atualizar projeto." });
  }
});


// DELETAR
router.delete("/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);

  try {
    // Primeiro apaga todos os relacionamentos
    await prisma.projetoImagem.deleteMany({ where: { projetoId: id } });
    await prisma.projetoCor.deleteMany({ where: { projetoId: id } });
    await prisma.projetoTag.deleteMany({ where: { projetoId: id } });

    // Agora sim pode deletar o projeto
    await prisma.projeto.delete({ where: { id } });

    res.status(204).send();
  } catch (e) {
    console.error("Erro ao deletar projeto:", e);
    res.status(500).json({ error: "Erro ao deletar projeto." });
  }
});

// Últimos 6 projetos
router.get("/recent", async (_, res) => {
  const projects = await prisma.projeto.findMany({
    orderBy: { id: "desc" },
    take: 6,
    include: {
      imagens: true,
      coresUsadas: { include: { cor: true } },
      tags: true
    }
  });

  res.json(projects);
});


export default router;
