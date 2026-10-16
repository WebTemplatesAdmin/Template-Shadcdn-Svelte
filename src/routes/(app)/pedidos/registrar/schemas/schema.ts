// src/routes/(app)/pedidos/registrar/schemas/schema.ts
import { z } from "zod";
import { METODOS_PAGO } from "$lib/config/pagos";
import { calcularTotales, CANALES, ENVIO_ESTANDAR } from "$lib/utils/pedido";
import type { CanalPedido, DatosPago, MetodoPago } from "$lib/types/pedido";

// Zod necesita tuplas de literales: los arreglos de config se castean aquí.
const canales = CANALES as [CanalPedido, ...CanalPedido[]];
const metodosPago = METODOS_PAGO as [MetodoPago, ...MetodoPago[]];

const itemSchema = z.object({
  productoId: z.coerce.number().int().positive("Selecciona un producto"),
  nombre: z.string().min(1, "El nombre es requerido"),
  varianteSku: z.string().optional(),
  cantidad: z.coerce.number().int().min(1, "Mínimo 1 unidad"),
  precioUnitario: z.coerce
    .number()
    .nonnegative("El precio no puede ser negativo"),
});

export const pedidoSchema = z.object({
  // ============ Cliente ============
  // Se elige de la lista por id; los demás campos son el "snapshot" que dejó
  // el selector (no se editan a mano) y viajan en el payload.
  clienteId: z.coerce
    .number({ error: "Selecciona un cliente" })
    .int()
    .positive("Selecciona un cliente"),
  clienteNombre: z.string().default(""),
  clienteEmail: z.string().default(""),
  clienteTelefono: z.string().default(""),
  clienteDireccion: z.string().default(""),

  // ============ Origen ============
  canal: z.enum(canales).default("presencial"),
  /** Vendedor/asesor que registra el pedido. Vacío si lo crea el cliente. */
  creadoPor: z.string().max(120).optional(),

  // ============ Pago ============
  // El comprobante NO se adjunta aquí: se sube después, desde el detalle.
  metodoPago: z.enum(metodosPago).default("Efectivo"),
  /** Identificador del cobro (transacción, recibo, factura…). Opcional. */
  transaccionId: z.string().max(60).optional(),
  // Tarjeta: se elige una guardada del cliente (o se guarda una nueva).
  // Solo se manejan los últimos 4 dígitos, nunca el número completo ni el CVV.
  tarjetaId: z.string().default(""),
  tarjetaMarca: z.string().default(""),
  tarjetaTitular: z.string().default(""),
  tarjetaVencimiento: z.string().default(""),
  tarjetaUltimos4: z.string().default(""),

  // ============ Artículos ============
  items: z.array(itemSchema).min(1, "Agrega al menos un artículo"),

  // ============ Envío / notas ============
  envio: z.coerce.number().nonnegative().default(ENVIO_ESTANDAR),
  notas: z.string().max(500).optional(),
}).superRefine((datos, ctx) => {
  // Los datos de tarjeta solo se exigen cuando el método es Tarjeta.
  if (datos.metodoPago !== "Tarjeta") return;

  if (!datos.tarjetaId) {
    ctx.addIssue({
      code: "custom",
      path: ["tarjetaId"],
      message: "Selecciona una tarjeta guardada o guarda una nueva",
    });
    return;
  }

  if (!/^\d{4}$/.test(datos.tarjetaUltimos4)) {
    ctx.addIssue({
      code: "custom",
      path: ["tarjetaUltimos4"],
      message: "Ingresa los últimos 4 dígitos",
    });
  }
  if (!datos.tarjetaTitular.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["tarjetaTitular"],
      message: "El titular es requerido",
    });
  }
  if (!/^\d{2}\/\d{2}$/.test(datos.tarjetaVencimiento)) {
    ctx.addIssue({
      code: "custom",
      path: ["tarjetaVencimiento"],
      message: "Formato MM/AA",
    });
  }
});

export type PedidoSchema = typeof pedidoSchema;
export type PedidoDatos = z.infer<typeof pedidoSchema>;
export type ItemPedidoDatos = z.infer<typeof itemSchema>;

/** Contrato con la API: el JSON que se envía a `POST /pedidos`. */
export type PedidoPayload = {
  id: number;
  codigo: string;
  clienteId: number;
  cliente: {
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
  };
  canal: CanalPedido;
  creadoPor?: string;
  metodoPago: MetodoPago;
  /** Datos del cobro (transacción y, si aplica, tarjeta). */
  pago?: DatosPago;
  items: ItemPedidoDatos[];
  subtotal: number;
  impuesto: number;
  envio: number;
  total: number;
  estado: "pendiente";
  estadoPago: "pendiente";
  notas?: string;
};

/**
 * Construye el JSON que se envía a tu backend.
 * Único punto de conexión: aquí llamas a `POST /pedidos` con el objeto devuelto.
 */
export function construirPayloadPedido(
  datos: PedidoDatos,
  meta: { id: number; codigo: string },
): PedidoPayload {
  const totales = calcularTotales(datos.items, datos.envio);

  const tarjeta =
    datos.metodoPago === "Tarjeta"
      ? {
        ...(datos.tarjetaId ? { tarjetaId: datos.tarjetaId } : {}),
        ...(datos.tarjetaMarca ? { marca: datos.tarjetaMarca } : {}),
        ultimos4: datos.tarjetaUltimos4,
        titular: datos.tarjetaTitular,
        vencimiento: datos.tarjetaVencimiento,
      }
      : undefined;

  const pago: DatosPago = {
    ...(datos.transaccionId?.trim()
      ? { transaccionId: datos.transaccionId.trim() }
      : {}),
    ...(tarjeta ? { tarjeta } : {}),
  };

  return {
    id: meta.id,
    codigo: meta.codigo,
    clienteId: datos.clienteId,
    cliente: {
      nombre: datos.clienteNombre,
      email: datos.clienteEmail,
      telefono: datos.clienteTelefono,
      direccion: datos.clienteDireccion,
    },
    canal: datos.canal,
    ...(datos.creadoPor ? { creadoPor: datos.creadoPor } : {}),
    metodoPago: datos.metodoPago,
    ...(pago.transaccionId || pago.tarjeta ? { pago } : {}),
    items: datos.items,
    ...totales,
    estado: "pendiente",
    // El comprobante llega después: el pedido nace "por cobrar".
    estadoPago: "pendiente",
    ...(datos.notas ? { notas: datos.notas } : {}),
  };
}
