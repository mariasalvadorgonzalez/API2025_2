import {Router} from 'express'
// importar las funciones
import { postPedido, getPedidos, getPedidosID} from '../controladores/pedidosCtrl.js'

const router=Router();
//armar nuestras rutas
//router.get('/pedidos',prueba)

router.post('/pedidos', postPedido)
router.get('/pedidos', getPedidos)
router.get('/pedidos/:id', getPedidosID)


export default router;