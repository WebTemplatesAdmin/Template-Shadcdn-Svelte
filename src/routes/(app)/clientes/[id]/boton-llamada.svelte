<!-- src/routes/(app)/clientes/[id]/boton-llamada.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import LoaderCircle from "@lucide/svelte/icons/loader-circle";
  import Phone from "@lucide/svelte/icons/phone";
  import { notificarError, notificarExito } from "$lib/utils/notify";
  import {
    formatearTelefono,
    normalizarTelefono,
  } from "$lib/utils/telefono";
  import type { Cliente } from "$lib/types/cliente";

  type RespuestaApi =
    | {
        ok: true;
        llamada: { llamadaId: string; estado: string };
        mensaje: string;
      }
    | { ok: false; codigo: string; mensaje: string };

  let { cliente }: { cliente: Cliente } = $props();

  const telefono = $derived(normalizarTelefono(cliente.telefono));
  let cargando = $state(false);

  async function llamar() {
    if (!telefono || cargando) return;

    cargando = true;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12_000);

    try {
      const respuesta = await fetch("/api/llamadas", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": globalThis.crypto.randomUUID(),
        },
        body: JSON.stringify({
          clienteId: cliente.id,
          nombre: cliente.nombre,
          telefono,
        }),
        signal: ctrl.signal,
      });

      const datos = (await respuesta.json().catch(() => null)) as
        | RespuestaApi
        | null;

      if (!respuesta.ok || !datos?.ok) {
        notificarError(
          "No se pudo iniciar la llamada",
          datos && !datos.ok
            ? datos.mensaje
            : "El servicio de llamadas devolvió una respuesta inválida.",
        );
        return;
      }

      notificarExito(
        "Llamada iniciada",
        `${formatearTelefono(telefono)} · ${datos.llamada.llamadaId}`,
      );
    } catch (error) {
      if ((error as Error)?.name === "AbortError") {
        notificarError(
          "Tiempo de espera agotado",
          "La plataforma de llamadas tardó demasiado en responder.",
        );
      } else {
        notificarError(
          "Sin conexión",
          "No se pudo contactar con el servicio de llamadas.",
        );
      }
    } finally {
      clearTimeout(timer);
      cargando = false;
    }
  }
</script>

<div class="flex flex-col gap-1 sm:items-end">
  <Button
    type="button"
    class="w-full sm:w-auto"
    disabled={!telefono || cargando}
    aria-busy={cargando}
    aria-describedby="llamada-ayuda"
    title={!telefono
      ? "El cliente no tiene un teléfono válido registrado"
      : undefined}
    onclick={llamar}
  >
    {#if cargando}
      <LoaderCircle class="animate-spin" data-icon="inline-start" />
      Llamando…
    {:else}
      <Phone data-icon="inline-start" />
      Llamar
    {/if}
  </Button>

  <p id="llamada-ayuda" class="text-xs text-muted-foreground">
    {#if telefono}
      Se marcará {formatearTelefono(telefono)}
    {:else}
      Sin teléfono válido registrado
    {/if}
  </p>
</div>
