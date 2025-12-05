//src/middlewares/requireAdmin.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

interface JwtPayload {
  id: number;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const token = auth.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET não definido no .env");
      return res.status(500).json({ error: "Configuração inválida do servidor" });
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (!decoded || decoded.role !== Role.ADMIN) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Erro no requireAdmin:", err);
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}
