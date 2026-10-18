<!-- src/routes/(app)/clientes/clientes-view.svelte -->
<script lang="ts">
  import { goto } from "$app/navigation";
  import DataTable from "$lib/components/data-table/data-table.svelte";
  import { Input } from "$lib/components/ui/input/index.js";
  import {
    clientesCreados,
    tarjetasDeCliente,
  } from "$lib/state/clientes.svelte";
  import { createColumns } from "./table/columns";
  import type { ClienteResumen } from "$lib/types/cliente";

  let { clientes }: { clientes: ClienteResumen[] } = $props();

  const columns = createColumns({ onVer: verCliente });

  /** Catálogo del servidor + los creados en esta sesión (sin backend). */
  const lista: ClienteResumen[] = $derived(
    [
      ...clientesCreados.map((cliente) => ({
        ...cliente,
        pedidos: 0,
        totalComprado: 0,
      })),
      ...clientes,
    ].map((cliente) => ({
      ...cliente,
      tarjetas: tarjetasDeCliente(cliente),
    })),
  );

  function verCliente(cliente: ClienteResumen) {
    goto(`/clientes/${cliente.id}`);
  }
</script>

<div class="w-full">
  <div class="mb-6">
    <h1 class="text-2xl font-semibold">Clientes</h1>
    <p class="text-sm text-muted-foreground">
      Perfiles, tarjetas guardadas y pedidos de cada cliente.
    </p>
  </div>

  <DataTable data={lista} {columns}>
    {#snippet toolbar({ table })}
      <Input
        placeholder="Buscar por nombre, email o teléfono..."
        value={(table.getColumn("cliente")?.getFilterValue() as string) ?? ""}
        oninput={(evento) =>
          table
            .getColumn("cliente")
            ?.setFilterValue(evento.currentTarget.value)}
        class="md:max-w-sm"
      />
    {/snippet}
  </DataTable>
</div>
