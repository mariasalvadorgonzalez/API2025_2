import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function generarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, nombre: usuario.nombre },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES }
  );
}
