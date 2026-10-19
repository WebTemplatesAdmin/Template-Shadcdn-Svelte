<!-- src/routes/(app)/clientes/clientes-view.svelte -->
<script lang="ts">
  import { goto } from "$app/navigation";
  import { createTable } from "@tanstack/svelte-table";
  import DataTable from "$lib/components/data-table/data-table.svelte";
  import type { DataTableFeatures } from "$lib/components/data-table/data-table-features.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import X from "@lucide/svelte/icons/x";
  import {
    clientesCreados,
    tarjetasDeCliente,
  } from "$lib/state/clientes.svelte";
  import { createColumns, type RangoNumerico } from "./table/columns";
  import type { ClienteResumen } from "$lib/types/cliente";

  let { clientes }: { clientes: ClienteResumen[] } = $props();

  type TablaClientes = ReturnType<
    typeof createTable<DataTableFeatures, ClienteResumen>
  >;

  const columns = createColumns({ onVer: verCliente });

  let ciudad = $state("todas");
  let totalMin = $state("");
  let totalMax = $state("");
  let pedidosMin = $state("");
  let pedidosMax = $state("");

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

  const ciudades = $derived(
    [
      ...new Set(
        lista
          .map((cliente) => cliente.ciudad?.trim())
          .filter((valor): valor is string => Boolean(valor)),
      ),
    ].sort((a, b) => a.localeCompare(b, "es")),
  );

  function verCliente(cliente: ClienteResumen) {
    goto(`/clientes/${cliente.id}`);
  }

  /** Convierte dos inputs de texto en un rango; null si están vacíos. */
  function rangoDesde(min: string, max: string): RangoNumerico | undefined {
    const minimo = min.trim() === "" ? null : Number(min);
    const maximo = max.trim() === "" ? null : Number(max);

    if (
      (minimo !== null && !Number.isFinite(minimo)) ||
      (maximo !== null && !Number.isFinite(maximo))
    ) {
      return undefined;
    }

    return minimo === null && maximo === null
      ? undefined
      : { min: minimo, max: maximo };
  }

  function aplicarTotal(
    table: TablaClientes,
    min = totalMin,
    max = totalMax,
  ) {
    totalMin = min;
    totalMax = max;
    table
      .getColumn("totalComprado")
      ?.setFilterValue(rangoDesde(totalMin, totalMax));
    table.firstPage();
  }

  function aplicarPedidos(
    table: TablaClientes,
    min = pedidosMin,
    max = pedidosMax,
  ) {
    pedidosMin = min;
    pedidosMax = max;
    table
      .getColumn("pedidos")
      ?.setFilterValue(rangoDesde(pedidosMin, pedidosMax));
    table.firstPage();
  }

  function filtrarCiudad(table: TablaClientes, valor: string) {
    ciudad = valor;
    table
      .getColumn("ciudad")
      ?.setFilterValue(valor === "todas" ? undefined : valor);
    table.firstPage();
  }

  function hayFiltros(table: TablaClientes): boolean {
    return Boolean(
      table.getColumn("cliente")?.getFilterValue() ||
        table.getColumn("ciudad")?.getFilterValue() ||
        table.getColumn("totalComprado")?.getFilterValue() ||
        table.getColumn("pedidos")?.getFilterValue(),
    );
  }

  function limpiarFiltros(table: TablaClientes) {
    table.resetColumnFilters();
    ciudad = "todas";
    totalMin = "";
    totalMax = "";
    pedidosMin = "";
    pedidosMax = "";
    table.firstPage();
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
      <div class="flex w-full flex-col gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            value={(table.getColumn("cliente")?.getFilterValue() as string) ??
              ""}
            oninput={(evento) => {
              table
                .getColumn("cliente")
                ?.setFilterValue(evento.currentTarget.value);
              table.firstPage();
            }}
            class="md:max-w-sm"
          />

          <Select.Root
            type="single"
            value={ciudad}
            onValueChange={(valor) => {
              if (valor) filtrarCiudad(table, valor);
            }}
          >
            <Select.Trigger class="w-44">
              {ciudad === "todas" ? "Todas las ciudades" : ciudad}
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                <Select.Item value="todas">Todas las ciudades</Select.Item>
                {#each ciudades as opcion}
                  <Select.Item value={opcion}>{opcion}</Select.Item>
                {/each}
              </Select.Group>
            </Select.Content>
          </Select.Root>

          <Button
            variant="ghost"
            size="sm"
            disabled={!hayFiltros(table)}
            onclick={() => limpiarFiltros(table)}
          >
            <X data-icon="inline-start" />
            Limpiar filtros
          </Button>
        </div>

        <div class="flex flex-wrap items-center gap-4">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-medium text-muted-foreground">
              Total comprado
            </span>
            <Input
              type="number"
              min={0}
              step={1000}
              placeholder="Mín. $"
              aria-label="Total comprado mínimo"
              class="h-8 w-28"
              value={totalMin}
              oninput={(evento) =>
                aplicarTotal(table, evento.currentTarget.value, totalMax)}
            />
            <span class="text-xs text-muted-foreground">a</span>
            <Input
              type="number"
              min={0}
              step={1000}
              placeholder="Máx. $"
              aria-label="Total comprado máximo"
              class="h-8 w-28"
              value={totalMax}
              oninput={(evento) =>
                aplicarTotal(table, totalMin, evento.currentTarget.value)}
            />
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-medium text-muted-foreground">
              Pedidos
            </span>
            <Input
              type="number"
              min={0}
              step={1}
              placeholder="Mín."
              aria-label="Pedidos mínimo"
              class="h-8 w-20"
              value={pedidosMin}
              oninput={(evento) =>
                aplicarPedidos(table, evento.currentTarget.value, pedidosMax)}
            />
            <span class="text-xs text-muted-foreground">a</span>
            <Input
              type="number"
              min={0}
              step={1}
              placeholder="Máx."
              aria-label="Pedidos máximo"
              class="h-8 w-20"
              value={pedidosMax}
              oninput={(evento) =>
                aplicarPedidos(table, pedidosMin, evento.currentTarget.value)}
            />
          </div>
        </div>
      </div>
    {/snippet}
  </DataTable>
</div>
