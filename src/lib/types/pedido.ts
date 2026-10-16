// src/lib/types/pedido.ts

/** Etapas del flujo de un pedido. "cancelado" puede ocurrir en cualquier punto. */
export type EstadoPedido =
  | "pendiente"
  | "preparando"
  | "enviado"
  | "entregado"
  | "cancelado";

/** Cómo entró el pedido. `web` lo crea el cliente; el resto, un vendedor. */
export type CanalPedido = "web" | "telefono" | "whatsapp" | "presencial";

/** Billeteras virtuales. Cada una es local a un país (ver `PAIS_BILLETERA`). */
export type BilleteraVirtual = "Nequi" | "Daviplata" | "Zelle" | "PayPal";

export type MetodoPago =
  | "Efectivo"
  | "Tarjeta"
  | "Transferencia"
  | "Link de pago"
  | "Crédito"
  | BilleteraVirtual;

/** Datos de tarjeta: solo los últimos 4 dígitos (nunca el número completo/CVV). */
export type DatosTarjeta = {
  /** Id de la tarjeta guardada del cliente, si se reutilizó una. */
  tarjetaId?: string;
  marca?: string;
  ultimos4: string;
  titular: string;
  /** MM/AA. */
  vencimiento: string;
};

/** Datos del cobro. `transaccionId` aplica a cualquier método electrónico. */
export type DatosPago = {
  /** Identificador del cobro (nro. de transacción, recibo, factura…). */
  transaccionId?: string;
  /** Solo cuando el método es Tarjeta. */
  tarjeta?: DatosTarjeta;
};

/**
 * Dimensión financiera: independiente del avance logístico del pedido.
 * `en_revision` = se adjuntó un comprobante, pero el cobro aún no se valida.
 */
export type EstadoPago = "pendiente" | "en_revision" | "pagado" | "reembolsado";

/** Quién adjuntó el comprobante de pago. */
export type SubidoPor = "vendedor" | "cliente";

/**
 * Evidencia de pago (transferencia / link de pago). NO es el cobro en sí:
 * es un soporte que alguien sube y que hay que validar para pasar a `pagado`.
 */
export type Comprobante = {
  id: string;
  /** Nombre del archivo. En la demo no hay almacenamiento real del archivo. */
  archivo: string;
  /** Tipo MIME (application/pdf, image/png, image/jpeg). */
  tipo: string;
  subidoPor: SubidoPor;
  /** ISO 8601. */
  subidoEn: string;
  monto: number;
  /** Nro. de transacción / banco, si lo hay. */
  referencia?: string;
};

export type ClientePedido = {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
};

export type ItemPedido = {
  /** Id del producto en el catálogo: necesario para afectar inventario. */
  productoId: number;
  /** SKU de la variante vendida, si el producto tiene opciones. */
  varianteSku?: string;
  nombre: string;
  imagen?: string;
  cantidad: number;
  /** Precio unitario sin impuestos. */
  precioUnitario: number;
};

/** Marca temporal de cada cambio de estado (misma forma que la bitácora de producto). */
export type EventoEstado = {
  estado: EstadoPedido;
  fecha: string;
};

export type Pedido = {
  id: number;
  /** Código visible: "#1042". */
  codigo: string;
  /** ISO 8601. */
  fecha: string;
  estado: EstadoPedido;
  /** Origen del pedido (autoservicio o registrado por un vendedor). */
  canal: CanalPedido;
  /** Vendedor que lo registró. Vacío si lo creó el propio cliente. */
  creadoPor?: string;
  /** Id del cliente en el catálogo (perfil). */
  clienteId?: number;
  /** Snapshot de los datos del cliente al momento de la venta. */
  cliente: ClientePedido;
  items: ItemPedido[];
  subtotal: number;
  impuesto: number;
  envio: number;
  total: number;
  metodoPago: MetodoPago;
  /** Estado del cobro: "pendiente" = por cobrar. */
  estadoPago: EstadoPago;
  /** Datos del cobro (transacción y, si aplica, tarjeta). */
  pago?: DatosPago;
  /** Evidencia de pago adjuntada (transferencia / link de pago). */
  comprobante?: Comprobante;
  /** Fecha del cobro, cuando ya se pagó. */
  pagadoEn?: string;
  /** Vencimiento de la factura, solo en pagos a crédito. */
  vencimiento?: string;
  notas?: string;
  historial: EventoEstado[];
};
