<script lang="ts">
  let {
    stock,
    minStock = 0,
  }: {
    stock: number;
    minStock?: number;
  } = $props();

  const sinStock = $derived(stock <= 0);
  const bajo = $derived(!sinStock && stock <= minStock);

  // Solo color según el estado: rojo si no hay stock, ámbar si está por debajo del mínimo
  const claseNivel = $derived(
    sinStock
      ? "font-medium text-destructive"
      : bajo
        ? "font-medium text-amber-600 dark:text-amber-500"
        : "",
  );
</script>

<span
  class="text-sm tabular-nums {claseNivel}"
  title={sinStock ? "Sin stock" : bajo ? "Stock bajo" : undefined}
>
  {stock.toLocaleString("es-CO")}
</span>
