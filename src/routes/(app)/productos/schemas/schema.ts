// src/routes/(app)/productos/registrar/schema.ts
import { z } from "zod";

const tipoEnvase = ["vidrio", "pet", "lata", "tetrapak"] as const;

const presentacionSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"), // ej: "Six-pack", "Caja x24"
  sku: z.string().min(1, "El SKU es requerido"),
  codigoBarras: z.string().optional(),
  unidadesPorPaquete: z.coerce.number().int().min(2, "Debe ser un paquete de 2 o más unidades"),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
});

export const productoSchema = z.object({
  // ============ General ============
  name: z.string().min(1, "El nombre es requerido").max(150),
  description: z.string().max(500).optional(),
  category: z.string().min(1, "Selecciona una categoría"),
  brand: z.string().optional(),
  supplierId: z.string().optional(),

  // ============ Específico de bebidas ============
  volumen: z.coerce.number().positive("El volumen debe ser mayor a 0"),
  unidadVolumen: z.enum(["ml", "l"]).default("ml"),
  tipoEnvase: z.enum(tipoEnvase),
  retornable: z.boolean().default(false),
  gradosAlcohol: z.coerce.number().min(0).max(100).default(0),
  diasVidaUtil: z.coerce.number().int().positive().optional(),

  // ============ Precio de la unidad individual ============
  costPrice: z.coerce.number().nonnegative("El costo no puede ser negativo"),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  currency: z.enum(["COP", "USD", "MXN"]).default("COP"),
  taxRate: z.enum(["0", "5", "19"]).default("19"),

  // ============ Inventario (SIEMPRE en unidad base) ============
  stock: z.coerce.number().int().nonnegative("El stock no puede ser negativo"),
  minStock: z.coerce.number().int().nonnegative().default(20),
  location: z.string().max(100).optional(),

  // ============ Presentaciones adicionales (paquetes, opcional) ============
  presentaciones: z.array(presentacionSchema).default([]),

  // ============ Estado ============
  status: z.enum(["activo", "inactivo", "borrador"]).default("activo"),
  featured: z.boolean().default(false),
});

export type ProductoSchema = typeof productoSchema;
export type Presentacion = z.infer<typeof presentacionSchema>;