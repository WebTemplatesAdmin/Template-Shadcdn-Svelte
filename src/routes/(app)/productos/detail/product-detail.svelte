<script lang="ts">
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import Pencil from "@lucide/svelte/icons/pencil";
  import Gauge from "@lucide/svelte/icons/gauge";
  import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import ImageIcon from "@lucide/svelte/icons/image";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import DetailCard from "./detail-card.svelte";
  import DetailItem from "./detail-item.svelte";
  import ProductGallery from "./product-gallery.svelte";
  import {
    calcularMargen,
    esMargenNegativo,
    calcularValorInventario,
    calcularPrecioConIva,
    formatearMoneda,
    formatearFecha,
    precioDesde,
    precioHasta,
    stockTotal,
    tieneVariantes,
    etiquetaVariante,
    ICONO_EVENTO,
  } from "$lib/utils/producto";
  import type { EventoProducto, Producto } from "$lib/types/producto";

  let {
    producto,
    historial,
  }: {
    producto: Producto;
    historial?: EventoProducto[];
  } = $props();

  const p = $derived(producto);
  const currency = $derived(p.currency ?? "COP");
  const margen = $derived(calcularMargen(p.costPrice ?? 0, precioDesde(p)));
  const margenNegativo = $derived(
    esMargenNegativo(p.costPrice ?? 0, precioDesde(p)),
  );
  const valorInventario = $derived(
    calcularValorInventario(stockTotal(p), p.costPrice ?? 0),
  );
  const precioConIva = $derived(
    calcularPrecioConIva(precioDesde(p), p.taxRate ?? "19"),
  );

  const ESTADO_VARIANTE = {
    activo: "default",
    inactivo: "secondary",
    borrador: "outline",
  } as const;
</script>

<svelte:head>
  <title>{p.name} · Mis Ventas</title>
</svelte:head>

<div class="animate-fade-up mx-auto max-w-5xl pb-16">
  <a
    href="/productos"
    class="mb-6 mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
  >
    <ArrowLeft class="h-4 w-4" />
    Volver a productos
  </a>

  <!-- Encabezado -->
  <div
    class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
  >
    <div class="space-y-2">
      <div class="flex flex-wrap items-center gap-2">
        <h1 class="text-2xl font-semibold">{p.name}</h1>
        <Badge
          variant={ESTADO_VARIANTE[p.status ?? "activo"]}
          class="capitalize"
        >
          {p.status ?? "activo"}
        </Badge>
        {#if p.featured}
          <Badge variant="secondary">Destacado</Badge>
        {/if}
      </div>
      <p class="text-sm capitalize text-muted-foreground">
        {p.category}{#if p.sku}
          · <span class="font-mono normal-case">{p.sku}</span>
        {/if}
      </p>
    </div>

    <Button href={`/productos/${p.id}/editar`}>
      <Pencil class="mr-2 h-4 w-4" />
      Editar
    </Button>
  </div>

  <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <!-- Columna principal -->
    <div class="space-y-6 lg:col-span-2">
      <DetailCard title="Imágenes">
        <ProductGallery imagenes={p.imagenes ?? []} />
      </DetailCard>

      <DetailCard title="Información general">
        <dl class="space-y-3">
          <DetailItem label="Nombre" value={p.name} />
          <DetailItem label="Marca" value={p.brand} />
          <DetailItem label="Categoría" value={p.category} />
          <DetailItem label="SKU" value={p.sku} mono />
          <DetailItem label="Código de barras" value={p.codigoBarras} mono />
          <DetailItem label="Descripción" value={p.description} />
        </dl>
      </DetailCard>

      <DetailCard title="Especificaciones">
        <dl class="space-y-3">
          <DetailItem
            label="Vida útil"
            value={p.diasVidaUtil ? `${p.diasVidaUtil} días` : null}
          />
          {#each p.atributos ?? [] as attr, i (i)}
            <DetailItem label={attr.nombre} value={attr.valor} />
          {/each}
        </dl>

        {#if !p.diasVidaUtil && (p.atributos ?? []).length === 0}
          <p class="text-sm text-muted-foreground">Sin especificaciones.</p>
        {/if}
      </DetailCard>

      <DetailCard title="Costo e inventario">
        <dl class="space-y-3">
          <DetailItem
            label="Precio de costo"
            value={p.costPrice != null
              ? formatearMoneda(p.costPrice, currency)
              : null}
          />
          <DetailItem
            label={tieneVariantes(p)
              ? "Precio de venta"
              : "Precio de venta (unidad)"}
            value={tieneVariantes(p)
              ? `${formatearMoneda(precioDesde(p), currency)} – ${formatearMoneda(precioHasta(p), currency)}`
              : formatearMoneda(p.price, currency)}
          />
          <DetailItem label="Moneda" value={currency} />
          <DetailItem label="IVA" value={`${p.taxRate ?? "19"}%`} />
          <DetailItem
            label={tieneVariantes(p)
              ? "Stock (suma de variantes)"
              : "Stock (unidades)"}
            value={stockTotal(p).toLocaleString("es-CO")}
          />
          <DetailItem label="Stock mínimo" value={p.minStock} />
          <DetailItem label="Ubicación en almacén" value={p.location} />
        </dl>
      </DetailCard>

      <DetailCard title="Formas de venta adicionales">
        {#if p.presentaciones && p.presentaciones.length > 0}
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head></Table.Head>
                <Table.Head>Nombre</Table.Head>
                <Table.Head>SKU</Table.Head>
                <Table.Head class="text-right">Unidades</Table.Head>
                <Table.Head class="text-right">Precio</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each p.presentaciones as pres}
                <Table.Row>
                  <Table.Cell>
                    <div
                      class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border bg-muted"
                    >
                      {#if pres.imagen}
                        <img
                          src={pres.imagen}
                          alt=""
                          class="h-full w-full object-cover"
                        />
                      {:else}
                        <ImageIcon class="h-4 w-4 text-muted-foreground" />
                      {/if}
                    </div>
                  </Table.Cell>
                  <Table.Cell class="font-medium">{pres.nombre}</Table.Cell>
                  <Table.Cell class="font-mono text-xs text-muted-foreground">
                    {pres.sku}
                  </Table.Cell>
                  <Table.Cell class="text-right tabular-nums">
                    {pres.unidadesPorPaquete}
                  </Table.Cell>
                  <Table.Cell class="text-right tabular-nums">
                    {formatearMoneda(pres.price, currency)}
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        {:else}
          <p class="py-6 text-center text-sm text-muted-foreground">
            Este producto solo se vende por unidad.
          </p>
        {/if}
      </DetailCard>

      {#if tieneVariantes(p)}
        <DetailCard title="Variantes">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>Variante</Table.Head>
                <Table.Head>SKU</Table.Head>
                <Table.Head class="text-right">Precio</Table.Head>
                <Table.Head class="text-right">Stock</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each p.variantes ?? [] as v, i (i)}
                <Table.Row>
                  <Table.Cell class="font-medium">
                    {etiquetaVariante(v.opciones) || "—"}
                  </Table.Cell>
                  <Table.Cell class="font-mono text-xs text-muted-foreground">
                    {v.sku}
                  </Table.Cell>
                  <Table.Cell class="text-right tabular-nums">
                    {formatearMoneda(v.price, currency)}
                  </Table.Cell>
                  <Table.Cell class="text-right tabular-nums">
                    {v.stock.toLocaleString("es-CO")}
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </DetailCard>
      {/if}
    </div>

    <!-- Columna lateral -->
    <div class="lg:col-span-1">
      <div class="sticky top-20 space-y-6">
        <DetailCard title="Resumen" icon={Gauge} variant="primary">
          <dl class="space-y-3">
            <DetailItem label="Precio con IVA">
              <span class="text-base font-semibold">
                {formatearMoneda(precioConIva, currency)}
              </span>
            </DetailItem>
            <DetailItem label="Margen">
              <span
                class={margenNegativo
                  ? "text-base font-semibold text-destructive"
                  : "text-base font-semibold text-green-600 dark:text-green-500"}
              >
                {margen}%
              </span>
            </DetailItem>
            <DetailItem label="Valor del inventario">
              <span class="text-base font-semibold">
                {formatearMoneda(valorInventario, currency)}
              </span>
            </DetailItem>
          </dl>

          {#if margenNegativo}
            <div
              class="mt-4 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3"
            >
              <TriangleAlert class="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p class="text-xs text-destructive">
                Estás vendiendo <strong>por debajo del costo</strong>. Revisa el
                precio de venta.
              </p>
            </div>
          {/if}
        </DetailCard>

        <DetailCard title="Organización">
          <dl class="space-y-3">
            <DetailItem label="Categoría" value={p.category} />
            <DetailItem label="Estado">
              <Badge
                variant={ESTADO_VARIANTE[p.status ?? "activo"]}
                class="capitalize"
              >
                {p.status ?? "activo"}
              </Badge>
            </DetailItem>
            <DetailItem label="Destacado">
              <Badge variant={p.featured ? "default" : "secondary"}>
                {p.featured ? "Sí" : "No"}
              </Badge>
            </DetailItem>
          </dl>
        </DetailCard>

        {#if historial}
          <DetailCard title="Información relacionada">
            {#if historial.length === 0}
              <p class="text-sm text-muted-foreground">
                Sin eventos registrados para este producto.
              </p>
            {:else}
              <ul class="space-y-4">
                {#each historial as evento (evento.id)}
                  {@const Icono = ICONO_EVENTO[evento.tipo]}
                  <li class="flex gap-3">
                    <div
                      class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted"
                    >
                      <Icono class="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div class="min-w-0 flex-1 space-y-0.5">
                      <div class="flex items-start justify-between gap-2">
                        <p class="text-sm font-medium leading-tight">
                          {evento.titulo}
                        </p>
                        <span
                          class="shrink-0 text-[11px] text-muted-foreground"
                        >
                          {formatearFecha(evento.fecha)}
                        </span>
                      </div>
                      <p class="text-xs text-muted-foreground">
                        {evento.detalle}
                      </p>
                    </div>
                  </li>
                {/each}
              </ul>
            {/if}

            <Button
              variant="outline"
              size="sm"
              class="mt-4 w-full"
              href={`/productos/${p.id}/historial`}
            >
              Ver historial completo
              <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
          </DetailCard>
        {/if}
      </div>
    </div>
  </div>
</div>
