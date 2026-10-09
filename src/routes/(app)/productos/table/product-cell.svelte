<script lang="ts">
  import ImageIcon from "@lucide/svelte/icons/image";

  let {
    nombre,
    sku,
    imagen,
  }: {
    nombre: string;
    sku?: string;
    imagen?: string;
  } = $props();
</script>

<div class="flex items-center gap-3">
  <!-- Miniatura (o placeholder si el producto no tiene imágenes) -->
  <div
    class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted"
  >
    {#if imagen}
      <img src={imagen} alt="" class="h-full w-full object-cover" />
    {:else}
      <ImageIcon class="h-4 w-4 text-muted-foreground" />
    {/if}
  </div>

  <!-- Nombre + SKU: aprovecha el alto de la fila para dar el código -->
  <div class="min-w-0">
    <p class="truncate text-sm font-medium">{nombre}</p>
    {#if sku}
      <p class="truncate font-mono text-xs text-muted-foreground">{sku}</p>
    {/if}
  </div>
</div>
