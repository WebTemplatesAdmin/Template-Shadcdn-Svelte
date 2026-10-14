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

// Especificaciones variables por rubro (talla, color, peso, volumen, envase…).
export type AtributoProducto = {
  nombre: string;
  valor: string;
};

// Opción de variación (ej. Talla con valores S, M, L).
export type OpcionProducto = {
  nombre: string;
  valores: string[];
};

// Combinación vendible con SKU, precio y stock propios (ej. Talla M · Negro).
export type VarianteProducto = {
  sku: string;
  opciones: Record<string, string>;
  price: number;
  costPrice?: number;
  stock: number;
  codigoBarras?: string;
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
  diasVidaUtil?: number;
  costPrice?: number;
  currency?: "COP" | "USD" | "MXN";
  taxRate?: "0" | "5" | "19";
  location?: string;
  presentaciones?: PresentacionProducto[];
  atributos?: AtributoProducto[];
  opciones?: OpcionProducto[];
  variantes?: VarianteProducto[];
  status?: "activo" | "inactivo" | "borrador";
  featured?: boolean;
};