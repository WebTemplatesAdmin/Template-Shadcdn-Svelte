<script lang="ts">
  import type { ClienteResumen } from "$lib/types/cliente";

  let { cliente }: { cliente: ClienteResumen } = $props();
</script>

<div class="flex flex-col">
  <span class="font-medium">{cliente.nombre}</span>
  <span class="text-xs text-muted-foreground">{cliente.email || "—"}</span>
</div>
