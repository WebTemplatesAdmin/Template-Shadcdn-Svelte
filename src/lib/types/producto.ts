// Tipos compartidos entre servidor y cliente (client-safe)
export type EventoProducto = {
  id: number;
  tipo: "promocion" | "precio" | "stock" | "venta" | "creacion";
  titulo: string;
  detalle: string;
  fecha: string; // ISO 8601
  enlace?: string; // URL al origen del evento (ej. la promoción)
};