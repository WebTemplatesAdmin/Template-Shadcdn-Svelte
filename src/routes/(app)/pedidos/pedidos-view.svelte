<!-- src/routes/(app)/pedidos/pedidos-view.svelte -->
<script lang="ts">
  import DataTable from "$lib/components/data-table/data-table.svelte";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { ConfirmDialog } from "$lib/components/ui/confirm-dialog/index.js";
  import Download from "@lucide/svelte/icons/download";
  import PedidoDetail from "./detail/pedido-detail.svelte";
  import { createColumns } from "./table/columns";
  import { METODOS_PAGO } from "$lib/config/pagos";
  import { notificarAviso, notificarExito } from "$lib/utils/notify";
  import type { EstadoPedido, Pedido } from "$lib/types/pedido";
  import {
    aplicarCambioEstado,
    CANALES,
    contarPorEstado,
    ESTADOS,
    ETIQUETA_CANAL,
    ETIQUETA_ESTADO,
    ETIQUETA_PAGO,
    formatearFechaHoraPedido,
    formatearMonto,
    payloadCambioEstado,
    payloadCobro,
    puedeCancelar,
    puedeCobrar,
    resumenPedidos,
    siguienteEstado,
  } from "$lib/utils/pedido";

  let { pedidosIniciales }: { pedidosIniciales: Pedido[] } = $props();

  /**
   * Sin backend, los cambios viven en memoria (se pierden al recargar).
   * Cada acción imprime el payload que enviarías a tu API.
   */
  // svelte-ignore state_referenced_locally: la lista inicial viene del load.
  let pedidos = $state<Pedido[]>(pedidosIniciales);

  let filtroEstado = $state<EstadoPedido | "todos">("todos");
  let pedidoSeleccionadoId = $state<number | null>(null);
  let sheetAbierto = $state(false);
  let confirmarCancelacion = $state(false);
  let pedidoACancelar: Pedido | null = $state(null);

  const pedidoSeleccionado = $derived(
    pedidos.find((pedido) => pedido.id === pedidoSeleccionadoId) ?? null,
  );
  const resumen = $derived(resumenPedidos(pedidos));
  const conteos = $derived(contarPorEstado(pedidos));
  const tarjetas = $derived([
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
  ]);

  function verDetalle(pedido: Pedido) {
    pedidoSeleccionadoId = pedido.id;
    sheetAbierto = true;
  }

  /** Reemplaza el pedido en la lista conservando la reactividad. */
  function reemplazar(pedido: Pedido, actualizado: Pedido) {
    pedidos = pedidos.map((p) => (p.id === pedido.id ? actualizado : p));
  }

  function avanzar(pedido: Pedido) {
    const siguiente = siguienteEstado(pedido.estado);
    if (!siguiente) return;

    const actualizado = aplicarCambioEstado(
      pedido,
      siguiente,
      new Date().toISOString(),
    );
    reemplazar(pedido, actualizado);

    // TODO: enviar a tu API → PATCH /pedidos/:id/estado
    console.log(
      `[pedidos] Payload (ESTADO) →\n${JSON.stringify(
        payloadCambioEstado(pedido, siguiente),
        null,
        2,
      )}`,
    );

    const cobroRegistrado = actualizado.estadoPago !== pedido.estadoPago;
    notificarExito(
      `${pedido.codigo} · ${ETIQUETA_ESTADO[siguiente]}`,
      cobroRegistrado
        ? "Se registró el cobro contra entrega."
        : "Estado actualizado correctamente.",
    );
  }

  function marcarPagado(pedido: Pedido) {
    const ahora = new Date().toISOString();
    reemplazar(pedido, { ...pedido, estadoPago: "pagado", pagadoEn: ahora });

    // TODO: enviar a tu API → PATCH /pedidos/:id/pago
    console.log(
      `[pedidos] Payload (PAGO) →\n${JSON.stringify(
        payloadCobro(pedido, ahora),
        null,
        2,
      )}`,
    );

    notificarExito(`${pedido.codigo} marcado como pagado`, "Cobro registrado.");
  }

  function pedirCancelacion(pedido: Pedido) {
    pedidoACancelar = pedido;
    confirmarCancelacion = true;
  }

  function confirmarCancelacionPedido() {
    const pedido = pedidoACancelar;
    if (!pedido) return;

    const actualizado = aplicarCambioEstado(
      pedido,
      "cancelado",
      new Date().toISOString(),
    );
    reemplazar(pedido, actualizado);

    // TODO: enviar a tu API → PATCH /pedidos/:id/estado
    console.log(
      `[pedidos] Payload (CANCELAR) →\n${JSON.stringify(
        payloadCambioEstado(pedido, "cancelado"),
        null,
        2,
      )}`,
    );

    notificarExito(
      `${pedido.codigo} cancelado`,
      actualizado.estadoPago === "reembolsado"
        ? "El cobro quedó marcado como reembolsado."
        : "El pedido se canceló.",
    );
    pedidoACancelar = null;
    confirmarCancelacion = false;
  }

  /** Avanza un paso todos los pedidos seleccionados que aún pueden avanzar. */
  function avanzarSeleccionados(tabla: any) {
    const seleccionados = tabla
      .getFilteredSelectedRowModel()
      .rows.map((fila: any) => fila.original) as Pedido[];

    const cambios = seleccionados
      .map((pedido) => ({ pedido, siguiente: siguienteEstado(pedido.estado) }))
      .filter(
        (cambio): cambio is { pedido: Pedido; siguiente: EstadoPedido } =>
          cambio.siguiente !== null,
      );

    if (cambios.length === 0) {
      notificarAviso(
        "Sin cambios",
        "Los pedidos seleccionados ya están entregados o cancelados.",
      );
      return;
    }

    const ahora = new Date().toISOString();
    pedidos = pedidos.map((pedido) => {
      const cambio = cambios.find((c) => c.pedido.id === pedido.id);
      return cambio
        ? aplicarCambioEstado(pedido, cambio.siguiente, ahora)
        : pedido;
    });

    console.log(
      `[pedidos] Payload (ESTADO MASIVO) →\n${JSON.stringify(
        cambios.map((cambio) =>
          payloadCambioEstado(cambio.pedido, cambio.siguiente),
        ),
        null,
        2,
      )}`,
    );

    notificarExito(
      `${cambios.length} pedido(s) avanzados`,
      "Cada uno pasó a su siguiente estado.",
    );
  }

  function exportarCSV(tabla: any) {
    const seleccionados = tabla
      .getFilteredSelectedRowModel()
      .rows.map((fila: any) => fila.original) as Pedido[];

    if (seleccionados.length === 0) {
      notificarAviso(
        "No hay pedidos seleccionados",
        "Marca la casilla de al menos un pedido para poder exportarlo.",
      );
      return;
    }

    const filas = seleccionados.map((pedido) =>
      [
        pedido.codigo,
        pedido.cliente.nombre,
        ETIQUETA_ESTADO[pedido.estado],
        ETIQUETA_PAGO[pedido.estadoPago],
        pedido.metodoPago,
        pedido.total,
      ].join(","),
    );
    const csv = ["Codigo,Cliente,Estado,Pago,Metodo,Total", ...filas].join(
      "\n",
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "pedidos.csv";
    enlace.click();
    URL.revokeObjectURL(url);
  }

  const columns = createColumns({
    onVer: verDetalle,
    onAvanzar: avanzar,
    onCobrar: marcarPagado,
    onCancelar: pedirCancelacion,
  });

  /** Los segmentos filtran la tabla por estado (misma fuente que la columna). */
  function filtrarPorEstado(valor: string, tabla: any) {
    filtroEstado = (valor || "todos") as EstadoPedido | "todos";
    tabla
      .getColumn("estado")
      ?.setFilterValue(filtroEstado === "todos" ? undefined : filtroEstado);
  }

  const siguienteDelDetalle = $derived(
    pedidoSeleccionado ? siguienteEstado(pedidoSeleccionado.estado) : null,
  );
</script>

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
      <p class="mt-1 text-2xl font-semibold tabular-nums">{tarjeta.valor}</p>
      <p class="mt-1 text-xs text-muted-foreground">{tarjeta.detalle}</p>
    </div>
  {/each}
</div>

<div class="mt-6">
  <DataTable data={pedidos} {columns}>
    {#snippet toolbar({ table })}
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

        <div
          class="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center"
        >
          <Input
            placeholder="Buscar por código, cliente o email..."
            value={(table.getColumn("codigo")?.getFilterValue() as string) ??
              ""}
            oninput={(e) =>
              table.getColumn("codigo")?.setFilterValue(e.currentTarget.value)}
            class="md:max-w-sm"
          />

          <Select.Root
            type="single"
            value={(table
              .getColumn("metodoPago")
              ?.getFilterValue() as string) ?? ""}
            onValueChange={(valor) =>
              table.getColumn("metodoPago")?.setFilterValue(valor || undefined)}
          >
            <Select.Trigger class="h-9 md:w-[190px]">
              {(table.getColumn("metodoPago")?.getFilterValue() as string) ||
                "Método de pago"}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="">Todos los métodos</Select.Item>
              {#each METODOS_PAGO as metodo}
                <Select.Item value={metodo}>{metodo}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>

          <Select.Root
            type="single"
            value={(table.getColumn("canal")?.getFilterValue() as string) ?? ""}
            onValueChange={(valor) =>
              table.getColumn("canal")?.setFilterValue(valor || undefined)}
          >
            <Select.Trigger class="h-9 md:w-[170px]">
              {(table.getColumn("canal")?.getFilterValue() as string) ||
                "Origen"}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="">Todos los orígenes</Select.Item>
              {#each CANALES as canal}
                <Select.Item value={canal}>{ETIQUETA_CANAL[canal]}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>

          {#if table.getFilteredSelectedRowModel().rows.length > 0}
            <div class="flex items-center gap-2 md:ml-auto">
              <Button size="sm" onclick={() => avanzarSeleccionados(table)}>
                Avanzar ({table.getFilteredSelectedRowModel().rows.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onclick={() => exportarCSV(table)}
              >
                <Download data-icon="inline-start" />
                Exportar
              </Button>
            </div>
          {/if}
        </div>
      </div>
    {/snippet}
  </DataTable>
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

      <Sheet.Footer class="flex-wrap gap-2">
        {#if siguienteDelDetalle}
          <Button onclick={() => avanzar(pedidoSeleccionado)}>
            Marcar como {ETIQUETA_ESTADO[siguienteDelDetalle].toLowerCase()}
          </Button>
        {/if}
        {#if puedeCobrar(pedidoSeleccionado)}
          <Button
            variant="outline"
            onclick={() => marcarPagado(pedidoSeleccionado)}
          >
            Marcar pagado
          </Button>
        {/if}
        {#if puedeCancelar(pedidoSeleccionado)}
          <Button
            variant="destructive"
            onclick={() => pedirCancelacion(pedidoSeleccionado)}
          >
            Cancelar
          </Button>
        {/if}
        <Sheet.Close>
          {#snippet child({ props })}
            <Button {...props} variant="outline">Cerrar</Button>
          {/snippet}
        </Sheet.Close>
      </Sheet.Footer>
    {/if}
  </Sheet.Content>
</Sheet.Root>

<ConfirmDialog
  bind:open={confirmarCancelacion}
  variant="destructive"
  title="¿Cancelar el pedido?"
  description={`${pedidoACancelar?.codigo ?? ""} pasará a "Cancelado". Si ya estaba cobrado, el pago quedará como reembolsado.`}
  confirmText="Cancelar pedido"
  cancelText="Volver"
  onConfirm={confirmarCancelacionPedido}
/>
