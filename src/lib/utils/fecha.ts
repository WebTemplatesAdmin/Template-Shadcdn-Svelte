// src/lib/utils/fecha.ts
// Formato relativo corto compartido por bitácoras y comunicaciones.

/** "hoy", "ayer", "hace N días" o fecha corta si supera el mes. */
export function formatearFechaRelativa(fecha: string): string {
  const dias = Math.floor(
    (Date.now() - new Date(fecha).getTime()) / 86_400_000,
  );
  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  if (dias < 30) return `hace ${dias} días`;
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
