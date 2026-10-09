<!-- src/lib/components/data-table/data-table-skeleton.svelte -->
<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";

  let { columnas = 5, filas = 8 }: { columnas?: number; filas?: number } = $props();
</script>

<div class="space-y-4">
  <!-- Toolbar skeleton -->
  <div class="flex items-center gap-3">
    <Skeleton class="h-9 w-64" />
    <Skeleton class="h-9 w-40" />
    <Skeleton class="ml-auto h-9 w-32" />
  </div>

  <!-- Tabla skeleton -->
  <div class="rounded-md border overflow-hidden">
    <div class="flex items-center gap-4 border-b bg-muted/30 p-3">
      {#each Array(columnas) as _}
        <Skeleton class="h-4 flex-1" />
      {/each}
    </div>
    {#each Array(filas) as _}
      <div class="flex items-center gap-4 border-b p-3 last:border-b-0">
        {#each Array(columnas) as _}
          <Skeleton class="h-4 flex-1" />
        {/each}
      </div>
    {/each}
  </div>
</div>