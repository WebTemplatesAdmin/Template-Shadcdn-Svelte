<!-- src/routes/(app)/product/data-table-actions.svelte -->
<script lang="ts">
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import MoreHorizontal from "@lucide/svelte/icons/more-horizontal";
  import ConfirmDialog from "$lib/components/confirmDialog/ConfirmDialog.svelte";
  import { goto } from "$app/navigation";

  let {
    id,
    nombre,
    onEliminar,
  }: {
    id: number;
    nombre: string;
    onEliminar: (id: number) => void;
  } = $props();

  let confirmAbierto = $state(false);
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="ghost"
        size="icon"
        class="h-8 w-8"
        aria-label="Acciones del producto"
      >
        <MoreHorizontal class="h-4 w-4" />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end">
    <DropdownMenu.Item onclick={() => goto(`/productos/${id}/ver`)}>
      Ver detalle
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => goto(`/productos/${id}/editar`)}>
      Editar
    </DropdownMenu.Item>
    <DropdownMenu.Item
      variant="destructive"
      onclick={() => (confirmAbierto = true)}
    >
      Eliminar
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

<ConfirmDialog
  bind:open={confirmAbierto}
  title="¿Eliminar este producto?"
  description={`"${nombre}" se eliminará permanentemente. Esta acción no se puede deshacer.`}
  confirmText="Eliminar"
  onConfirm={() => {
    onEliminar(id);
    confirmAbierto = false;
  }}
/>
