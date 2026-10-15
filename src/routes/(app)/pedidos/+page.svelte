<script lang="ts">
  import DataTable from "$lib/components/data-table/data-table.svelte";
  import DataTableSkeleton from "$lib/components/data-table/data-table-skeleton.svelte";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import PedidoDetail from "./detail/pedido-detail.svelte";
  import { createColumns } from "./table/columns";
  import type { EstadoPedido, Pedido } from "$lib/types/pedido";
  import {
    contarPorEstado,
    ESTADOS,
    ETIQUETA_ESTADO,
    formatearFechaHoraPedido,
    formatearMonto,
    resumenPedidos,
  } from "$lib/utils/pedido";

  let { data } = $props();

  let filtroEstado = $state<EstadoPedido | "todos">("todos");
  let pedidoSeleccionado = $state<Pedido | null>(null);
  let sheetAbierto = $state(false);

  function verDetalle(pedido: Pedido) {
    pedidoSeleccionado = pedido;
    sheetAbierto = true;
  }

  const columns = createColumns(verDetalle);

  /** Los segmentos filtran la tabla por estado (misma fuente que la columna). */
  function filtrarPorEstado(valor: string, tabla: any) {
    filtroEstado = (valor || "todos") as EstadoPedido | "todos";
    tabla
      .getColumn("estado")
      ?.setFilterValue(filtroEstado === "todos" ? undefined : filtroEstado);
  }
</script>

<svelte:head>
  <title>Pedidos · Mis Ventas</title>
</svelte:head>

<div class="w-full">
  <div class="min-w-0 flex-1">
    {#await data.pedidos}
      <DataTableSkeleton columnas={7} filas={15} />
    {:then pedidos}
      {@const resumen = resumenPedidos(pedidos)}
      {@const tarjetas = [
        {
          etiqueta: "Pendientes",
          valor: String(resumen.pendientes),
          detalle: "esperando gestión",
        },
        {
          etiqueta: "En preparación",
          valor: String(resumen.preparando),
          detalle: "en curso ahora",
        },
        {
          etiqueta: "Entregados (7 días)",
          valor: String(resumen.entregados7Dias),
          detalle: "última semana",
        },
        {
          etiqueta: "Ticket promedio",
          valor: formatearMonto(resumen.ticketPromedio),
          detalle: "por pedido vigente",
        },
      ]}

      <div class="mb-6 flex flex-col gap-1">
        <h1 class="text-xl font-semibold">Pedidos</h1>
        <p class="text-sm text-muted-foreground">
          Sigue cada pedido por su flujo: de la recepción a la entrega.
        </p>
      </div>

      <div class="animate-fade-up grid grid-cols-2 gap-4 lg:grid-cols-4">
        {#each tarjetas as tarjeta (tarjeta.etiqueta)}
          <div class="rounded-lg border bg-card p-4">
            <p class="text-xs text-muted-foreground">{tarjeta.etiqueta}</p>
            <p class="mt-1 text-2xl font-semibold tabular-nums">
              {tarjeta.valor}
            </p>
            <p class="mt-1 text-xs text-muted-foreground">{tarjeta.detalle}</p>
          </div>
        {/each}
      </div>

      <div class="mt-6">
        <DataTable data={pedidos} {columns}>
          {#snippet toolbar({ table })}
            {@const conteos = contarPorEstado(pedidos)}

            <div class="flex w-full flex-col gap-3">
              <ToggleGroup.Root
                type="single"
                variant="outline"
                size="sm"
                value={filtroEstado}
                onValueChange={(valor) => filtrarPorEstado(valor, table)}
                class="flex-wrap"
              >
                <ToggleGroup.Item value="todos">
                  Todos ({conteos.todos})
                </ToggleGroup.Item>
                {#each ESTADOS as estado}
                  <ToggleGroup.Item value={estado}>
                    {ETIQUETA_ESTADO[estado]} ({conteos[estado]})
                  </ToggleGroup.Item>
                {/each}
              </ToggleGroup.Root>

              <div class="flex flex-col gap-2 md:flex-row md:items-center">
                <Input
                  placeholder="Buscar por código, cliente o email..."
                  value={(table
                    .getColumn("codigo")
                    ?.getFilterValue() as string) ?? ""}
                  oninput={(e) =>
                    table
                      .getColumn("codigo")
                      ?.setFilterValue(e.currentTarget.value)}
                  class="md:max-w-sm"
                />

                <Select.Root
                  type="single"
                  value={(table
                    .getColumn("metodoPago")
                    ?.getFilterValue() as string) ?? ""}
                  onValueChange={(valor) =>
                    table
                      .getColumn("metodoPago")
                      ?.setFilterValue(valor || undefined)}
                >
                  <Select.Trigger class="h-9 md:w-[190px]">
                    {(table
                      .getColumn("metodoPago")
                      ?.getFilterValue() as string) || "Método de pago"}
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="">Todos los métodos</Select.Item>
                    <Select.Item value="Tarjeta">Tarjeta</Select.Item>
                    <Select.Item value="Efectivo">Efectivo</Select.Item>
                    <Select.Item value="Transferencia"
                      >Transferencia</Select.Item
                    >
                  </Select.Content>
                </Select.Root>
              </div>
            </div>
          {/snippet}
        </DataTable>
      </div>
    {:catch}
      <div class="mx-auto max-w-5xl py-20 text-center">
        <p class="text-sm text-muted-foreground">
          No se pudieron cargar los pedidos. Intenta de nuevo.
        </p>
      </div>
    {/await}
  </div>
</div>

<Sheet.Root bind:open={sheetAbierto}>
  <Sheet.Content side="right" class="w-full sm:max-w-md">
    {#if pedidoSeleccionado}
      <Sheet.Header>
        <Sheet.Title>Pedido {pedidoSeleccionado.codigo}</Sheet.Title>
        <Sheet.Description>
          {formatearFechaHoraPedido(pedidoSeleccionado.fecha)} ·
          {pedidoSeleccionado.cliente.nombre}
        </Sheet.Description>
      </Sheet.Header>

      <PedidoDetail pedido={pedidoSeleccionado} />

      <Sheet.Footer>
        <Sheet.Close>
          {#snippet child({ props })}
            <Button {...props} variant="outline" class="w-full">Cerrar</Button>
          {/snippet}
        </Sheet.Close>
      </Sheet.Footer>
    {/if}
  </Sheet.Content>
</Sheet.Root>
