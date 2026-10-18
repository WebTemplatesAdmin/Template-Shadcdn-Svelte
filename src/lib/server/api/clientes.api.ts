/**
 * ============================================================
 * Mocks de clientes
 * ============================================================
 * El alta de pedidos parte de esta lista: se elige un cliente y se
 * "jalan" sus datos. Cuando conectes TU backend, reemplaza el contenido
 * de este archivo manteniendo el mismo nombre de función y el tipo de
 * retorno (`Cliente[]`): ni el formulario ni el selector necesitan cambios.
 * ============================================================
 */
import type { Cliente } from "$lib/types/cliente";

export type { Cliente };

const DIA = 24 * 60 * 60 * 1000;

/** Fecha relativa a hoy para que la bitácora siempre se vea vigente. */
function hace(dias: number): string {
  return new Date(Date.now() - dias * DIA).toISOString();
}

/** Coherentes con los clientes que aparecen en `pedidos.api.ts`. */
const MOCK_CLIENTES: Cliente[] = [
  {
    id: 1,
    nombre: "Camila Restrepo",
    email: "camila.restrepo@correo.com",
    telefono: "+57 300 214 7788",
    direccion: "Cra 43A #18-11, Medellín",
    ciudad: "Medellín",
    tarjetas: [
      {
        id: "TAR-1-A",
        clienteId: 1,
        marca: "Visa",
        ultimos4: "4412",
        titular: "Camila Restrepo",
        vencimiento: "08/28",
        token: "tok_visa_4412",
        predeterminada: true,
        creadaEn: "2026-08-12T14:22:00.000Z",
      },
    ],
    notas: [
      {
        id: "NOT-1-B",
        clienteId: 1,
        tipo: "nota",
        contenido: "Prefiere entregas los sábados por la mañana.",
        autor: "Juan Pérez",
        creadoEn: hace(9),
      },
    ],
    comunicaciones: [
      {
        id: "COM-1-A",
        clienteId: 1,
        canal: "llamada",
        direccion: "saliente",
        resultado: "contactado",
        duracionSegundos: 200,
        contenido: "Se confirmó la dirección y el horario de entrega.",
        autor: "Juan Pérez",
        creadoEn: hace(2),
      },
      {
        id: "COM-1-B",
        clienteId: 1,
        canal: "whatsapp",
        direccion: "entrante",
        resultado: "contactado",
        contenido: "Envió el comprobante de pago por WhatsApp.",
        autor: "Juan Pérez",
        creadoEn: hace(3),
      },
      {
        id: "COM-1-C",
        clienteId: 1,
        canal: "chat",
        direccion: "saliente",
        resultado: "contactado",
        contenido: "Respondió dudas sobre el tiempo de entrega.",
        autor: "Juan Pérez",
        creadoEn: hace(8),
      },
    ],
    creadoEn: "2026-08-12T14:20:00.000Z",
  },
  {
    id: 2,
    nombre: "Andrés Gómez",
    email: "andres.gomez@correo.com",
    telefono: "+57 301 558 9021",
    direccion: "Calle 100 #15-22, Bogotá",
    ciudad: "Bogotá",
    tarjetas: [
      {
        id: "TAR-2-A",
        clienteId: 2,
        marca: "Mastercard",
        ultimos4: "8830",
        titular: "Andrés Gómez",
        vencimiento: "03/27",
        token: "tok_mastercard_8830",
        predeterminada: true,
        creadaEn: "2026-08-15T09:08:00.000Z",
      },
    ],
    notas: [
      {
        id: "NOT-2-A",
        clienteId: 2,
        tipo: "restriccion",
        contenido:
          "No recibir llamadas antes de las 10:00 a.m. Contactar por WhatsApp.",
        autor: "Juan Pérez",
        creadoEn: hace(15),
      },
      {
        id: "NOT-2-B",
        clienteId: 2,
        tipo: "nota",
        contenido:
          "Paga siempre por transferencia; enviar el comprobante al correo.",
        autor: "Juan Pérez",
        creadoEn: hace(20),
      },
    ],
    comunicaciones: [
      {
        id: "COM-2-A",
        clienteId: 2,
        canal: "llamada",
        direccion: "entrante",
        resultado: "sin_respuesta",
        contenido: "No contestó; se dejó mensaje de voz.",
        autor: "Juan Pérez",
        creadoEn: hace(15),
      },
      {
        id: "COM-2-B",
        clienteId: 2,
        canal: "email",
        direccion: "saliente",
        resultado: "contactado",
        contenido: "Se envió la factura y el enlace de pago.",
        autor: "Juan Pérez",
        creadoEn: hace(18),
      },
      {
        id: "COM-2-C",
        clienteId: 2,
        canal: "whatsapp",
        direccion: "entrante",
        resultado: "contactado",
        contenido: "Confirmó el pago por transferencia.",
        autor: "Juan Pérez",
        creadoEn: hace(19),
      },
    ],
    creadoEn: "2026-08-15T09:05:00.000Z",
  },
  {
    id: 3,
    nombre: "Valentina Ruiz",
    email: "valentina.ruiz@correo.com",
    telefono: "+57 304 771 2233",
    direccion: "Av. 68 #45-10, Bogotá",
    ciudad: "Bogotá",
    comunicaciones: [
      {
        id: "COM-3-A",
        clienteId: 3,
        canal: "llamada",
        direccion: "saliente",
        resultado: "contactado",
        duracionSegundos: 300,
        contenido:
          "Se le ofreció el catálogo nuevo; retoma la próxima semana.",
        autor: "Juan Pérez",
        creadoEn: hace(4),
      },
      {
        id: "COM-3-B",
        clienteId: 3,
        canal: "whatsapp",
        direccion: "saliente",
        resultado: "contactado",
        contenido: "Se envió el catálogo por WhatsApp.",
        autor: "Juan Pérez",
        creadoEn: hace(5),
      },
    ],
    creadoEn: "2026-08-20T16:40:00.000Z",
  },
  {
    id: 4,
    nombre: "Juan Pablo Herrera",
    email: "jp.herrera@correo.com",
    telefono: "+57 318 442 6690",
    direccion: "Cra 7 #32-19, Bucaramanga",
    ciudad: "Bucaramanga",
    creadoEn: "2026-08-22T11:10:00.000Z",
  },
  {
    id: 5,
    nombre: "Laura Jiménez",
    email: "laura.jimenez@correo.com",
    telefono: "+57 310 887 4412",
    direccion: "Calle 50 #22-40, Pereira",
    ciudad: "Pereira",
    creadoEn: "2026-08-25T08:30:00.000Z",
  },
  {
    id: 6,
    nombre: "Sebastián Mora",
    email: "sebastian.mora@correo.com",
    telefono: "+57 302 664 1180",
    direccion: "Cra 15 #78-04, Bogotá",
    ciudad: "Bogotá",
    creadoEn: "2026-08-27T15:55:00.000Z",
  },
  {
    id: 7,
    nombre: "Daniela Castro",
    email: "daniela.castro@correo.com",
    telefono: "+57 315 209 7734",
    direccion: "Calle 10 #4-51, Cali",
    ciudad: "Cali",
    creadoEn: "2026-09-01T10:15:00.000Z",
  },
  {
    id: 8,
    nombre: "Felipe Rojas",
    email: "felipe.rojas@correo.com",
    telefono: "+57 320 118 5527",
    direccion: "Av. Boyacá #12-33, Bogotá",
    ciudad: "Bogotá",
    notas: [
      {
        id: "NOT-8-A",
        clienteId: 8,
        tipo: "restriccion",
        contenido:
          "No despachar contra entrega: confirmar el pago antes de enviar.",
        autor: "Juan Pérez",
        creadoEn: hace(6),
      },
    ],
    comunicaciones: [
      {
        id: "COM-8-A",
        clienteId: 8,
        canal: "llamada",
        direccion: "entrante",
        resultado: "ocupado",
        contenido: "Llamó y colgó; se devolvió la llamada sin respuesta.",
        autor: "Juan Pérez",
        creadoEn: hace(6),
      },
    ],
    creadoEn: "2026-09-03T18:05:00.000Z",
  },
  {
    id: 9,
    nombre: "Marcela Ospina",
    email: "marcela.ospina@correo.com",
    telefono: "+57 311 776 8899",
    direccion: "Cra 48 #20-14, Medellín",
    ciudad: "Medellín",
    creadoEn: "2026-09-06T12:45:00.000Z",
  },
  {
    id: 10,
    nombre: "Julián Vélez",
    email: "julian.velez@correo.com",
    telefono: "+57 305 332 4471",
    direccion: "Calle 76 #52-18, Barranquilla",
    ciudad: "Barranquilla",
    creadoEn: "2026-09-08T09:25:00.000Z",
  },
  {
    id: 11,
    nombre: "Paula Restrepo",
    email: "paula.restrepo@correo.com",
    telefono: "+57 317 990 1152",
    direccion: "Cra 30 #71-40, Bogotá",
    ciudad: "Bogotá",
    creadoEn: "2026-09-10T17:00:00.000Z",
  },
  {
    id: 12,
    nombre: "Ricardo Peña",
    email: "ricardo.pena@correo.com",
    telefono: "+57 300 445 6621",
    direccion: "Calle 15 #9-77, Manizales",
    ciudad: "Manizales",
    notas: [
      {
        id: "NOT-12-A",
        clienteId: 12,
        tipo: "nota",
        contenido: "Cliente recurrente; aplica descuento por volumen.",
        autor: "Juan Pérez",
        creadoEn: hace(12),
      },
    ],
    comunicaciones: [
      {
        id: "COM-12-A",
        clienteId: 12,
        canal: "whatsapp",
        direccion: "entrante",
        resultado: "contactado",
        contenido: "Pidió cotización por volumen.",
        autor: "Juan Pérez",
        creadoEn: hace(12),
      },
    ],
    creadoEn: "2026-09-12T13:35:00.000Z",
  },
  {
    id: 13,
    nombre: "Sofía Arango",
    email: "sofia.arango@correo.com",
    telefono: "+57 314 220 9910",
    direccion: "Cra 9 #16-31, Ibagué",
    ciudad: "Ibagué",
    creadoEn: "2026-09-15T10:50:00.000Z",
  },
  {
    id: 14,
    nombre: "Diego Salazar",
    email: "diego.salazar@correo.com",
    telefono: "+57 319 663 2277",
    direccion: "Av. Las Palmas #34-08, Medellín",
    ciudad: "Medellín",
    creadoEn: "2026-09-18T08:10:00.000Z",
  },
  {
    id: 15,
    nombre: "Natalia Quintero",
    email: "natalia.quintero@correo.com",
    telefono: "+57 312 887 3304",
    direccion: "Calle 93 #13-45, Bogotá",
    ciudad: "Bogotá",
    creadoEn: "2026-09-20T16:20:00.000Z",
  },
  {
    id: 16,
    nombre: "Óscar Mendoza",
    email: "oscar.mendoza@correo.com",
    telefono: "+57 306 551 7788",
    direccion: "Cra 21 #45-12, Cúcuta",
    ciudad: "Cúcuta",
    creadoEn: "2026-09-22T11:55:00.000Z",
  },
  {
    id: 17,
    nombre: "Carolina Lozano",
    email: "carolina.lozano@correo.com",
    telefono: "+57 313 440 2255",
    direccion: "Calle 30 #5-60, Santa Marta",
    ciudad: "Santa Marta",
    creadoEn: "2026-09-25T09:40:00.000Z",
  },
  {
    id: 18,
    nombre: "Mateo Giraldo",
    email: "mateo.giraldo@correo.com",
    telefono: "+57 308 773 9912",
    direccion: "Cra 50 #10-25, Pereira",
    ciudad: "Pereira",
    creadoEn: "2026-09-28T14:30:00.000Z",
  },
];

export async function obtenerClientes(
  _fetch?: typeof fetch,
): Promise<Cliente[]> {
  return MOCK_CLIENTES;
}
