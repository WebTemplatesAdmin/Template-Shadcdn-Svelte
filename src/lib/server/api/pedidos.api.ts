/**
 * ============================================================
 * Mocks de pedidos
 * ============================================================
 * Cuando conectes TU backend real, reemplaza el contenido de este
 * archivo manteniendo el mismo nombre de función y el mismo tipo de
 * retorno (`Pedido[]`): ni la tabla, ni el detalle, ni los filtros
 * necesitan cambios.
 * ============================================================
 */
import { DIAS_CREDITO, MOMENTO_COBRO } from "$lib/config/pagos";
import { calcularTotales, ENVIO_ESTANDAR, ORDEN_ESTADOS } from "$lib/utils/pedido";
import type {
  CanalPedido,
  Comprobante,
  DatosPago,
  EstadoPago,
  EstadoPedido,
  EventoEstado,
  ItemPedido,
  Pedido,
} from "$lib/types/pedido";

export type { Pedido };

const HORA = 60 * 60 * 1000;

/** En el mock se escribe el nombre; el id del catálogo se resuelve al crear. */
type ItemBase = Omit<ItemPedido, "productoId">;

type PedidoBase = Omit<
  Pedido,
  | "items"
  | "canal"
  | "creadoPor"
  | "estadoPago"
  | "pagadoEn"
  | "vencimiento"
  | "subtotal"
  | "impuesto"
  | "envio"
  | "total"
  | "historial"
> & { items: ItemBase[]; envio?: number };

/**
 * Origen de cada pedido: `web` lo creó el cliente; el resto, un vendedor
 * (teléfono, WhatsApp o presencial).
 */
const ORIGEN_POR_ID: Record<
  number,
  { canal: CanalPedido; creadoPor?: string }
> = {
  1042: { canal: "web" },
  1041: { canal: "whatsapp", creadoPor: "Ana Gómez" },
  1040: { canal: "telefono", creadoPor: "Luis Torres" },
  1039: { canal: "whatsapp", creadoPor: "Ana Gómez" },
  1038: { canal: "web" },
  1037: { canal: "telefono", creadoPor: "Marta Ruiz" },
  1036: { canal: "web" },
  1035: { canal: "presencial", creadoPor: "Luis Torres" },
  1034: { canal: "whatsapp", creadoPor: "Ana Gómez" },
  1033: { canal: "web" },
  1032: { canal: "telefono", creadoPor: "Marta Ruiz" },
  1031: { canal: "web" },
  1030: { canal: "whatsapp", creadoPor: "Luis Torres" },
  1029: { canal: "presencial", creadoPor: "Ana Gómez" },
  1028: { canal: "web" },
  1027: { canal: "telefono", creadoPor: "Marta Ruiz" },
  1026: { canal: "telefono", creadoPor: "Ana Gómez" },
  1025: { canal: "web" },
};

/** Id del producto en el catálogo (coherente con productos.api.ts). */
const PRODUCTO_POR_NOMBRE: Record<string, number> = {
  "Coca-Cola 350ml": 1,
  "Agua Manantial 600ml": 2,
  "Cerveza Águila 330ml": 3,
  "Jugo Hit Mora 500ml": 4,
  "Speed Max 400ml": 5,
  "Postobón Uva 400ml": 6,
  "Agua con Gas 500ml": 7,
  "Pony Malta 330ml": 8,
  "Sprite 350ml": 9,
  "Fanta Naranja 350ml": 10,
  "Malta Leona 330ml": 11,
  "Gatorade Azul 500ml": 12,
  "Agua Cristal 1.5L": 13,
  "Jugo del Valle Naranja 1L": 14,
  "Cerveza Club Colombia 330ml": 15,
  "Red Bull 250ml": 16,
  "Colombiana 400ml": 17,
  "Manzana Postobón 400ml": 18,
};

/** SKU de la variante, cuando el producto del catálogo tiene opciones. */
const VARIANTE_POR_NOMBRE: Record<string, string> = {
  "Gatorade Azul 500ml": "GATOR-500-AZ",
  "Agua Cristal 1.5L": "CRISTAL-1500",
};

/**
 * Comprobante de ejemplo en revisión: demuestra que "evidencia ≠ cobro".
 * El pedido #1039 (transferencia) queda con el cobro por validar.
 * Con tu API real, esto llega desde tu backend.
 */
const COMPROBANTE_POR_ID: Record<number, Omit<Comprobante, "monto">> = {
  1039: {
    id: "CMP-1039",
    archivo: "transferencia-1039.pdf",
    tipo: "application/pdf",
    subidoPor: "cliente",
    subidoEn: "2026-10-09T18:30:00.000Z",
    referencia: "TRF-8842019",
  },
};

/**
 * Datos de cobro de ejemplo (transacción y, en tarjeta, sus datos).
 * Con tu API real, esto llega desde tu backend.
 */
const PAGO_POR_ID: Record<number, DatosPago> = {
  1034: { transaccionId: "TRX-556201" }, // transferencia
  1030: {
    transaccionId: "TRX-771903",
    tarjeta: {
      marca: "Visa",
      ultimos4: "4412",
      titular: "Sofía Arango",
      vencimiento: "08/28",
    },
  },
  1036: { transaccionId: "REC-2201" }, // efectivo (nro. de recibo)
};

/** Seguimiento coherente con el estado actual (la línea de tiempo del detalle). */
function construirHistorial(
  estado: EstadoPedido,
  fecha: string,
): EventoEstado[] {
  const inicio = new Date(fecha).getTime();

  if (estado === "cancelado") {
    return [
      { estado: "pendiente", fecha: new Date(inicio).toISOString() },
      { estado: "cancelado", fecha: new Date(inicio + 3 * HORA).toISOString() },
    ];
  }

  const hasta = ORDEN_ESTADOS.indexOf(estado);
  return ORDEN_ESTADOS.slice(0, hasta + 1).map((paso, indice) => ({
    estado: paso,
    fecha: new Date(inicio + indice * 8 * HORA).toISOString(),
  }));
}

/** Completa subtotal, impuesto, envío, total y seguimiento. */
function crearPedido(base: PedidoBase): Pedido {
  // El mock escribe el nombre; aquí se resuelve el producto del catálogo para
  // que el pedido pueda afectar inventario (mismo id que productos.api.ts).
  const items: ItemPedido[] = base.items.map((item) => {
    const varianteSku = VARIANTE_POR_NOMBRE[item.nombre];
    return {
      ...item,
      productoId: PRODUCTO_POR_NOMBRE[item.nombre] ?? 0,
      ...(varianteSku ? { varianteSku } : {}),
    };
  });

  const envio = base.envio ?? ENVIO_ESTANDAR;
  const totales = calcularTotales(items, envio);
  const historial = construirHistorial(base.estado, base.fecha);
  const origen = ORIGEN_POR_ID[base.id] ?? { canal: "web" as CanalPedido };

  // Capa financiera: el cobro depende del método y del avance del pedido.
  const momento = MOMENTO_COBRO[base.metodoPago];
  const ultimoEvento = historial[historial.length - 1];
  let estadoPago: EstadoPago = "pendiente";
  let pagadoEn: string | undefined;
  let vencimiento: string | undefined;

  if (base.estado === "cancelado") {
    // Si ya se había cobrado (pago anticipado), el dinero se devuelve.
    estadoPago = momento === "entrega" ? "pendiente" : "reembolsado";
  } else if (momento === "anticipado") {
    estadoPago = "pagado";
    pagadoEn = base.fecha;
  } else if (momento === "entrega") {
    if (base.estado === "entregado") {
      estadoPago = "pagado";
      pagadoEn = ultimoEvento.fecha;
    }
  } else {
    // Crédito: queda por cobrar, con fecha de vencimiento de la factura.
    vencimiento = new Date(
      new Date(base.fecha).getTime() + DIAS_CREDITO * 24 * HORA,
    ).toISOString();
  }

  // Comprobante de ejemplo: el cobro queda EN REVISIÓN hasta validarse.
  const comprobanteBase = COMPROBANTE_POR_ID[base.id];
  const comprobante: Comprobante | undefined = comprobanteBase
    ? { ...comprobanteBase, monto: totales.total }
    : undefined;
  if (comprobante && base.estado !== "cancelado") {
    estadoPago = "en_revision";
    pagadoEn = undefined;
    vencimiento = undefined;
  }

  const pago = PAGO_POR_ID[base.id];

  return {
    ...base,
    items,
    canal: origen.canal,
    ...(origen.creadoPor ? { creadoPor: origen.creadoPor } : {}),
    estadoPago,
    ...(pago ? { pago } : {}),
    ...(comprobante ? { comprobante } : {}),
    ...(pagadoEn ? { pagadoEn } : {}),
    ...(vencimiento ? { vencimiento } : {}),
    ...totales,
    historial,
  };
}

const MOCK_PEDIDOS: Pedido[] = [
  crearPedido({
    id: 1042,
    codigo: "#1042",
    fecha: "2026-10-10T09:12:00.000Z",
    estado: "pendiente",
    metodoPago: "Tarjeta",
    cliente: {
      nombre: "Camila Restrepo",
      email: "camila.restrepo@correo.com",
      telefono: "+57 300 214 7788",
      direccion: "Cra 43A #18-11, Medellín",
    },
    items: [
      {
        nombre: "Coca-Cola 350ml",
        imagen: "https://placehold.co/400x400/dc2626/ffffff?text=Coca-Cola",
        cantidad: 24,
        precioUnitario: 3500,
      },
      {
        nombre: "Agua Manantial 600ml",
        imagen: "https://placehold.co/400x400/0284c7/ffffff?text=Agua+600ml",
        cantidad: 12,
        precioUnitario: 2000,
      },
    ],
    notas: "Entregar antes de las 6 p.m. en portería.",
  }),
  crearPedido({
    id: 1041,
    codigo: "#1041",
    fecha: "2026-10-10T08:40:00.000Z",
    estado: "preparando",
    metodoPago: "Transferencia",
    cliente: {
      nombre: "Andrés Gómez",
      email: "andres.gomez@correo.com",
      telefono: "+57 301 558 9021",
      direccion: "Calle 100 #15-22, Bogotá",
    },
    items: [
      {
        nombre: "Cerveza Águila 330ml",
        imagen: "https://placehold.co/400x400/f59e0b/ffffff?text=Aguila",
        cantidad: 36,
        precioUnitario: 3800,
      },
    ],
  }),
  crearPedido({
    id: 1040,
    codigo: "#1040",
    fecha: "2026-10-10T08:05:00.000Z",
    estado: "pendiente",
    metodoPago: "Nequi",
    cliente: {
      nombre: "Valentina Ruiz",
      email: "valentina.ruiz@correo.com",
      telefono: "+57 304 771 2233",
      direccion: "Av. 68 #45-10, Bogotá",
    },
    items: [
      {
        nombre: "Jugo Hit Mora 500ml",
        imagen: "https://placehold.co/400x400/7c3aed/ffffff?text=Hit+Mora",
        cantidad: 18,
        precioUnitario: 4200,
      },
      {
        nombre: "Speed Max 400ml",
        cantidad: 6,
        precioUnitario: 3800,
      },
    ],
  }),
  crearPedido({
    id: 1039,
    codigo: "#1039",
    fecha: "2026-10-09T18:22:00.000Z",
    estado: "enviado",
    metodoPago: "Tarjeta",
    cliente: {
      nombre: "Juan Pablo Herrera",
      email: "jp.herrera@correo.com",
      telefono: "+57 318 442 6690",
      direccion: "Cra 7 #32-19, Bucaramanga",
    },
    items: [
      {
        nombre: "Pony Malta 330ml",
        imagen: "https://placehold.co/400x400/78350f/ffffff?text=Pony+Malta",
        cantidad: 24,
        precioUnitario: 3400,
      },
    ],
  }),
  crearPedido({
    id: 1038,
    codigo: "#1038",
    fecha: "2026-10-09T17:05:00.000Z",
    estado: "entregado",
    metodoPago: "Transferencia",
    cliente: {
      nombre: "Laura Jiménez",
      email: "laura.jimenez@correo.com",
      telefono: "+57 310 887 4412",
      direccion: "Calle 50 #22-40, Pereira",
    },
    items: [
      {
        nombre: "Gatorade Azul 500ml",
        imagen: "https://placehold.co/400x400/2563eb/ffffff?text=Gatorade",
        cantidad: 12,
        precioUnitario: 6200,
      },
      {
        nombre: "Red Bull 250ml",
        cantidad: 6,
        precioUnitario: 8900,
      },
    ],
  }),
  crearPedido({
    id: 1037,
    codigo: "#1037",
    fecha: "2026-10-09T15:48:00.000Z",
    estado: "preparando",
    metodoPago: "Tarjeta",
    cliente: {
      nombre: "Sebastián Mora",
      email: "sebastian.mora@correo.com",
      telefono: "+57 302 664 1180",
      direccion: "Cra 15 #78-04, Bogotá",
    },
    items: [
      {
        nombre: "Postobón Uva 400ml",
        imagen: "https://placehold.co/400x400/9333ea/ffffff?text=Postobon",
        cantidad: 30,
        precioUnitario: 3100,
      },
    ],
  }),
  crearPedido({
    id: 1036,
    codigo: "#1036",
    fecha: "2026-10-09T12:30:00.000Z",
    estado: "entregado",
    metodoPago: "Efectivo",
    cliente: {
      nombre: "Daniela Castro",
      email: "daniela.castro@correo.com",
      telefono: "+57 315 209 7734",
      direccion: "Calle 10 #4-51, Cali",
    },
    items: [
      {
        nombre: "Agua con Gas 500ml",
        cantidad: 24,
        precioUnitario: 2800,
      },
      {
        nombre: "Agua Cristal 1.5L",
        cantidad: 12,
        precioUnitario: 3200,
      },
    ],
  }),
  crearPedido({
    id: 1035,
    codigo: "#1035",
    fecha: "2026-10-08T19:10:00.000Z",
    estado: "cancelado",
    metodoPago: "Tarjeta",
    cliente: {
      nombre: "Felipe Rojas",
      email: "felipe.rojas@correo.com",
      telefono: "+57 320 118 5527",
      direccion: "Av. Boyacá #12-33, Bogotá",
    },
    items: [
      {
        nombre: "Cerveza Club Colombia 330ml",
        imagen: "https://placehold.co/400x400/1e293b/ffffff?text=Club+Colombia",
        cantidad: 48,
        precioUnitario: 5000,
      },
    ],
    notas: "El cliente no confirmó el pago.",
  }),
  crearPedido({
    id: 1034,
    codigo: "#1034",
    fecha: "2026-10-08T16:25:00.000Z",
    estado: "enviado",
    metodoPago: "Transferencia",
    cliente: {
      nombre: "Marcela Ospina",
      email: "marcela.ospina@correo.com",
      telefono: "+57 311 776 8899",
      direccion: "Cra 48 #20-14, Medellín",
    },
    items: [
      {
        nombre: "Coca-Cola 350ml",
        imagen: "https://placehold.co/400x400/dc2626/ffffff?text=Coca-Cola",
        cantidad: 24,
        precioUnitario: 3500,
      },
      {
        nombre: "Postobón Uva 400ml",
        cantidad: 12,
        precioUnitario: 3100,
      },
    ],
  }),
  crearPedido({
    id: 1033,
    codigo: "#1033",
    fecha: "2026-10-08T11:02:00.000Z",
    estado: "entregado",
    metodoPago: "Daviplata",
    cliente: {
      nombre: "Julián Vélez",
      email: "julian.velez@correo.com",
      telefono: "+57 305 332 4471",
      direccion: "Calle 76 #52-18, Barranquilla",
    },
    items: [
      {
        nombre: "Speed Max 400ml",
        imagen: "https://placehold.co/400x400/16a34a/ffffff?text=Speed+Max",
        cantidad: 18,
        precioUnitario: 3800,
      },
    ],
  }),
  crearPedido({
    id: 1032,
    codigo: "#1032",
    fecha: "2026-10-07T20:15:00.000Z",
    estado: "pendiente",
    metodoPago: "Tarjeta",
    cliente: {
      nombre: "Paula Restrepo",
      email: "paula.restrepo@correo.com",
      telefono: "+57 317 990 1152",
      direccion: "Cra 30 #71-40, Bogotá",
    },
    items: [
      {
        nombre: "Jugo Hit Mora 500ml",
        cantidad: 12,
        precioUnitario: 4200,
      },
      {
        nombre: "Agua Manantial 600ml",
        cantidad: 12,
        precioUnitario: 2000,
      },
    ],
  }),
  crearPedido({
    id: 1031,
    codigo: "#1031",
    fecha: "2026-10-07T14:37:00.000Z",
    estado: "entregado",
    metodoPago: "Transferencia",
    cliente: {
      nombre: "Ricardo Peña",
      email: "ricardo.pena@correo.com",
      telefono: "+57 300 445 6621",
      direccion: "Calle 15 #9-77, Manizales",
    },
    items: [
      {
        nombre: "Cerveza Águila 330ml",
        cantidad: 36,
        precioUnitario: 3800,
      },
      {
        nombre: "Pony Malta 330ml",
        cantidad: 12,
        precioUnitario: 3400,
      },
    ],
  }),
  crearPedido({
    id: 1030,
    codigo: "#1030",
    fecha: "2026-10-06T18:55:00.000Z",
    estado: "preparando",
    metodoPago: "Tarjeta",
    cliente: {
      nombre: "Sofía Arango",
      email: "sofia.arango@correo.com",
      telefono: "+57 314 220 9910",
      direccion: "Cra 9 #16-31, Ibagué",
    },
    items: [
      {
        nombre: "Red Bull 250ml",
        imagen: "https://placehold.co/400x400/b91c1c/ffffff?text=Red+Bull",
        cantidad: 12,
        precioUnitario: 8900,
      },
    ],
  }),
  crearPedido({
    id: 1029,
    codigo: "#1029",
    fecha: "2026-10-06T10:20:00.000Z",
    estado: "enviado",
    metodoPago: "Efectivo",
    cliente: {
      nombre: "Diego Salazar",
      email: "diego.salazar@correo.com",
      telefono: "+57 319 663 2277",
      direccion: "Av. Las Palmas #34-08, Medellín",
    },
    items: [
      {
        nombre: "Agua Cristal 1.5L",
        cantidad: 24,
        precioUnitario: 3200,
      },
      {
        nombre: "Agua con Gas 500ml",
        cantidad: 24,
        precioUnitario: 2800,
      },
    ],
  }),
  crearPedido({
    id: 1028,
    codigo: "#1028",
    fecha: "2026-10-05T17:44:00.000Z",
    estado: "entregado",
    metodoPago: "Transferencia",
    cliente: {
      nombre: "Natalia Quintero",
      email: "natalia.quintero@correo.com",
      telefono: "+57 312 887 3304",
      direccion: "Calle 93 #13-45, Bogotá",
    },
    items: [
      {
        nombre: "Gatorade Azul 500ml",
        cantidad: 18,
        precioUnitario: 6200,
      },
    ],
  }),
  crearPedido({
    id: 1027,
    codigo: "#1027",
    fecha: "2026-10-04T13:08:00.000Z",
    estado: "cancelado",
    metodoPago: "Efectivo",
    cliente: {
      nombre: "Óscar Mendoza",
      email: "oscar.mendoza@correo.com",
      telefono: "+57 306 551 7788",
      direccion: "Cra 21 #45-12, Cúcuta",
    },
    items: [
      {
        nombre: "Postobón Uva 400ml",
        cantidad: 6,
        precioUnitario: 3100,
      },
    ],
    notas: "Dirección fuera del área de entrega.",
  }),
  crearPedido({
    id: 1026,
    codigo: "#1026",
    fecha: "2026-10-03T19:26:00.000Z",
    estado: "pendiente",
    metodoPago: "Crédito",
    cliente: {
      nombre: "Carolina Lozano",
      email: "carolina.lozano@correo.com",
      telefono: "+57 313 440 2255",
      direccion: "Calle 30 #5-60, Santa Marta",
    },
    items: [
      {
        nombre: "Coca-Cola 350ml",
        cantidad: 36,
        precioUnitario: 3500,
      },
      {
        nombre: "Sprite 350ml",
        cantidad: 12,
        precioUnitario: 3400,
      },
    ],
  }),
  crearPedido({
    id: 1025,
    codigo: "#1025",
    fecha: "2026-10-02T09:50:00.000Z",
    estado: "entregado",
    metodoPago: "Crédito",
    cliente: {
      nombre: "Mateo Giraldo",
      email: "mateo.giraldo@correo.com",
      telefono: "+57 308 773 9912",
      direccion: "Cra 50 #10-25, Pereira",
    },
    items: [
      {
        nombre: "Cerveza Club Colombia 330ml",
        cantidad: 24,
        precioUnitario: 5000,
      },
      {
        nombre: "Malta Leona 330ml",
        cantidad: 12,
        precioUnitario: 3900,
      },
    ],
  }),
];

export async function obtenerPedidos(
  _fetch?: typeof fetch,
): Promise<Pedido[]> {
  return MOCK_PEDIDOS;
}
