<script lang="ts">
  import DataTableSkeleton from "$lib/components/data-table/data-table-skeleton.svelte";
  import ClientesView from "./clientes-view.svelte";

  let { data } = $props();
</script>

<svelte:head>
  <title>Clientes · Mis Ventas</title>
</svelte:head>

{#await data.clientes}
  <DataTableSkeleton columnas={7} filas={12} />
{:then clientes}
  <ClientesView {clientes} />
{:catch}
  <div class="mx-auto max-w-5xl py-20 text-center">
    <p class="text-sm text-muted-foreground">
      No se pudieron cargar los clientes. Intenta de nuevo.
    </p>
  </div>
{/await}
