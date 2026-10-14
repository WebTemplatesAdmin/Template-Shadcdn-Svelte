<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
</script>

<!-- Skeleton de la ficha de producto (misma estructura que product-detail) -->
<div class="mx-auto max-w-5xl pb-16" aria-busy="true" aria-live="polite">
  <Skeleton class="mb-6 mt-5 h-5 w-40" />

  <!-- Encabezado -->
  <div class="mb-6 flex items-start justify-between gap-4">
    <div class="space-y-3">
      <div class="flex items-center gap-2">
        <Skeleton class="h-7 w-56" />
        <Skeleton class="h-5 w-16 rounded-full" />
      </div>
      <Skeleton class="h-4 w-40" />
    </div>
    <Skeleton class="h-9 w-24 rounded-md" />
  </div>

  <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <div class="space-y-6 lg:col-span-2">
      {#each Array(3) as _}
        <div class="rounded-lg border bg-card p-6">
          <Skeleton class="mb-4 h-4 w-40" />
          <div class="space-y-3">
            {#each Array(3) as _}
              <div class="flex items-center justify-between gap-4">
                <Skeleton class="h-4 w-28" />
                <Skeleton class="h-4 w-40" />
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <div class="space-y-6 lg:col-span-1">
      {#each Array(2) as _}
        <div class="rounded-lg border bg-card p-6">
          <Skeleton class="mb-4 h-4 w-24" />
          <div class="space-y-3">
            {#each Array(3) as _}
              <div class="flex items-center justify-between gap-4">
                <Skeleton class="h-4 w-20" />
                <Skeleton class="h-4 w-16" />
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
