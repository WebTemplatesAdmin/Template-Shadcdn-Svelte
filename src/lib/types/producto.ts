// Tipos compartidos entre servidor y cliente (client-safe)
export type EventoProducto = {
  id: number;
  tipo: "promocion" | "precio" | "stock" | "venta" | "creacion";
  titulo: string;
  detalle: string;
  fecha: string; // ISO 8601
  enlace?: string; // URL al origen del evento (ej. la promoción)
};

// Fuente ÚNICA del tipo de producto (client-safe), compartida por
// la capa API (servidor), la tabla, los formularios y la vista de detalle.
export type PresentacionProducto = {
  nombre: string;
  sku: string;
  codigoBarras?: string;
  unidadesPorPaquete: number;
  price: number;
  imagen?: string;
};

export type Producto = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;

  // Opcionales: pueden no venir de la API externa / mock.
  minStock?: number;
  imagenes?: string[];

  // Campos propios del negocio (el backend real sí los enviará).
  description?: string;
  brand?: string;
  supplierId?: string;
  sku?: string;
  codigoBarras?: string;
  volumen?: number;
  unidadVolumen?: "ml" | "l";
  tipoEnvase?: "vidrio" | "pet" | "lata" | "tetrapak";
  retornable?: boolean;
  gradosAlcohol?: number;
  diasVidaUtil?: number;
  costPrice?: number;
  currency?: "COP" | "USD" | "MXN";
  taxRate?: "0" | "5" | "19";
  location?: string;
  presentaciones?: PresentacionProducto[];
  status?: "activo" | "inactivo" | "borrador";
  featured?: boolean;
};