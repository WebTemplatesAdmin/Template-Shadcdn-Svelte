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

export type MetodoPago =
  | "Efectivo"
  | "Tarjeta"
  | "Transferencia"
  | "Billetera digital"
  | "Crédito";

/** Dimensión financiera: independiente del avance logístico del pedido. */
export type EstadoPago = "pendiente" | "pagado" | "reembolsado";

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
  cliente: ClientePedido;
  items: ItemPedido[];
  subtotal: number;
  impuesto: number;
  envio: number;
  total: number;
  metodoPago: MetodoPago;
  /** Estado del cobro: "pendiente" = por cobrar. */
  estadoPago: EstadoPago;
  /** Fecha del cobro, cuando ya se pagó. */
  pagadoEn?: string;
  /** Vencimiento de la factura, solo en pagos a crédito. */
  vencimiento?: string;
  notas?: string;
  historial: EventoEstado[];
};
