<!-- src/routes/(app)/clientes/[id]/comunicaciones/resultado-cell.svelte -->
<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import type { ResultadoComunicacion } from "$lib/types/cliente";
  import {
    ESTILO_RESULTADO,
    ETIQUETA_RESULTADO,
  } from "$lib/utils/comunicacion";

  let { resultado }: { resultado: ResultadoComunicacion } = $props();

  const estilo = $derived(ESTILO_RESULTADO[resultado]);
</script>

<Badge variant={estilo.variante} class={estilo.clase}>
  {ETIQUETA_RESULTADO[resultado]}
</Badge>
