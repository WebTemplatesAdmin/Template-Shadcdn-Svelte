import { toast } from "svelte-sonner";
import NotificationCard from "$lib/components/ui/sonner/notification-card.svelte";

/**
 * Toast de CONFIRMACIÓN (éxito) con formato de tarjeta:
 * icono, título, descripción opcional, botón de cierre y barra de progreso.
 *
 * Uso: notificarExito("Producto eliminado", "El producto se eliminó correctamente.")
 */
export function notificarExito(
  titulo: string,
  descripcion?: string,
  duracion = 5000,
): string | number {
  // El id se necesita para poder cerrarlo desde el botón de la tarjeta.
  const ref: { id: string | number } = { id: "" };
  ref.id = toast.custom(NotificationCard, {
    componentProps: {
      titulo,
      descripcion,
      duracion,
      cerrar: () => toast.dismiss(ref.id),
    },
    duration: duracion,
  });
  return ref.id;
}
