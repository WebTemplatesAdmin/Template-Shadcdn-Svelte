<script lang="ts">
  import DataTableSkeleton from "$lib/components/data-table/data-table-skeleton.svelte";
  import PedidosView from "./pedidos-view.svelte";

  let { data } = $props();
</script>

<svelte:head>
  <title>Pedidos · Mis Ventas</title>
</svelte:head>

<div class="w-full">
  <div class="min-w-0 flex-1">
    {#await data.pedidos}
      <DataTableSkeleton columnas={9} filas={15} />
    {:then pedidos}
      <PedidosView pedidosIniciales={pedidos} />
    {:catch}
      <div class="mx-auto max-w-5xl py-20 text-center">
        <p class="text-sm text-muted-foreground">
          No se pudieron cargar los pedidos. Intenta de nuevo.
        </p>
      </div>
    {/await}
  </div>
</div>
