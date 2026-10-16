<!-- src/routes/(app)/pedidos/table/cliente-cell.svelte -->
<script lang="ts">
  let { nombre, email }: { nombre: string; email: string } = $props();
</script>

<div class="flex min-w-0 flex-col">
  <span class="truncate text-sm font-medium">{nombre}</span>
  <span class="truncate text-xs text-muted-foreground">{email}</span>
</div>
