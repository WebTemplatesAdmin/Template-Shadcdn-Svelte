// src/lib/types/pedido.ts

/** Etapas del flujo de un pedido. "cancelado" puede ocurrir en cualquier punto. */
export type EstadoPedido =
  | "pendiente"
  | "preparando"
  | "enviado"
  | "entregado"
  | "cancelado";

export type MetodoPago = "Tarjeta" | "Efectivo" | "Transferencia";

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
  cliente: ClientePedido;
  items: ItemPedido[];
  subtotal: number;
  impuesto: number;
  envio: number;
  total: number;
  metodoPago: MetodoPago;
  notas?: string;
  historial: EventoEstado[];
};
