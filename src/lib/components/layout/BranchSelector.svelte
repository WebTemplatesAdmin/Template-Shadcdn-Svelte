<!-- src/lib/components/layout/BranchSelector.svelte -->
<script lang="ts">
  import * as Select from "$lib/components/ui/select/index.js";
  import Store from "@lucide/svelte/icons/store";

  // TODO: reemplazar por datos reales de tu backend (sucursales del usuario)
  const sucursales = [
    { id: "centro", nombre: "Sucursal Centro" },
    { id: "norte", nombre: "Sucursal Norte" },
    { id: "bodega", nombre: "Bodega Principal" },
  ];

  let sucursalActiva = $state(sucursales[0].id);

  const nombreActivo = $derived(
    sucursales.find((s) => s.id === sucursalActiva)?.nombre ?? "Sucursal"
  );
</script>

<Select.Root type="single" bind:value={sucursalActiva}>
  <Select.Trigger class="hidden h-9 w-[180px] gap-2 md:flex">
    <Store class="h-4 w-4 shrink-0 text-muted-foreground" />
    <span class="truncate text-sm">{nombreActivo}</span>
  </Select.Trigger>
  <Select.Content>
    {#each sucursales as sucursal}
      <Select.Item value={sucursal.id}>{sucursal.nombre}</Select.Item>
    {/each}
  </Select.Content>
</Select.Root>