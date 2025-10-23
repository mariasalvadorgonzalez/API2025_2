import { Router } from 'express';
import upload from '../middlewares/upload.js'
// importar las funciones del controlador de productos
import { prueba,getProductos,getProductosxId,postProducto,putProducto,deleteProducto} from '../controladores/productosCtrl.js';
import { authMiddleware } from '../middleware/authMiddleware.js';


const router = Router();

// ✅ Definición de rutas para productos
// router.get('/productos', prueba);
router.get('/productos', authMiddleware, getProductos);
router.get('/productos/:id', authMiddleware, getProductosxId);
//router.post('/productos', authMiddleware, postProducto);
router.post('/productos', upload.single('imagen'), postProducto);
//router.put('/productos/:id', authMiddleware, putProducto);
router.put('/productos/:id', upload.single('imagen'), putProducto);
router.delete('/productos/:id', authMiddleware, deleteProducto);

export default router;
