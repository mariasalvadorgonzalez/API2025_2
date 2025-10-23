import {Router} from 'express'
// importar las funciones
import { prueba,getclientes,getclientesxId,postCliente,putCliente,deleteCliente } from '../controladores/clientesCtrl.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router=Router();
//armar nuestras rutas
//router.get('/clientes',prueba)
router.get('/clientes', authMiddleware, getclientes)
router.get('/clientes/:id', authMiddleware, getclientesxId)
router.post('/clientes', authMiddleware, postCliente)
router.put('/clientes/:id', authMiddleware, putCliente)
router.delete('/clientes/:id', authMiddleware, deleteCliente)

export default router