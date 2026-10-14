<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
</script>

<!-- Skeleton del formulario de producto (misma estructura que producto-form) -->
<div class="mx-auto max-w-5xl pb-24" aria-busy="true" aria-live="polite">
  <Skeleton class="mb-6 mt-5 h-5 w-40" />

  <div class="mb-6 flex items-center justify-between gap-4">
    <div class="space-y-2">
      <Skeleton class="h-7 w-48" />
      <Skeleton class="h-4 w-64" />
    </div>
    <div class="hidden gap-3 sm:flex">
      <Skeleton class="h-9 w-24 rounded-md" />
      <Skeleton class="h-9 w-32 rounded-md" />
    </div>
  </div>

  <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <div class="space-y-6 lg:col-span-2">
      {#each Array(4) as _}
        <div class="rounded-lg border bg-card p-6">
          <Skeleton class="mb-4 h-4 w-44" />
          <div class="space-y-4">
            {#each Array(2) as _}
              <div class="space-y-2">
                <Skeleton class="h-3 w-24" />
                <Skeleton class="h-9 w-full rounded-md" />
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <div class="space-y-6 lg:col-span-1">
      {#each Array(2) as _}
        <div class="rounded-lg border bg-card p-6">
          <Skeleton class="mb-4 h-4 w-28" />
          <div class="space-y-3">
            {#each Array(2) as _}
              <Skeleton class="h-9 w-full rounded-md" />
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
