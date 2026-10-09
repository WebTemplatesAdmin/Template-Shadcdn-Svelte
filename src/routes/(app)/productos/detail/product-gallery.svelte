<script lang="ts">
  import ImageIcon from "@lucide/svelte/icons/image";
  import { cn } from "$lib/utils.js";

  let { imagenes = [] }: { imagenes?: string[] } = $props();

  let activa = $state(0);
  const principal = $derived(imagenes[activa] ?? imagenes[0]);
</script>

{#if imagenes.length === 0}
  <div
    class="flex aspect-video items-center justify-center rounded-lg border bg-muted"
  >
    <div class="flex flex-col items-center gap-2 text-muted-foreground">
      <ImageIcon class="h-8 w-8" />
      <p class="text-sm">Sin imágenes</p>
    </div>
  </div>
{:else}
  <div class="space-y-3">
    <div class="aspect-video overflow-hidden rounded-lg border bg-muted">
      <img
        src={principal}
        alt="Imagen del producto"
        class="h-full w-full object-cover"
      />
    </div>

    {#if imagenes.length > 1}
      <div class="flex flex-wrap gap-2">
        {#each imagenes as url, i}
          <button
            type="button"
            onclick={() => (activa = i)}
            aria-label={`Ver imagen ${i + 1}`}
            aria-current={activa === i ? "true" : undefined}
            class={cn(
              "h-16 w-16 overflow-hidden rounded-md border",
              activa === i
                ? "border-primary ring-1 ring-primary"
                : "border-border",
            )}
          >
            <img src={url} alt="" class="h-full w-full object-cover" />
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}
