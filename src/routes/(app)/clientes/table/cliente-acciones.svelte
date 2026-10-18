<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import type { ClienteResumen } from "$lib/types/cliente";

  let {
    cliente,
    onVer,
  }: {
    cliente: ClienteResumen;
    onVer: (cliente: ClienteResumen) => void;
  } = $props();
</script>

<Button variant="ghost" size="sm" onclick={() => onVer(cliente)}>
  Ver perfil
</Button>
