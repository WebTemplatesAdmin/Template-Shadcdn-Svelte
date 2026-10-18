<!-- src/routes/(app)/clientes/[id]/comunicaciones/comunicacion-acciones.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import type { ComunicacionCliente } from "$lib/types/cliente";

  let {
    comunicacion,
    onEliminar,
  }: {
    comunicacion: ComunicacionCliente;
    onEliminar: (comunicacion: ComunicacionCliente) => void;
  } = $props();
</script>

<Button
  variant="ghost"
  size="icon"
  aria-label={`Eliminar comunicación de ${comunicacion.autor}`}
  onclick={() => onEliminar(comunicacion)}
>
  <Trash2 class="text-destructive" />
</Button>
