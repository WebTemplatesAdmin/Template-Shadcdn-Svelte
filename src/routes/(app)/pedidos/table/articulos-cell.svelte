<!-- src/routes/(app)/pedidos/table/articulos-cell.svelte -->
<script lang="ts">
  import type { Pedido } from "$lib/types/pedido";
  import { contarArticulos, totalUnidades } from "$lib/utils/pedido";

  let { pedido }: { pedido: Pedido } = $props();

  const lineas = $derived(contarArticulos(pedido));
</script>

<div class="flex flex-col">
  <span class="text-sm">
    {lineas}
    {lineas === 1 ? "línea" : "líneas"}
  </span>
  <span class="text-xs text-muted-foreground">
    {totalUnidades(pedido)} unidades
  </span>
</div>
