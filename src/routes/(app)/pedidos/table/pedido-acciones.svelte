<!-- src/routes/(app)/pedidos/table/pedido-acciones.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import type { Pedido } from "$lib/types/pedido";

  let {
    pedido,
    onVer,
  }: { pedido: Pedido; onVer: (pedido: Pedido) => void } = $props();
</script>

<Button variant="outline" size="sm" onclick={() => onVer(pedido)}>
  Ver detalle
</Button>
