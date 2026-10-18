<!-- src/routes/(app)/clientes/[id]/comunicaciones/resumen-cell.svelte -->
<script lang="ts">
  let { contenido }: { contenido: string } = $props();
</script>

<p class="max-w-64 truncate text-sm" title={contenido}>{contenido}</p>
