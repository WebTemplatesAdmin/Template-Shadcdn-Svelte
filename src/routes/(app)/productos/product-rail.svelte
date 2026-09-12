<!-- product-rail.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Tag from "@lucide/svelte/icons/tag";
  import ChartColumn from "@lucide/svelte/icons/chart-column";

  let { onNuevaCategoria }: { onNuevaCategoria: () => void } = $props();
</script>

<div
  class="fixed right-0 top-16 bottom-0 z-30 flex w-14 flex-col items-center gap-2 border-l bg-background py-4"
>
  <Button
    variant="ghost"
    size="icon"
    class="h-10 w-10 rounded-full hover:bg-muted"
    onclick={onNuevaCategoria}
    title="Nueva categoría"
  >
    <Tag class="h-5 w-5  text-primary" />
  </Button>

  <Button
    href="/productos/estadisticas"
    variant="ghost"
    size="icon"
    class="h-10 w-10 rounded-full hover:bg-muted"
    title="Estadísticas"
  >
    <ChartColumn class="h-5 w-5  text-primary" />
  </Button>
</div>
