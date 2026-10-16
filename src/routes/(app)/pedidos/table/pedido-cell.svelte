<!-- src/routes/(app)/pedidos/table/pedido-cell.svelte -->
<script lang="ts">
  import { formatearFechaPedido } from "$lib/utils/pedido";

  let { codigo, fecha }: { codigo: string; fecha: string } = $props();
</script>

<div class="flex flex-col">
  <span class="font-mono text-sm font-medium">{codigo}</span>
  <span class="text-xs text-muted-foreground">
    {formatearFechaPedido(fecha)}
  </span>
</div>
