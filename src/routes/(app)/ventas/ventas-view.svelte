<!-- src/routes/(app)/ventas/ventas-view.svelte -->
<script lang="ts">
  import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import DetalleGraficoDialog from "./detalle-grafico-dialog.svelte";
  import { ESTILO_ESTADO, formatearMonto } from "$lib/utils/pedido";
  import { notificarAviso, notificarError } from "$lib/utils/notify";
  import {
    clientesPorProducto,
    desglosePorCanal,
    desglosePorEstado,
    desglosePorMetodo,
    desgloseProductoPorCanal,
    desgloseProductoPorEstado,
    desgloseProductoPorMetodo,
    diasDelRango,
    pedidosEnRango,
    porcentaje,
    productosDisponibles,
    rangoDePeriodo,
    resumenProducto,
    resumenVentas,
    serieProducto,
    serieVentas,
    topProductos,
    type ProductoOpcion,
    type RangoFechas,
    type RangoVentas,
  } from "$lib/utils/ventas";
  import type { Pedido } from "$lib/types/pedido";

  let { pedidos }: { pedidos: Pedido[] } = $props();

  let dias = $state<RangoVentas>(30);
  let rangoPersonalizado = $state<RangoFechas | null>(null);
  let popoverAbierto = $state(false);
  let borradorDesde = $state("");
  let borradorHasta = $state("");

  let productoFiltro = $state<ProductoOpcion | null>(null);
  let popoverProducto = $state(false);
  let consultaProducto = $state("");

  let dialogDatosAbierto = $state(false);

  /** El rango personalizado manda; si no hay, se usa el preset. */
  const rango = $derived(rangoPersonalizado ?? rangoDePeriodo(dias));
  const diasRango = $derived(diasDelRango(rango));

  const delPeriodo = $derived(pedidosEnRango(pedidos, rango));
  const resumen = $derived(resumenVentas(delPeriodo));
  const resumenProd = $derived(
    productoFiltro ? resumenProducto(delPeriodo, productoFiltro.clave) : null,
  );

  const serieGeneral = $derived(serieVentas(delPeriodo, rango));
  const serieActiva = $derived(
    productoFiltro
      ? serieProducto(delPeriodo, rango, productoFiltro.clave)
      : serieGeneral,
  );

  const porMetodo = $derived(
    productoFiltro
      ? desgloseProductoPorMetodo(delPeriodo, productoFiltro.clave)
      : desglosePorMetodo(delPeriodo),
  );
  const porCanal = $derived(
    productoFiltro
      ? desgloseProductoPorCanal(delPeriodo, productoFiltro.clave)
      : desglosePorCanal(delPeriodo),
  );
  const porEstado = $derived(
    productoFiltro
      ? desgloseProductoPorEstado(delPeriodo, productoFiltro.clave)
      : desglosePorEstado(delPeriodo),
  );

  const top = $derived(topProductos(delPeriodo, 6));
  const clientes = $derived(
    productoFiltro
      ? clientesPorProducto(delPeriodo, productoFiltro.clave, 6)
      : [],
  );

  const productos = $derived(productosDisponibles(delPeriodo));
  const opcionesProducto = $derived(
    opcionesDeProducto(productos, consultaProducto),
  );

  const totalActivo = $derived(
    resumenProd ? resumenProd.conImpuesto : resumen.total,
  );
  const pedidosActivos = $derived(
    resumenProd ? resumenProd.pedidos : resumen.pedidos,
  );

  const maxSerie = $derived(
    Math.max(1, ...serieActiva.map((punto) => punto.total)),
  );
  const hayVentas = $derived(pedidosActivos > 0);

  const subtitulo = $derived(
    productoFiltro
      ? rangoPersonalizado
        ? `${productoFiltro.nombre} · del ${fechaCorta(rango.desde)} al ${fechaCorta(rango.hasta)}.`
        : `${productoFiltro.nombre} · últimos ${dias} días.`
      : rangoPersonalizado
        ? `Resumen de tus ventas del ${fechaCorta(rango.desde)} al ${fechaCorta(rango.hasta)}.`
        : `Resumen de tus ventas en los últimos ${dias} días.`,
  );

  const tituloDatos = $derived(
    `Ventas ${productoFiltro ? `de ${productoFiltro.nombre} ` : ""}por ${
      diasRango > 31 ? "semana" : "día"
    }`,
  );
  const descripcionDatos = $derived(
    productoFiltro
      ? "Monto con impuesto de la línea del producto"
      : "Total facturado en el periodo",
  );

  const hoyISO = new Date().toISOString().slice(0, 10);

  function opcionesDeProducto(
    lista: ProductoOpcion[],
    consulta: string,
  ): ProductoOpcion[] {
    const q = consulta.trim().toLowerCase();
    if (!q) return lista.slice(0, 10);
    return lista.filter((producto) =>
      producto.nombre.toLowerCase().includes(q),
    );
  }

  function cambiarDias(valor: string) {
    if (!valor) return;
    dias = Number(valor) as RangoVentas;
    rangoPersonalizado = null;
  }

  function seleccionarProducto(opcion: ProductoOpcion | null) {
    productoFiltro = opcion;
    popoverProducto = false;
    consultaProducto = "";
  }

  function filtrarPorProducto(nombre: string, unidades: number) {
    seleccionarProducto({ clave: nombre, nombre, unidades });
  }

  function alCambiarPopoverProducto(abierto: boolean) {
    if (abierto) consultaProducto = "";
  }

  function fechaISO(fecha: Date): string {
    const copia = new Date(fecha);
    copia.setMinutes(copia.getMinutes() - copia.getTimezoneOffset());
    return copia.toISOString().slice(0, 10);
  }

  function fechaCorta(fecha: Date): string {
    return fecha.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
    });
  }

  function alCambiarPopover(abierto: boolean) {
    if (!abierto) return;
    // Al abrir, parte del rango vigente.
    borradorDesde = fechaISO(rango.desde);
    borradorHasta = fechaISO(rango.hasta);
  }

  function aplicarRango() {
    if (!borradorDesde || !borradorHasta) {
      notificarAviso(
        "Rango incompleto",
        "Selecciona la fecha inicial y la final.",
      );
      return;
    }

    const desde = new Date(`${borradorDesde}T00:00:00`);
    const hasta = new Date(`${borradorHasta}T00:00:00`);

    if (desde > hasta) {
      notificarError(
        "Rango inválido",
        "La fecha inicial debe ser anterior o igual a la final.",
      );
      return;
    }
    if (diasDelRango({ desde, hasta }) > 366) {
      notificarError("Rango muy largo", "El máximo es de 1 año.");
      return;
    }

    rangoPersonalizado = { desde, hasta };
    popoverAbierto = false;
  }

  function limpiarRango() {
    rangoPersonalizado = null;
    borradorDesde = "";
    borradorHasta = "";
    popoverAbierto = false;
  }
</script>

{#snippet kpi(etiqueta: string, valor: string, detalle: string)}
  <div class="rounded-lg border bg-card p-4">
    <p class="text-xs text-muted-foreground">{etiqueta}</p>
    <p class="mt-2 text-2xl font-semibold tabular-nums">{valor}</p>
    <p class="text-xs text-muted-foreground">{detalle}</p>
  </div>
{/snippet}

<div class="animate-fade-up">
  <div
    class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
  >
    <div class="min-w-0">
      <h1 class="text-2xl font-semibold">Ventas</h1>
      <p class="truncate text-sm text-muted-foreground">{subtitulo}</p>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <ToggleGroup.Root
        type="single"
        variant="outline"
        size="sm"
        value={rangoPersonalizado ? "" : String(dias)}
        onValueChange={cambiarDias}
      >
        <ToggleGroup.Item value="7">7 días</ToggleGroup.Item>
        <ToggleGroup.Item value="30">30 días</ToggleGroup.Item>
        <ToggleGroup.Item value="90">90 días</ToggleGroup.Item>
      </ToggleGroup.Root>

      <Popover.Root bind:open={popoverAbierto} onOpenChange={alCambiarPopover}>
        <Popover.Trigger>
          {#snippet child({ props })}
            <Button {...props} type="button" variant="outline" size="sm">
              {rangoPersonalizado
                ? `${fechaCorta(rango.desde)} – ${fechaCorta(rango.hasta)}`
                : "Rango de fechas"}
            </Button>
          {/snippet}
        </Popover.Trigger>
        <Popover.Content class="w-[19rem] p-4" align="end">
          <div class="space-y-3">
            <div class="space-y-1">
              <label class="text-xs font-medium" for="rango-desde">Desde</label>
              <input
                id="rango-desde"
                type="date"
                bind:value={borradorDesde}
                max={hoyISO}
                class="h-9 w-full rounded-md border bg-background px-2.5 text-sm"
              />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-medium" for="rango-hasta">Hasta</label>
              <input
                id="rango-hasta"
                type="date"
                bind:value={borradorHasta}
                min={borradorDesde || undefined}
                max={hoyISO}
                class="h-9 w-full rounded-md border bg-background px-2.5 text-sm"
              />
            </div>
            <div class="flex items-center justify-between gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onclick={limpiarRango}
              >
                Limpiar
              </Button>
              <Button type="button" size="sm" onclick={aplicarRango}>
                Aplicar
              </Button>
            </div>
          </div>
        </Popover.Content>
      </Popover.Root>

      <Popover.Root
        bind:open={popoverProducto}
        onOpenChange={alCambiarPopoverProducto}
      >
        <Popover.Trigger>
          {#snippet child({ props })}
            <Button
              {...props}
              type="button"
              variant={productoFiltro ? "default" : "outline"}
              size="sm"
              class="max-w-[16rem]"
            >
              <span class="truncate">
                {productoFiltro ? productoFiltro.nombre : "Todos los productos"}
              </span>
            </Button>
          {/snippet}
        </Popover.Trigger>
        <Popover.Content class="w-[20rem] p-0" align="end">
          <div class="border-b p-2">
            <Input
              bind:value={consultaProducto}
              placeholder="Buscar producto..."
              class="h-8"
              aria-label="Buscar producto"
            />
          </div>
          <div class="max-h-64 overflow-auto p-1">
            <button
              type="button"
              class="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
              onclick={() => seleccionarProducto(null)}
            >
              Todos los productos
            </button>
            {#each opcionesProducto as opcion (opcion.clave)}
              <button
                type="button"
                class="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
                onclick={() => seleccionarProducto(opcion)}
              >
                <span class="min-w-0 flex-1 truncate">{opcion.nombre}</span>
                <span class="shrink-0 text-xs text-muted-foreground">
                  {opcion.unidades} u.
                </span>
              </button>
            {/each}
            {#if opcionesProducto.length === 0}
              <p class="px-2 py-4 text-center text-sm text-muted-foreground">
                Sin resultados.
              </p>
            {/if}
          </div>
        </Popover.Content>
      </Popover.Root>
    </div>
  </div>

  <!-- KPIs -->
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {#if resumenProd}
      {@render kpi(
        "Ventas del producto",
        formatearMonto(resumenProd.conImpuesto),
        `Base ${formatearMonto(resumenProd.base)} · IVA ${formatearMonto(resumenProd.impuesto)}`,
      )}
      {@render kpi(
        "Pedidos",
        String(resumenProd.pedidos),
        `Total de esos pedidos: ${formatearMonto(resumenProd.totalPedidos)}`,
      )}
      {@render kpi(
        "Ticket promedio",
        formatearMonto(resumenProd.ticketProducto),
        `Del pedido: ${formatearMonto(resumenProd.ticketPedido)}`,
      )}
      {@render kpi("Unidades", String(resumenProd.unidades), "del producto")}
    {:else}
      {@render kpi(
        "Ventas totales",
        formatearMonto(resumen.total),
        `${resumen.pedidos} pedidos`,
      )}
      {@render kpi("Pedidos", String(resumen.pedidos), "sin contar cancelados")}
      {@render kpi(
        "Ticket promedio",
        formatearMonto(resumen.ticketPromedio),
        "por pedido",
      )}
      {@render kpi("Unidades", String(resumen.unidades), "artículos vendidos")}
    {/if}
  </div>

  <!-- Gráfico -->
  <div class="mt-6 rounded-lg border bg-card p-6">
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 class="text-sm font-medium">
          Ventas {productoFiltro ? "del producto " : ""}por {diasRango > 31
            ? "semana"
            : "día"}
        </h2>
        <p class="text-xs text-muted-foreground">
          {productoFiltro
            ? "Con impuesto · línea del producto"
            : "Total facturado en el periodo"}
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <p class="text-sm font-medium tabular-nums">
          {formatearMonto(totalActivo)}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onclick={() => (dialogDatosAbierto = true)}
        >
          Ver datos
        </Button>
      </div>
    </div>

    {#if hayVentas}
      <figure
        role="img"
        aria-label={`${productoFiltro ? "Ventas del producto" : "Ventas"} por ${
          diasRango > 31 ? "semana" : "día"
        } entre ${fechaCorta(rango.desde)} y ${fechaCorta(rango.hasta)}`}
      >
        <div class="flex h-48 items-end gap-1.5">
          {#each serieActiva as punto, i (i)}
            <div
              class="group relative flex h-full flex-1 items-end"
              title={`${punto.etiqueta}: ${formatearMonto(punto.total)} (${punto.pedidos} pedidos)`}
            >
              <div
                class="w-full rounded-t bg-primary/60 transition-colors group-hover:bg-primary"
                style="height: {Math.max(2, (punto.total / maxSerie) * 100)}%"
              ></div>
            </div>
          {/each}
        </div>
        <figcaption
          class="mt-2 flex justify-between text-xs text-muted-foreground"
        >
          <span>{serieActiva[0]?.etiqueta}</span>
          <span
            >{serieActiva[Math.floor(serieActiva.length / 2)]?.etiqueta}</span
          >
          <span>{serieActiva[serieActiva.length - 1]?.etiqueta}</span>
        </figcaption>
      </figure>
    {:else}
      <div
        class="flex h-48 items-center justify-center text-sm text-muted-foreground"
      >
        Sin ventas en el periodo.
      </div>
    {/if}
  </div>

  <!-- Desgloses -->
  <div class="mt-6 grid gap-4 lg:grid-cols-3">
    <div class="rounded-lg border bg-card p-6">
      <h2 class="text-sm font-medium">Por método de pago</h2>
      <p class="mb-4 text-xs text-muted-foreground">Monto cobrado</p>

      <div class="space-y-3">
        {#each porMetodo as fila (fila.clave)}
          <div class="space-y-1">
            <div class="flex items-center justify-between gap-2 text-sm">
              <span class="truncate">{fila.etiqueta}</span>
              <span class="shrink-0 tabular-nums"
                >{formatearMonto(fila.total)}</span
              >
            </div>
            <div class="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                class="h-full rounded-full bg-primary"
                style="width: {porcentaje(fila.total, totalActivo)}%"
              ></div>
            </div>
          </div>
        {:else}
          <p class="text-sm text-muted-foreground">Sin datos.</p>
        {/each}
      </div>
    </div>

    <div class="rounded-lg border bg-card p-6">
      <h2 class="text-sm font-medium">Por canal</h2>
      <p class="mb-4 text-xs text-muted-foreground">Monto cobrado</p>

      <div class="space-y-3">
        {#each porCanal as fila (fila.clave)}
          <div class="space-y-1">
            <div class="flex items-center justify-between gap-2 text-sm">
              <span class="truncate">{fila.etiqueta}</span>
              <span class="shrink-0 tabular-nums"
                >{formatearMonto(fila.total)}</span
              >
            </div>
            <div class="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                class="h-full rounded-full bg-primary"
                style="width: {porcentaje(fila.total, totalActivo)}%"
              ></div>
            </div>
          </div>
        {:else}
          <p class="text-sm text-muted-foreground">Sin datos.</p>
        {/each}
      </div>
    </div>

    <div class="rounded-lg border bg-card p-6">
      <h2 class="text-sm font-medium">Por estado</h2>
      <p class="mb-4 text-xs text-muted-foreground">
        Pedidos del periodo (incluye cancelados)
      </p>

      <div class="space-y-3">
        {#each porEstado as fila (fila.estado)}
          <div class="flex items-center justify-between gap-2">
            <Badge
              variant={ESTILO_ESTADO[fila.estado].variante}
              class={ESTILO_ESTADO[fila.estado].clase}
            >
              {fila.etiqueta}
            </Badge>
            <span class="text-sm tabular-nums">{fila.pedidos}</span>
          </div>
        {:else}
          <p class="text-sm text-muted-foreground">Sin datos.</p>
        {/each}
      </div>
    </div>
  </div>

  {#if productoFiltro}
    <!-- Modo producto: clientes que más lo compraron -->
    <div class="mt-6 rounded-lg border bg-card p-6">
      <div class="mb-4">
        <h2 class="text-sm font-medium">Clientes que más lo compraron</h2>
        <p class="text-xs text-muted-foreground">
          Por unidades · monto con impuesto
        </p>
      </div>

      <div class="grid gap-x-8 gap-y-2 xl:grid-cols-2">
        {#each clientes as cliente, i (cliente.nombre)}
          <div class="flex items-center gap-3 rounded-md bg-muted/40 px-3 py-2">
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background text-xs font-medium"
            >
              {i + 1}
            </span>
            <p class="min-w-0 flex-1 truncate text-sm">{cliente.nombre}</p>
            <p class="shrink-0 text-sm tabular-nums text-muted-foreground">
              {cliente.unidades} u.
            </p>
            <p
              class="w-20 shrink-0 text-right text-sm font-medium tabular-nums"
            >
              {formatearMonto(cliente.monto)}
            </p>
          </div>
        {:else}
          <p class="text-sm text-muted-foreground xl:col-span-2">Sin datos.</p>
        {/each}
      </div>
    </div>
  {:else}
    <!-- Modo general: productos más vendidos (clic para filtrar) -->
    <div class="mt-6 rounded-lg border bg-card p-6">
      <div class="mb-4">
        <h2 class="text-sm font-medium">Productos más vendidos</h2>
        <p class="text-xs text-muted-foreground">
          Por unidades · ingresos sin IVA · clic para ver el detalle
        </p>
      </div>

      <div class="grid gap-x-8 gap-y-2 xl:grid-cols-2">
        {#each top as producto, i (producto.nombre)}
          <button
            type="button"
            class="flex items-center gap-3 rounded-md bg-muted/40 px-3 py-2 text-left transition-colors hover:bg-muted"
            onclick={() =>
              filtrarPorProducto(producto.nombre, producto.unidades)}
          >
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background text-xs font-medium"
            >
              {i + 1}
            </span>
            <p class="min-w-0 flex-1 truncate text-sm">{producto.nombre}</p>
            <p class="shrink-0 text-sm tabular-nums text-muted-foreground">
              {producto.unidades} u.
            </p>
            <p
              class="w-20 shrink-0 text-right text-sm font-medium tabular-nums"
            >
              {formatearMonto(producto.ingresos)}
            </p>
          </button>
        {:else}
          <p class="text-sm text-muted-foreground xl:col-span-2">Sin datos.</p>
        {/each}
      </div>
    </div>
  {/if}

  <DetalleGraficoDialog
    bind:open={dialogDatosAbierto}
    titulo={tituloDatos}
    descripcion={descripcionDatos}
    puntos={serieActiva}
  />
</div>
