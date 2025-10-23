import express from 'express';
import bcrypt from 'bcryptjs';
import { generarToken } from '../utils/jwt.js';

const router = express.Router();

const usuarioEjemplo = {
  id: 1,
  nombre: 'Maria',
  email: 'Maria@mail.com',
  password: '$2b$10$g1DolgVBFn7molXeR.gxOeQ.QXhHxkKKjTR65u2Ygz56s5m9rmH6S' // hash generado
};

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  if (email !== usuarioEjemplo.email) {
    return res.status(401).json({ message: 'Usuario no encontrado' });
  }

  const valido = await bcrypt.compare(password, usuarioEjemplo.password);
  if (!valido) {
    return res.status(401).json({ message: 'Contraseña incorrecta' });
  }

  const token = generarToken({ id: usuarioEjemplo.id, nombre: usuarioEjemplo.nombre });
  res.json({ token });
});

export default router;
