import { conmysql } from '../db.js';

// ✅ Comprobación de conexión
export const prueba = (req, res) => {
  res.send('✅ Prueba con éxito - productos');
};

// ✅ Obtener todos los productos
export const getProductos = async (req, res) => {
  try {
    const [result] = await conmysql.query('SELECT * FROM productos');
    res.json({
      cant: result.length,
      data: result
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

// ✅ Obtener un producto por ID
export const getProductosxId = async (req, res) => {
  try {
    const [result] = await conmysql.query(
      'SELECT * FROM productos WHERE prod_id = ?',
      [req.params.id]
    );

    if (result.length <= 0) {
      return res.status(404).json({
        cant: 0,
        message: "Producto no encontrado"
      });
    }

    res.json({
      cant: result.length,
      data: result[0]
    });
  } catch (error) {
    console.error('Error al obtener producto por ID:', error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

// ✅ Insertar un nuevo producto
export const postProducto = async (req, res) => {
    try {
      const { prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo} = req.body;
      const prod_imagen=req.file? `/uploads/${req.file.filename}`:null;
      // Validar campos obligatorios
      if (!prod_codigo || !prod_nombre || prod_precio == null || prod_stock == null) {
        return res.status(400).json({ message: "Faltan datos obligatorios" });
      }
  
      const [result] = await conmysql.query(
        'INSERT INTO productos (prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen) VALUES (?, ?, ?, ?, ?, ?)',
        [prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen]
      );
  
      const [nuevo] = await conmysql.query('SELECT * FROM productos WHERE prod_id = ?', [result.insertId]);
  
      res.status(201).json({
        message: "✅ Producto creado correctamente",
        data: nuevo[0]
      });
    } catch (error) {
      console.error("Error al crear producto:", error);
      return res.status(500).json({ message: "Error en el servidor" });
    }
  };
  

// ✅ Modificar producto existente
export const putProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo } = req.body;

    // Obtener producto actual
    const [fila] = await conmysql.query('SELECT * FROM productos WHERE prod_id=?', [id]);
    if (fila.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    const productoActual = fila[0];

    // Solo actualizar imagen si hay archivo nuevo
    const prod_imagen = req.file ? `/uploads/${req.file.filename}` : productoActual.prod_imagen;

    const [result] = await conmysql.query(
      `UPDATE productos 
       SET prod_codigo=?, prod_nombre=?, prod_stock=?, prod_precio=?, prod_activo=?${req.file ? ', prod_imagen=?' : ''} 
       WHERE prod_id=?`,
      req.file
        ? [prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen, id]
        : [prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, id]
    );

    // Traer el producto actualizado
    const [productoActualizado] = await conmysql.query('SELECT * FROM productos WHERE prod_id=?', [id]);

    res.json({
      message: "✅ Producto actualizado correctamente",
      data: productoActualizado[0]
    });

  } catch (error) {
    console.error("Error en PUT /productos/:id:", error);
    return res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
};

// ✅ Eliminar un producto
export const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Falta el id del producto" });
    }

    const [result] = await conmysql.query('DELETE FROM productos WHERE prod_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json({ message: "✅ Producto eliminado correctamente", prod_id: id });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
