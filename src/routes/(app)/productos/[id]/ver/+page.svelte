<script lang="ts">
  import DetailSkeleton from "../../detail/detail-skeleton.svelte";
  import ProductDetail from "../../detail/product-detail.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  // Se resuelven juntos para montar la ficha una sola vez (evita remontajes).
  // svelte-ignore state_referenced_locally: `data` es estable por navegación.
  const datos = Promise.all([data.producto, data.historial]);
</script>

<!-- Streaming: los datos llegan como promesas → skeleton inmediato. -->
{#await datos}
  <DetailSkeleton />
{:then resultado}
  <ProductDetail producto={resultado[0]} historial={resultado[1]} />
{:catch}
  <div class="mx-auto max-w-5xl py-20 text-center">
    <p class="text-sm text-muted-foreground">
      No se pudo cargar el producto. Intenta de nuevo.
    </p>
  </div>
{/await}
