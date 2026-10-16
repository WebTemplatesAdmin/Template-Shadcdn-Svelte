// src/lib/utils/pedido.ts
// Helpers de dominio para pedidos. Mismo enfoque que $lib/utils/producto.ts.
import {
  BILLETERAS_VIRTUALES,
  METODOS_CON_COMPROBANTE,
  MOMENTO_COBRO,
  PAIS_BILLETERA,
} from "$lib/config/pagos";
import type {
  BilleteraVirtual,
  CanalPedido,
  Comprobante,
  EstadoPago,
  EstadoPedido,
  ItemPedido,
  MetodoPago,
  Pedido,
} from "$lib/types/pedido";

/** Tasa de IVA aplicada en la plantilla (19%). */
export const TASA_IVA = 0.19;
/** Costo de envío por defecto. */
export const ENVIO_ESTANDAR = 7000;

/** Orden del flujo. Fuera de él queda "cancelado". */
export const ORDEN_ESTADOS: EstadoPedido[] = [
  "pendiente",
  "preparando",
  "enviado",
  "entregado",
];

/** Estados que se muestran como segmentos en la página. */
export const ESTADOS: EstadoPedido[] = [...ORDEN_ESTADOS, "cancelado"];

/** Etiqueta legible del estado (el badge siempre muestra texto, no solo color). */
export const ETIQUETA_ESTADO: Record<EstadoPedido, string> = {
  pendiente: "Pendiente",
  preparando: "Preparando",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

type VarianteBadge = "default" | "secondary" | "destructive" | "outline";

/** Cómo entró el pedido. */
export const ETIQUETA_CANAL: Record<CanalPedido, string> = {
  web: "Tienda web",
  telefono: "Teléfono",
  whatsapp: "WhatsApp",
  presencial: "Presencial",
};

/** Orígenes disponibles (para filtros). */
export const CANALES: CanalPedido[] = [
  "web",
  "telefono",
  "whatsapp",
  "presencial",
];

/** Estado del cobro ("pendiente" se muestra como "Por cobrar"). */
export const ETIQUETA_PAGO: Record<EstadoPago, string> = {
  pendiente: "Por cobrar",
  en_revision: "En revisión",
  pagado: "Pagado",
  reembolsado: "Reembolsado",
};

export const ESTILO_PAGO: Record<
  EstadoPago,
  { variante: VarianteBadge; clase: string }
> = {
  pendiente: {
    variante: "outline",
    clase: "border-amber-500/40 bg-amber-500/10 text-amber-600",
  },
  en_revision: {
    variante: "outline",
    clase: "border-sky-500/40 bg-sky-500/10 text-sky-600",
  },
  pagado: {
    variante: "outline",
    clase: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  },
  reembolsado: { variante: "secondary", clase: "" },
};

/**
 * Estilo del estado: variante del Badge + acento del flujo.
 * Los acentos usan la misma convención que la NotificationCard del proyecto.
 */
export const ESTILO_ESTADO: Record<
  EstadoPedido,
  { variante: VarianteBadge; clase: string }
> = {
  pendiente: { variante: "secondary", clase: "" },
  preparando: {
    variante: "outline",
    clase: "border-amber-500/40 bg-amber-500/10 text-amber-600",
  },
  enviado: {
    variante: "outline",
    clase: "border-sky-500/40 bg-sky-500/10 text-sky-600",
  },
  entregado: {
    variante: "outline",
    clase: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  },
  cancelado: { variante: "destructive", clase: "" },
};

/** Siguiente paso del flujo, o `null` si ya terminó (entregado/cancelado). */
export function siguienteEstado(estado: EstadoPedido): EstadoPedido | null {
  if (estado === "entregado" || estado === "cancelado") return null;
  return ORDEN_ESTADOS[ORDEN_ESTADOS.indexOf(estado) + 1] ?? null;
}

/** Solo se cancela antes de entregar: después es una devolución. */
export function puedeCancelar(pedido: Pedido): boolean {
  return pedido.estado !== "entregado" && pedido.estado !== "cancelado";
}

/** Queda dinero por cobrar (efectivo contra entrega o crédito). */
export function puedeCobrar(pedido: Pedido): boolean {
  return pedido.estadoPago === "pendiente" && pedido.estado !== "cancelado";
}

/**
 * El método ADMITE comprobante opcional (transferencia, link de pago,
 * billetera virtual). Nunca es obligatorio: solo habilita adjuntarlo.
 */
export function admiteComprobante(metodo: MetodoPago): boolean {
  return METODOS_CON_COMPROBANTE.includes(metodo);
}

/** Etiqueta del método; las billeteras virtuales incluyen su país. */
export function etiquetaMetodo(metodo: MetodoPago): string {
  if (BILLETERAS_VIRTUALES.includes(metodo as BilleteraVirtual)) {
    return `${metodo} (${PAIS_BILLETERA[metodo as BilleteraVirtual]})`;
  }
  return metodo;
}

/** Se puede adjuntar comprobante si el pedido no está cancelado ni ya pagado. */
export function puedeAdjuntarComprobante(pedido: Pedido): boolean {
  return pedido.estado !== "cancelado" && pedido.estadoPago !== "pagado";
}

/** Hay un comprobante esperando validación (evidencia ≠ cobro). */
export function puedeValidarComprobante(pedido: Pedido): boolean {
  return pedido.estadoPago === "en_revision";
}

/** Un comprobante en revisión también se puede rechazar. */
export function puedeRechazarComprobante(pedido: Pedido): boolean {
  return pedido.estadoPago === "en_revision";
}

/**
 * Reglas de negocio al mover un pedido de estado:
 * - cancelar un pedido ya cobrado ⇒ queda reembolsado;
 * - entregar un pedido con cobro contra entrega ⇒ queda pagado.
 */
export function aplicarCambioEstado(
  pedido: Pedido,
  estado: EstadoPedido,
  ahora: string,
): Pedido {
  const actualizado: Pedido = {
    ...pedido,
    estado,
    historial: [...pedido.historial, { estado, fecha: ahora }],
  };

  if (estado === "cancelado" && pedido.estadoPago === "pagado") {
    return { ...actualizado, estadoPago: "reembolsado" };
  }

  const cobraAlEntregar = MOMENTO_COBRO[pedido.metodoPago] === "entrega";
  if (
    estado === "entregado" &&
    pedido.estadoPago === "pendiente" &&
    cobraAlEntregar
  ) {
    return { ...actualizado, estadoPago: "pagado", pagadoEn: ahora };
  }

  return actualizado;
}

/** Contrato con tu API: PATCH /pedidos/:id/estado */
export function payloadCambioEstado(pedido: Pedido, estado: EstadoPedido) {
  return { id: pedido.id, codigo: pedido.codigo, estado };
}

/** Contrato con tu API: PATCH /pedidos/:id/pago */
export function payloadCobro(pedido: Pedido, pagadoEn: string) {
  return {
    id: pedido.id,
    codigo: pedido.codigo,
    estadoPago: "pagado" as EstadoPago,
    pagadoEn,
  };
}

/** Contrato con tu API: POST /pedidos/:id/comprobante */
export function payloadComprobante(pedido: Pedido, comprobante: Comprobante) {
  return {
    id: pedido.id,
    codigo: pedido.codigo,
    comprobante,
  };
}

/**
 * Contrato con tu API: PATCH /pedidos/:id/pago/validar
 * `aprobado: true` confirma el cobro; `false` lo rechaza (vuelve a por cobrar).
 */
export function payloadValidacionPago(
  pedido: Pedido,
  aprobado: boolean,
  ahora: string,
) {
  return {
    id: pedido.id,
    codigo: pedido.codigo,
    aprobado,
    estadoPago: (aprobado ? "pagado" : "pendiente") as EstadoPago,
    ...(aprobado ? { pagadoEn: ahora } : {}),
  };
}

/** Unidades totales: suma de cantidades. */
export function totalUnidades(pedido: Pedido): number {
  return pedido.items.reduce((total, item) => total + item.cantidad, 0);
}

/** Líneas distintas del pedido. */
export function contarArticulos(pedido: Pedido): number {
  return pedido.items.length;
}

/**
 * Calcula los montos de un pedido. Fuente única del IVA y el envío: la usan
 * tanto los mocks como el formulario de alta, para que el total nunca difiera.
 */
export function calcularTotales(
  items: ItemPedido[],
  envio: number,
): { subtotal: number; impuesto: number; envio: number; total: number } {
  const subtotal = items.reduce(
    (total, item) => total + item.cantidad * item.precioUnitario,
    0,
  );
  const impuesto = Math.round(subtotal * TASA_IVA);
  return { subtotal, impuesto, envio, total: subtotal + impuesto + envio };
}

/** Montos del mock en COP. */
export function formatearMonto(valor: number): string {
  return `$${valor.toLocaleString("es-CO")}`;
}

export function formatearFechaPedido(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatearFechaHoraPedido(fecha: string): string {
  return new Date(fecha).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Cantidad de pedidos por estado + total (para los segmentos). */
export function contarPorEstado(
  pedidos: Pedido[],
): Record<EstadoPedido, number> & { todos: number } {
  const conteo = {
    pendiente: 0,
    preparando: 0,
    enviado: 0,
    entregado: 0,
    cancelado: 0,
    todos: pedidos.length,
  };
  for (const pedido of pedidos) conteo[pedido.estado] += 1;
  return conteo;
}

/** Métricas de la franja superior. */
export function resumenPedidos(pedidos: Pedido[]) {
  const conteo = contarPorEstado(pedidos);

  // Demo estable: se toma la fecha del pedido más reciente como "ahora", para
  // que la métrica no dependa del reloj real. Con un backend, usa Date.now().
  const referencia = pedidos.reduce(
    (masReciente, pedido) =>
      Math.max(masReciente, new Date(pedido.fecha).getTime()),
    0,
  );
  const hace7Dias = referencia - 7 * 24 * 60 * 60 * 1000;

  const entregados7Dias = pedidos.filter(
    (pedido) =>
      pedido.estado === "entregado" &&
      new Date(pedido.fecha).getTime() >= hace7Dias,
  ).length;

  const vigentes = pedidos.filter((pedido) => pedido.estado !== "cancelado");
  const facturado = vigentes.reduce((total, pedido) => total + pedido.total, 0);

  return {
    pendientes: conteo.pendiente,
    preparando: conteo.preparando,
    entregados7Dias,
    ticketPromedio: vigentes.length
      ? Math.round(facturado / vigentes.length)
      : 0,
  };
}
