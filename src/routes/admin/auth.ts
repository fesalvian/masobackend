//src/routes/admin/auth.ts
import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { requireAdmin, type AuthRequest } from "../../middlewares/requireAdmin";

const router = Router();
// POST /api/admin/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET não definido");
      return res.status(500).json({ error: "Configuração inválida" });
    }

    const token = jwt.sign(
  { id: user.id, role: user.role },
  Buffer.from(secret, "utf8"),
  { expiresIn: "7d" }
);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Erro no login admin:", err);
    return res.status(500).json({ error: "Erro ao fazer login" });
  }
});

// GET /api/admin/me
router.get("/me", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Não autenticado" });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    return res.json(user);
  } catch (err) {
    console.error("Erro em /me:", err);
    return res.status(500).json({ error: "Erro ao buscar perfil" });
  }
});

/**
 * Rota especial para criar o PRIMEIRO admin
 * Só funciona se não existir nenhum usuário no banco.
 */
router.post("/bootstrap-first-admin", async (req: Request, res: Response) => {
  try {
    const count = await prisma.user.count();
    if (count > 0) {
      return res.status(400).json({ error: "Já existe usuário cadastrado" });
    }

    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
      select: { id: true, name: true, email: true, role: true },
    });

    return res.status(201).json(user);
  } catch (err) {
    console.error("Erro no bootstrap-first-admin:", err);
    return res.status(500).json({ error: "Erro ao criar primeiro admin" });
  }
});

export default router;
