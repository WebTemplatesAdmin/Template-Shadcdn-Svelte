<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
</script>

<!-- Skeleton del historial de cambios -->
<div class="mx-auto max-w-3xl pb-16" aria-busy="true" aria-live="polite">
  <Skeleton class="mb-6 mt-5 h-5 w-40" />

  <div class="mb-6 flex flex-col gap-2">
    <Skeleton class="h-7 w-64" />
    <Skeleton class="h-4 w-40" />
  </div>

  <!-- Resumen -->
  <div class="mb-6 flex flex-wrap gap-2">
    {#each Array(3) as _}
      <Skeleton class="h-7 w-36 rounded-md" />
    {/each}
  </div>

  <!-- Filtros + búsqueda -->
  <div
    class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex flex-wrap gap-2">
      {#each Array(5) as _}
        <Skeleton class="h-8 w-20 rounded-md" />
      {/each}
    </div>
    <Skeleton class="h-9 w-full rounded-md sm:w-64" />
  </div>

  <div class="rounded-lg border bg-card p-6">
    <Skeleton class="mb-4 h-4 w-32" />
    <div class="flex flex-col gap-6">
      {#each Array(2) as _}
        <div class="flex flex-col gap-3">
          <Skeleton class="h-3 w-24" />
          <div class="flex flex-col gap-4">
            {#each Array(2) as _}
              <div class="flex gap-3">
                <Skeleton class="h-7 w-7 shrink-0 rounded-md" />
                <div class="flex flex-1 flex-col gap-2">
                  <div class="flex items-center justify-between gap-4">
                    <Skeleton class="h-4 w-40" />
                    <Skeleton class="h-3 w-20" />
                  </div>
                  <Skeleton class="h-3 w-3/4" />
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
