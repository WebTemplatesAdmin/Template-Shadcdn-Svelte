import { toast } from "svelte-sonner";
import NotificationCard from "$lib/components/ui/sonner/notification-card.svelte";

/** Tipos de notificación soportados por la tarjeta. */
export type TipoNotificacion = "success" | "error" | "warning" | "info";

/**
 * Muestra una notificación con el diseño de tarjeta (mismo para todos los tipos).
 * Devuelve el id del toast para poder cerrarlo programáticamente.
 */
function notificar(
  tipo: TipoNotificacion,
  titulo: string,
  descripcion?: string,
  duracion = 5000,
): string | number {
  // El id se necesita para poder cerrarlo desde el botón de la tarjeta.
  const ref: { id: string | number } = { id: "" };
  ref.id = toast.custom(NotificationCard, {
    componentProps: {
      tipo,
      titulo,
      descripcion,
      duracion,
      cerrar: () => toast.dismiss(ref.id),
    },
    duration: duracion,
  });
  return ref.id;
}

/** Confirmación (verde). */
export function notificarExito(titulo: string, descripcion?: string) {
  return notificar("success", titulo, descripcion);
}

/** Error (rojo). Dura algo más por ser más importante. */
export function notificarError(titulo: string, descripcion?: string) {
  return notificar("error", titulo, descripcion, 6000);
}

/** Aviso / advertencia (ámbar). */
export function notificarAviso(titulo: string, descripcion?: string) {
  return notificar("warning", titulo, descripcion);
}

/** Información neutral (azul). */
export function notificarInfo(titulo: string, descripcion?: string) {
  return notificar("info", titulo, descripcion);
}
