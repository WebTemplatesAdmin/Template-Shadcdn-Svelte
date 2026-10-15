<!-- src/routes/(app)/pedidos/table/estado-cell.svelte -->
<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import type { EstadoPedido } from "$lib/types/pedido";
  import { ESTILO_ESTADO, ETIQUETA_ESTADO } from "$lib/utils/pedido";

  let { estado }: { estado: EstadoPedido } = $props();

  const estilo = $derived(ESTILO_ESTADO[estado]);
</script>

<Badge variant={estilo.variante} class={estilo.clase}>
  {ETIQUETA_ESTADO[estado]}
</Badge>
