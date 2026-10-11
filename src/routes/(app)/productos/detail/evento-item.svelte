<script lang="ts">
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { cn } from "$lib/utils.js";
  import {
    formatearFecha,
    formatearHora,
    ICONO_EVENTO,
  } from "$lib/utils/producto";
  import type { EventoProducto } from "$lib/types/producto";

  let {
    evento,
    hora = false,
    reciente = false,
    class: className = "",
  }: {
    evento: EventoProducto;
    /** Muestra la hora en lugar de la fecha (útil en el timeline agrupado por día). */
    hora?: boolean;
    /** Marca el evento como el más reciente de la bitácora. */
    reciente?: boolean;
    class?: string;
  } = $props();

  const Icono = $derived(ICONO_EVENTO[evento.tipo]);
</script>

<!-- Item de la bitácora (reutilizable: ficha, formulario e historial) -->
<li class={cn("flex gap-3", className)}>
  <div
    class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted"
  >
    <Icono class="h-4 w-4 text-muted-foreground" />
  </div>

  <div class="flex min-w-0 flex-1 flex-col gap-1">
    <div class="flex items-start justify-between gap-2">
      <div class="flex min-w-0 flex-wrap items-center gap-2">
        <p class="text-sm font-medium leading-tight">{evento.titulo}</p>
        {#if reciente}
          <Badge variant="secondary">Más reciente</Badge>
        {/if}
      </div>
      <span class="shrink-0 text-[11px] text-muted-foreground">
        {hora ? formatearHora(evento.fecha) : formatearFecha(evento.fecha)}
      </span>
    </div>
    <p class="text-xs text-muted-foreground">{evento.detalle}</p>
    {#if evento.enlace}
      <a
        href={evento.enlace}
        class="inline-flex w-fit items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        Ver detalle
        <ArrowRight class="h-3 w-3" />
      </a>
    {/if}
  </div>
</li>
