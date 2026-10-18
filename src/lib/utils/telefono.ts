// src/lib/utils/telefono.ts
// Normalización y validación de teléfonos para llamadas salientes.

/**
 * Limpia espacios, guiones, puntos y paréntesis y devuelve el número en
 * formato E.164 (+573002147788). Devuelve null si no es un número válido.
 *
 * - Con prefijo internacional: 7–15 dígitos.
 * - Sin prefijo y 10 dígitos: asume Colombia (+57).
 * - Sin prefijo y 11–15 dígitos: se interpreta como número internacional.
 */
export function normalizarTelefono(
  valor: string | null | undefined,
  pais = "+57",
): string | null {
  const original = (valor ?? "").trim();
  if (!original) return null;

  const compacto = original.replace(/[\s().-]/g, "");
  if (!/^\+?\d+$/.test(compacto)) return null;

  let numero = compacto;
  // Prefijo internacional marcado como 00xx.
  if (numero.startsWith("00")) numero = `+${numero.slice(2)}`;

  if (numero.startsWith("+")) {
    const digitos = numero.slice(1);
    return digitos.length >= 7 && digitos.length <= 15
      ? `+${digitos}`
      : null;
  }

  if (numero.length === 10) return `${pais}${numero}`;
  if (numero.length >= 11 && numero.length <= 15) return `+${numero}`;
  return null;
}

export function esTelefonoValido(valor: string | null | undefined): boolean {
  return normalizarTelefono(valor) !== null;
}

/** Presentación legible; para Colombia agrupa como +57 300 214 7788. */
export function formatearTelefono(e164: string): string {
  const colombia = /^\+57(\d{3})(\d{3})(\d{4})$/.exec(e164);
  if (colombia) return `+57 ${colombia[1]} ${colombia[2]} ${colombia[3]}`;
  return e164;
}
