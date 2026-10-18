<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import VentasView from "./ventas-view.svelte";

  let { data } = $props();
</script>

<svelte:head>
  <title>Ventas · Mis Ventas</title>
</svelte:head>

{#await data.pedidos}
  <div class="animate-fade-up space-y-6">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {#each [1, 2, 3, 4] as _}
        <Skeleton class="h-28 w-full" />
      {/each}
    </div>
    <Skeleton class="h-72 w-full" />
    <div class="grid gap-4 lg:grid-cols-3">
      {#each [1, 2, 3] as _}
        <Skeleton class="h-56 w-full" />
      {/each}
    </div>
  </div>
{:then pedidos}
  <VentasView {pedidos} />
{:catch}
  <div class="mx-auto max-w-5xl py-20 text-center">
    <p class="text-sm text-muted-foreground">
      No se pudieron cargar las ventas. Intenta de nuevo.
    </p>
  </div>
{/await}
