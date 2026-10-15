// src/routes/(app)/productos/registrar/schema.ts
import { z } from "zod";

/**
 * Trata una cadena vacía como "sin valor" para que `z.coerce` no la convierta
 * en 0. Sin esto, un campo numérico vacío pasaría la validación como 0.
 */
const numeroRequerido = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (valor) =>
      typeof valor === "string" && valor.trim() === "" ? undefined : valor,
    schema,
  );

const presentacionSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"), // ej: "Six-pack", "Caja x24"
  sku: z.string().min(1, "El SKU es requerido"),
  codigoBarras: z.string().optional(),
  unidadesPorPaquete: z.coerce
    .number()
    .int()
    .min(2, "Debe ser un paquete de 2 o más unidades"),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  imagen: z.string().default(""), // opcional, 1 sola imagen por presentación
});

const atributoSchema = z.object({
  nombre: z.string().min(1, "El nombre del atributo es requerido").max(50),
  valor: z.string().min(1, "El valor es requerido").max(120),
});

const opcionSchema = z.object({
  nombre: z.string().min(1, "El nombre de la opción es requerido").max(30),
  valores: z.array(z.string().min(1)).default([]),
});

const varianteSchema = z.object({
  sku: z.string().min(1, "El SKU es requerido").max(50),
  opciones: z.record(z.string(), z.string()),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  costPrice: z.coerce.number().nonnegative().optional(),
  stock: numeroRequerido(
    z.coerce
      .number({ error: "El stock es requerido" })
      .int("El stock debe ser un número entero")
      .nonnegative("El stock no puede ser negativo"),
  ),
  codigoBarras: z.string().max(50).optional(),
});

export const productoSchema = z.object({
  // ============ General ============
  name: z.string().min(1, "El nombre es requerido").max(150),
  description: z.string().max(500).optional(),
  category: z.string().min(1, "Selecciona una categoría"),
  brand: z.string().optional(),
  supplierId: z.string().optional(),
  sku: z.string().min(1, "El SKU es requerido").max(50),
  codigoBarras: z.string().max(50).optional(),

  // ============ Especificaciones / atributos (genérico) ============
  diasVidaUtil: z.coerce.number().int().positive().optional(),
  atributos: z.array(atributoSchema).default([]),

  // ============ Variantes (opciones con stock/precio propios) ============
  opciones: z.array(opcionSchema).default([]),
  variantes: z.array(varianteSchema).default([]),

  // ============ Precio de la unidad individual ============
  costPrice: numeroRequerido(
    z.coerce
      .number({ error: "El costo es requerido" })
      .nonnegative("El costo no puede ser negativo"),
  ),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  currency: z.enum(["COP", "USD", "MXN"]).default("COP"),
  taxRate: z.enum(["0", "5", "19"]).default("19"),

  // ============ Inventario (SIEMPRE en unidad base) ============
  stock: numeroRequerido(
    z.coerce
      .number({ error: "El stock es requerido" })
      .int("El stock debe ser un número entero")
      .nonnegative("El stock no puede ser negativo"),
  ),
  minStock: numeroRequerido(
    z.coerce
      .number()
      .int("El stock mínimo debe ser un número entero")
      .nonnegative("El stock mínimo no puede ser negativo")
      .default(20),
  ),
  location: z.string().max(100).optional(),

  // ============ Presentaciones adicionales (paquetes, opcional) ============
  presentaciones: z.array(presentacionSchema).default([]),

  // ============ Estado ============
  status: z.enum(["activo", "inactivo", "borrador"]).default("activo"),
  featured: z.boolean().default(false),

  // ============ Imágenes (opcional, nunca bloquea) ============
  imagenes: z.array(z.string()).default([]),
});

export type ProductoSchema = typeof productoSchema;
export type Presentacion = z.infer<typeof presentacionSchema>;
export type Atributo = z.infer<typeof atributoSchema>;
export type Opcion = z.infer<typeof opcionSchema>;
export type Variante = z.infer<typeof varianteSchema>;

// ============ Contrato con la API (payload) ============
export type ProductoDatos = z.infer<typeof productoSchema>;
export type ProductoPayload = ProductoDatos & { id?: number };

/**
 * Construye el JSON que se envía a tu backend.
 * Único punto de conexión: aquí llamas a `POST /productos` (alta) o
 * `PUT /productos/:id` (edición) con el objeto devuelto.
 */
export function construirPayloadProducto(
  datos: ProductoDatos,
  id?: number,
): ProductoPayload {
  return id === undefined ? { ...datos } : { id, ...datos };
}
