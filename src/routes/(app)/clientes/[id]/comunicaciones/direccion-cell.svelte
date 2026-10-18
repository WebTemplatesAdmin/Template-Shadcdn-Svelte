<!-- src/routes/(app)/clientes/[id]/comunicaciones/direccion-cell.svelte -->
<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import type { DireccionComunicacion } from "$lib/types/cliente";
  import { ETIQUETA_DIRECCION } from "$lib/utils/comunicacion";
  import ArrowDownLeft from "@lucide/svelte/icons/arrow-down-left";
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";

  let { direccion }: { direccion: DireccionComunicacion } = $props();

  const ESTILO: Record<DireccionComunicacion, string> = {
    entrante: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
    saliente: "border-sky-500/40 bg-sky-500/10 text-sky-600",
  };
</script>

<Badge variant="outline" class={ESTILO[direccion]}>
  {#if direccion === "entrante"}
    <ArrowDownLeft />
  {:else}
    <ArrowUpRight />
  {/if}
  {ETIQUETA_DIRECCION[direccion]}
</Badge>
