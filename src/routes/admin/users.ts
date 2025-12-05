//src/routes/admin/users.ts
import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { requireAdmin, type AuthRequest } from "../../middlewares/requireAdmin";

const router = Router();

// GET /api/admin/users -> lista admins
router.get("/", requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const admins = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(admins);
  } catch (err) {
    console.error("Erro ao listar admins:", err);
    res.status(500).json({ error: "Erro ao listar admins" });
  }
});

// POST /api/admin/users -> cria admin
router.post("/", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "E-mail já cadastrado" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        // role já é ADMIN por default
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    res.status(201).json(admin);
  } catch (err) {
    console.error("Erro ao criar admin:", err);
    res.status(500).json({ error: "Erro ao criar admin" });
  }
});

// DELETE /api/admin/users/:id -> remove admin (não deixa apagar a si mesmo)
router.delete("/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    if (req.user?.id === id) {
      return res.status(400).json({ error: "Você não pode remover a si mesmo" });
    }

    await prisma.user.delete({ where: { id } });

    res.status(204).send();
  } catch (err) {
    console.error("Erro ao deletar admin:", err);
    res.status(500).json({ error: "Erro ao deletar admin" });
  }
});

export default router;
