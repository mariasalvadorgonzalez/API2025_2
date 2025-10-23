import { conmysql } from "../db.js";

export const getPedidos = async (req, res) => {
  try {
    // 1️⃣ Obtener pedidos con info de cliente y usuario
    const [pedidos] = await conmysql.query(`
      SELECT 
        p.ped_id,
        p.ped_fecha,
        p.ped_estado,
        c.cli_id,
        c.cli_nombre AS cliente,
        u.usr_id,
        u.usr_nombre AS usuario
      FROM pedidos p
      LEFT JOIN clientes c ON p.cli_id = c.cli_id
      LEFT JOIN usuarios u ON p.usr_id = u.usr_id
      ORDER BY p.ped_fecha DESC
    `);

    if (pedidos.length === 0) {
      return res.json([]);
    }

    // 2️⃣ Obtener todos los detalles de los pedidos en una sola consulta
    const [detalles] = await conmysql.query(`
      SELECT 
        d.ped_id,
        d.det_id,
        d.prod_id,
        pr.prod_nombre,
        d.det_cantidad,
        d.det_precio,
        (d.det_cantidad * d.det_precio) AS subtotal
      FROM pedidos_detalle d
      LEFT JOIN productos pr ON d.prod_id = pr.prod_id
    `);

    // 3️⃣ Agrupar los detalles según su ped_id
    const pedidosConDetalles = pedidos.map((pedido) => {
      const detallePedido = detalles.filter(
        (d) => d.ped_id === pedido.ped_id
      );

      // Calcular total del pedido
      const total = detallePedido.reduce(
        (sum, item) => sum + Number(item.subtotal),
        0
      );

      return {
        ...pedido,
        total_pedido: total,
        detalles: detallePedido,
      };
    });

    res.json(pedidosConDetalles);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};



export const getPedidosID = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Obtener el pedido principal con datos del cliente y usuario
    const [pedidoRows] = await conmysql.query(`
      SELECT 
        p.ped_id,
        p.ped_fecha,
        p.ped_estado,
        c.cli_id,
        c.cli_nombre AS cliente,
        u.usr_id,
        u.usr_nombre AS usuario
      FROM pedidos p
      LEFT JOIN clientes c ON p.cli_id = c.cli_id
      LEFT JOIN usuarios u ON p.usr_id = u.usr_id
      WHERE p.ped_id = ?
    `, [id]);

    if (pedidoRows.length === 0) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    const pedido = pedidoRows[0];

    // 2️⃣ Obtener los detalles del pedido
    const [detalles] = await conmysql.query(`
      SELECT 
        d.det_id,
        d.prod_id,
        pr.prod_nombre,
        d.det_cantidad,
        d.det_precio,
        (d.det_cantidad * d.det_precio) AS subtotal
      FROM pedidos_detalle d
      LEFT JOIN productos pr ON d.prod_id = pr.prod_id
      WHERE d.ped_id = ?
    `, [id]);

    // 3️⃣ Calcular el total del pedido
    const total_pedido = detalles.reduce(
      (sum, item) => sum + Number(item.subtotal),
      0
    );

    // 4️⃣ Armar la respuesta final
    const pedidoCompleto = {
      ...pedido,
      total_pedido,
      detalles
    };

    res.json(pedidoCompleto);

  } catch (error) {
    console.error("Error al obtener pedido por ID:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};



export const postPedido = async (req, res) => {
  const { cli_id, usr_id, productos } = req.body;
  // productos será un array con objetos: [{ prod_id, det_cantidad, det_precio }, ...]

  if (!cli_id || !usr_id || !productos || productos.length === 0) {
    return res.status(400).json({ message: "Faltan datos obligatorios" });
  }

  const connection = await conmysql.getConnection(); // iniciar conexión para transacción

  try {
    await connection.beginTransaction();

    // 1️⃣ Insertar el pedido principal
    const [pedidoResult] = await connection.query(
      "INSERT INTO pedidos (cli_id, ped_fecha, usr_id, ped_estado) VALUES (?, NOW(), ?, 0)",
      [cli_id, usr_id]
    );

    const ped_id = pedidoResult.insertId; // ID del pedido recién creado

    // 2️⃣ Insertar cada detalle del pedido
    for (const item of productos) {
      const { prod_id, det_cantidad, det_precio } = item;

      await connection.query(
        "INSERT INTO pedidos_detalle (prod_id, ped_id, det_cantidad, det_precio) VALUES (?, ?, ?, ?)",
        [prod_id, ped_id, det_cantidad, det_precio]
      );
    }

    await connection.commit(); // Confirmar transacción

    res.json({
      message: "Pedido registrado correctamente",
      ped_id,
    });
  } catch (error) {
    await connection.rollback(); // Deshacer si hay error
    console.error("Error al registrar pedido:", error);
    res.status(500).json({ message: "Error en el servidor" });
  } finally {
    connection.release(); // Liberar conexión
  }
};
