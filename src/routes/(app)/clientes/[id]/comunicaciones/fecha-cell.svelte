<!-- src/routes/(app)/clientes/[id]/comunicaciones/fecha-cell.svelte -->
<script lang="ts">
  import { formatearFechaRelativa } from "$lib/utils/fecha";
  import { formatearFechaHoraPedido } from "$lib/utils/pedido";

  let { fecha }: { fecha: string } = $props();
</script>

<span
  class="whitespace-nowrap text-sm"
  title={formatearFechaRelativa(fecha)}
>
  {formatearFechaHoraPedido(fecha)}
</span>
