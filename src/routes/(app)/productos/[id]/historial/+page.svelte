<script lang="ts">
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import CalendarDays from "@lucide/svelte/icons/calendar-days";
  import Clock from "@lucide/svelte/icons/clock";
  import History from "@lucide/svelte/icons/history";
  import Search from "@lucide/svelte/icons/search";
  import SearchX from "@lucide/svelte/icons/search-x";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import * as InputGroup from "$lib/components/ui/input-group/index.js";
  import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
  import { formatearFecha } from "$lib/utils/producto";
  import type { EventoProducto } from "$lib/types/producto";
  import DetailCard from "../../detail/detail-card.svelte";
  import EventoItem from "../../detail/evento-item.svelte";
  import HistorialSkeleton from "../../detail/historial-skeleton.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  // Se resuelven juntos para montar la bitácora una sola vez.
  // svelte-ignore state_referenced_locally: `data` es estable por navegación.
  const datos = Promise.all([data.producto, data.historial]);

  const TIPOS = [
    { valor: "todos", etiqueta: "Todos" },
    { valor: "creacion", etiqueta: "Creación" },
    { valor: "precio", etiqueta: "Precio" },
    { valor: "stock", etiqueta: "Stock" },
    { valor: "promocion", etiqueta: "Promoción" },
    { valor: "venta", etiqueta: "Venta" },
  ] as const;

  let filtro = $state<string>("todos");
  let busqueda = $state("");

  /** Nº de eventos por tipo (para el contador de cada filtro). */
  function contarPorTipo(eventos: EventoProducto[]): Record<string, number> {
    return eventos.reduce<Record<string, number>>((acc, e) => {
      acc[e.tipo] = (acc[e.tipo] ?? 0) + 1;
      return acc;
    }, {});
  }

  /** Etiqueta legible del día: "Hoy", "Ayer" o la fecha corta. */
  function etiquetaDia(iso: string): string {
    const fecha = new Date(iso);
    const hoy = new Date();
    const mismoDia = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
    if (mismoDia(fecha, hoy)) return "Hoy";
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    if (mismoDia(fecha, ayer)) return "Ayer";
    return formatearFecha(iso);
  }

  /** Agrupa los eventos (ya ordenados) por jornada consecutiva. */
  function agruparPorDia(eventos: EventoProducto[]) {
    const grupos: { etiqueta: string; eventos: EventoProducto[] }[] = [];
    for (const evento of eventos) {
      const etiqueta = etiquetaDia(evento.fecha);
      const ultimo = grupos.at(-1);
      if (ultimo && ultimo.etiqueta === etiqueta) ultimo.eventos.push(evento);
      else grupos.push({ etiqueta, eventos: [evento] });
    }
    return grupos;
  }
</script>

<svelte:head>
  <title>Historial de cambios · Mis Ventas</title>
</svelte:head>

{#await datos}
  <HistorialSkeleton />
{:then resultado}
  {@const producto = resultado[0]}
  {@const historial = resultado[1]}
  {@const orden = [...historial].sort(
    (a, b) => +new Date(b.fecha) - +new Date(a.fecha),
  )}
  {@const conteo = contarPorTipo(historial)}
  {@const q = busqueda.trim().toLowerCase()}
  {@const visibles = orden
    .filter((e) => filtro === "todos" || e.tipo === filtro)
    .filter(
      (e) =>
        !q ||
        e.titulo.toLowerCase().includes(q) ||
        e.detalle.toLowerCase().includes(q),
    )}
  {@const grupos = agruparPorDia(visibles)}
  <!-- "Más reciente" apunta al cambio más nuevo del producto, no al primero del subconjunto filtrado. -->
  {@const recienteId = orden[0]?.id}

  <div class="animate-fade-up mx-auto max-w-3xl pb-16">
    <a
      href={data.volver}
      class="mb-6 mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft class="h-4 w-4" />
      {data.volver.endsWith("/editar")
        ? "Volver a la edición"
        : "Volver al producto"}
    </a>

    <div class="mb-6 flex flex-col gap-1">
      <h1 class="text-2xl font-semibold">Historial de cambios</h1>
      <p class="text-sm text-muted-foreground">{producto.name}</p>
    </div>

    <!-- Resumen de la bitácora -->
    <div
      class="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
    >
      <span
        class="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1"
      >
        <History class="size-3.5" />
        {historial.length}
        {historial.length === 1 ? "cambio registrado" : "cambios registrados"}
      </span>
      {#if orden.length > 0}
        <span
          class="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1"
        >
          <Clock class="size-3.5" />
          Último cambio: {formatearFecha(orden[0].fecha)}
        </span>
      {/if}
      {#if orden.length > 1}
        <span
          class="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1"
        >
          <CalendarDays class="size-3.5" />
          Primer registro: {formatearFecha(orden[orden.length - 1].fecha)}
        </span>
      {/if}
    </div>

    <!-- Filtro por tipo + búsqueda -->
    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <ToggleGroup.Root
        type="single"
        value={filtro}
        onValueChange={(v) => (filtro = v || "todos")}
        variant="outline"
        size="sm"
        spacing={2}
        class="flex-wrap"
      >
        {#each TIPOS as t (t.valor)}
          {@const n =
            t.valor === "todos" ? historial.length : (conteo[t.valor] ?? 0)}
          <ToggleGroup.Item value={t.valor}>
            {t.etiqueta}
            <span class="text-[10px] tabular-nums text-muted-foreground"
              >{n}</span
            >
          </ToggleGroup.Item>
        {/each}
      </ToggleGroup.Root>

      <InputGroup.Root class="w-full sm:w-64">
        <InputGroup.Addon align="inline-start">
          <Search />
        </InputGroup.Addon>
        <InputGroup.Input
          placeholder="Buscar en el historial…"
          aria-label="Buscar en el historial"
          bind:value={busqueda}
        />
      </InputGroup.Root>
    </div>

    <DetailCard title="Bitácora">
      {#if historial.length === 0}
        <Empty.Root class="border-0 p-0">
          <Empty.Header>
            <Empty.Media variant="icon"><History /></Empty.Media>
            <Empty.Title>Sin cambios registrados</Empty.Title>
            <Empty.Description>
              Este producto todavía no tiene movimientos en su bitácora.
            </Empty.Description>
          </Empty.Header>
        </Empty.Root>
      {:else if visibles.length === 0}
        <Empty.Root class="border-0 p-0">
          <Empty.Header>
            <Empty.Media variant="icon"><SearchX /></Empty.Media>
            <Empty.Title>Sin resultados</Empty.Title>
            <Empty.Description>
              No hay cambios que coincidan con el filtro o la búsqueda.
            </Empty.Description>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onclick={() => {
                filtro = "todos";
                busqueda = "";
              }}
            >
              Limpiar filtros
            </Button>
          </Empty.Header>
        </Empty.Root>
      {:else}
        <div class="flex flex-col gap-6">
          {#each grupos as grupo (grupo.etiqueta)}
            <div class="flex flex-col gap-3">
              <h3
                class="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                {grupo.etiqueta}
              </h3>
              <!-- Timeline vertical: línea detrás de los iconos -->
              <ul
                class="relative flex flex-col gap-4 before:absolute before:bottom-2 before:left-[13px] before:top-2 before:w-px before:bg-border"
              >
                {#each grupo.eventos as evento (evento.id)}
                  <EventoItem
                    {evento}
                    hora={true}
                    reciente={evento.id === recienteId}
                  />
                {/each}
              </ul>
            </div>
          {/each}
        </div>
      {/if}
    </DetailCard>
  </div>
{:catch}
  <div class="mx-auto max-w-3xl py-20 text-center">
    <p class="text-sm text-muted-foreground">
      No se pudo cargar el historial. Intenta de nuevo.
    </p>
  </div>
{/await}
