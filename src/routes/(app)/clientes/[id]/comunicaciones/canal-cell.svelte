<!-- src/routes/(app)/clientes/[id]/comunicaciones/canal-cell.svelte -->
<script lang="ts">
  import type { CanalComunicacion } from "$lib/types/cliente";
  import { ETIQUETA_CANAL } from "$lib/utils/comunicacion";
  import { cn } from "$lib/utils.js";
  import { COLORES_CANAL, ICONOS_CANAL } from "./iconos";

  let { canal }: { canal: CanalComunicacion } = $props();

  const Icono = $derived(ICONOS_CANAL[canal]);
</script>

<div class="flex items-center gap-2">
  <Icono class={cn("size-4", COLORES_CANAL[canal])} />
  <span class="whitespace-nowrap text-sm">{ETIQUETA_CANAL[canal]}</span>
</div>
