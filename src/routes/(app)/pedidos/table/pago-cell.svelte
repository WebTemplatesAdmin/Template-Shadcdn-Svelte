<!-- src/routes/(app)/pedidos/table/pago-cell.svelte -->
<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import type { EstadoPago, MetodoPago } from "$lib/types/pedido";
  import { ESTILO_PAGO, ETIQUETA_PAGO } from "$lib/utils/pedido";

  let {
    metodo,
    estadoPago,
  }: { metodo: MetodoPago; estadoPago: EstadoPago } = $props();

  const estilo = $derived(ESTILO_PAGO[estadoPago]);
</script>

<div class="flex flex-col items-start gap-1">
  <span class="text-sm">{metodo}</span>
  <Badge variant={estilo.variante} class={estilo.clase}>
    {ETIQUETA_PAGO[estadoPago]}
  </Badge>
</div>
