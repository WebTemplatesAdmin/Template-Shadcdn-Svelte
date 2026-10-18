<!-- src/routes/(app)/clientes/[id]/cliente-detalle.svelte -->
<script lang="ts">
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import Plus from "@lucide/svelte/icons/plus";
  import ShieldAlert from "@lucide/svelte/icons/shield-alert";
  import StickyNote from "@lucide/svelte/icons/sticky-note";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import {
    ESTILO_ESTADO,
    ETIQUETA_ESTADO,
    formatearFechaHoraPedido,
    formatearMonto,
  } from "$lib/utils/pedido";
  import { resumenTarjeta } from "$lib/utils/tarjeta";
  import { ESTILO_NOTA, ETIQUETA_NOTA, TIPOS_NOTA } from "$lib/utils/nota";
  import { formatearFechaRelativa } from "$lib/utils/fecha";
  import { notificarExito } from "$lib/utils/notify";
  import {
    clientesCreados,
    comunicacionesDeCliente,
    eliminarComunicacion,
    eliminarNota,
    eliminarTarjeta,
    notasDeCliente,
    tarjetasDeCliente,
  } from "$lib/state/clientes.svelte";
  import BotonLlamada from "./boton-llamada.svelte";
  import ComunicacionesPanel from "./comunicaciones/comunicaciones-panel.svelte";
  import ComunicacionDialog from "./comunicaciones/comunicacion-dialog.svelte";
  import NotaDialog from "./nota-dialog.svelte";
  import TarjetaDialog from "./tarjeta-dialog.svelte";
  import type {
    Cliente,
    ComunicacionCliente,
    NotaCliente,
    TipoNota,
  } from "$lib/types/cliente";
  import type { Pedido } from "$lib/types/pedido";
  import type { TarjetaGuardada } from "$lib/types/tarjeta";

  let {
    cliente,
    clienteId,
    pedidos,
    autor = "Juan Pérez",
  }: {
    cliente: Cliente | null;
    clienteId: number;
    pedidos: Pedido[];
    autor?: string;
  } = $props();

  let dialogAbierto = $state(false);
  let dialogNotaAbierto = $state(false);
  let dialogComunicacionAbierto = $state(false);
  let filtroNotas = $state<TipoNota | "todas">("todas");

  /** Si no vino del servidor, puede ser un cliente creado en esta sesión. */
  const datos = $derived(
    cliente ?? clientesCreados.find((c) => c.id === clienteId) ?? null,
  );
  const tarjetas = $derived(tarjetasDeCliente(datos));
  const notas = $derived(notasDeCliente(datos));
  const comunicaciones = $derived(comunicacionesDeCliente(datos));
  const restricciones = $derived(
    notas.filter((nota) => nota.tipo === "restriccion"),
  );
  const notasVisibles = $derived(
    filtroNotas === "todas"
      ? [...notas].sort(
          (a, b) =>
            Number(b.tipo === "restriccion") - Number(a.tipo === "restriccion"),
        )
      : notas.filter((nota) => nota.tipo === filtroNotas),
  );
  const conteoNotas = $derived({
    todas: notas.length,
    nota: notas.filter((nota) => nota.tipo === "nota").length,
    restriccion: restricciones.length,
  });

  const ventas = $derived(pedidos.filter((p) => p.estado !== "cancelado"));
  const totalComprado = $derived(
    ventas.reduce((suma, pedido) => suma + pedido.total, 0),
  );
  const ticketPromedio = $derived(
    ventas.length ? Math.round(totalComprado / ventas.length) : 0,
  );

  function iniciales(nombre: string): string {
    return nombre
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase() ?? "")
      .join("");
  }

  function quitarTarjeta(tarjeta: TarjetaGuardada) {
    eliminarTarjeta(tarjeta.id);
    notificarExito("Tarjeta eliminada", resumenTarjeta(tarjeta));
  }

  function quitarNota(nota: NotaCliente) {
    eliminarNota(nota.id);
    notificarExito("Nota eliminada", ETIQUETA_NOTA[nota.tipo]);
  }

  function quitarComunicacion(comunicacion: ComunicacionCliente) {
    eliminarComunicacion(comunicacion.id);
    notificarExito("Comunicación eliminada", comunicacion.contenido);
  }
</script>

{#snippet iconoNota(tipo: TipoNota)}
  <span
    class="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-background"
  >
    {#if tipo === "restriccion"}
      <ShieldAlert class="size-4 text-destructive" />
    {:else}
      <StickyNote class="size-4 text-muted-foreground" />
    {/if}
  </span>
{/snippet}

<div class="animate-fade-up mx-auto max-w-7xl pb-10">
  <a
    href="/clientes"
    class="mb-6 mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
  >
    <ArrowLeft class="size-4" />
    Volver a clientes
  </a>

  {#if !datos}
    <div class="rounded-lg border bg-card p-10 text-center">
      <p class="text-sm text-muted-foreground">
        Cliente no encontrado. Si lo creaste en esta sesión, puede haberse
        perdido al recargar.
      </p>
      <Button class="mt-4" variant="outline" href="/clientes">
        Volver a clientes
      </Button>
    </div>
  {:else}
    <!-- Encabezado -->
    <div
      class="flex flex-col gap-4 rounded-lg border bg-card p-6 sm:flex-row sm:items-center"
    >
      <Avatar.Root class="size-14">
        <Avatar.Fallback class="text-base">
          {iniciales(datos.nombre)}
        </Avatar.Fallback>
      </Avatar.Root>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="truncate text-xl font-semibold">{datos.nombre}</h1>
          {#if restricciones.length > 0}
            <Badge variant="destructive">
              <ShieldAlert />
              {restricciones.length}
              {restricciones.length === 1 ? "restricción" : "restricciones"}
            </Badge>
          {/if}
        </div>
        <p class="truncate text-sm text-muted-foreground">
          {datos.email || "Sin email"}
        </p>
      </div>
      <BotonLlamada cliente={datos} />
    </div>

    <!-- Datos de contacto -->
    <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-lg border bg-card p-4">
        <p class="text-xs text-muted-foreground">Teléfono</p>
        <p class="mt-1 truncate text-sm font-medium">{datos.telefono || "—"}</p>
      </div>
      <div class="rounded-lg border bg-card p-4">
        <p class="text-xs text-muted-foreground">Ciudad</p>
        <p class="mt-1 truncate text-sm font-medium">{datos.ciudad || "—"}</p>
      </div>
      <div class="rounded-lg border bg-card p-4">
        <p class="text-xs text-muted-foreground">Dirección</p>
        <p class="mt-1 truncate text-sm font-medium">
          {datos.direccion || "—"}
        </p>
      </div>
      <div class="rounded-lg border bg-card p-4">
        <p class="text-xs text-muted-foreground">Cliente desde</p>
        <p class="mt-1 truncate text-sm font-medium">
          {formatearFechaHoraPedido(datos.creadoEn)}
        </p>
      </div>
    </div>

    <!-- Resumen -->
    <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-lg border bg-card p-4">
        <p class="text-xs text-muted-foreground">Pedidos</p>
        <p class="mt-1 text-2xl font-semibold tabular-nums">
          {ventas.length}
        </p>
      </div>
      <div class="rounded-lg border bg-card p-4">
        <p class="text-xs text-muted-foreground">Total comprado</p>
        <p class="mt-1 text-2xl font-semibold tabular-nums">
          {formatearMonto(totalComprado)}
        </p>
      </div>
      <div class="rounded-lg border bg-card p-4">
        <p class="text-xs text-muted-foreground">Ticket promedio</p>
        <p class="mt-1 text-2xl font-semibold tabular-nums">
          {formatearMonto(ticketPromedio)}
        </p>
      </div>
      <div class="rounded-lg border bg-card p-4">
        <p class="text-xs text-muted-foreground">Tarjetas</p>
        <p class="mt-1 text-2xl font-semibold tabular-nums">
          {tarjetas.length}
        </p>
      </div>
    </div>

    <div class="mt-6 grid items-start gap-6 xl:grid-cols-3">
      <!-- Columna principal -->
      <div class="flex flex-col gap-6 xl:col-span-2">
        <ComunicacionesPanel
          {comunicaciones}
          onEliminar={quitarComunicacion}
          onNueva={() => (dialogComunicacionAbierto = true)}
        />

        <!-- Pedidos -->
        <div class="rounded-lg border bg-card p-6">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 class="text-sm font-medium">Pedidos del cliente</h2>
              <p class="text-xs text-muted-foreground">
                {pedidos.length} registrados
              </p>
            </div>
            <Button variant="outline" size="sm" href="/pedidos">
              Ver en Pedidos
            </Button>
          </div>

          {#if pedidos.length === 0}
            <p class="text-sm text-muted-foreground">
              Sin pedidos registrados.
            </p>
          {:else}
            <div class="flex flex-col gap-2">
              {#each pedidos as pedido (pedido.id)}
                <a
                  href={`/pedidos?ver=${pedido.id}&volver=/clientes/${datos.id}`}
                  aria-label={`Ver detalle del pedido ${pedido.codigo}`}
                  class="flex flex-wrap items-center gap-3 rounded-md bg-muted/40 px-3 py-2 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <span class="text-sm font-medium">{pedido.codigo}</span>
                  <span class="text-xs text-muted-foreground">
                    {formatearFechaHoraPedido(pedido.fecha)}
                  </span>
                  <Badge
                    variant={ESTILO_ESTADO[pedido.estado].variante}
                    class={ESTILO_ESTADO[pedido.estado].clase}
                  >
                    {ETIQUETA_ESTADO[pedido.estado]}
                  </Badge>
                  <span class="ml-auto text-sm font-medium tabular-nums">
                    {formatearMonto(pedido.total)}
                  </span>
                </a>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <!-- Columna lateral -->
      <div class="flex flex-col gap-6">
        <!-- Notas y restricciones -->
        <div class="rounded-lg border bg-card p-6">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-sm font-medium">Notas y restricciones</h2>
              <p class="text-xs text-muted-foreground">
                {notas.length}
                {notas.length === 1 ? "registro" : "registros"}
                {#if restricciones.length > 0}
                  · {restricciones.length}
                  {restricciones.length === 1 ? "restricción" : "restricciones"}
                {/if}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onclick={() => (dialogNotaAbierto = true)}
            >
              <Plus data-icon="inline-start" />
              Agregar
            </Button>
          </div>

          <ToggleGroup.Root
            type="single"
            value={filtroNotas}
            variant="outline"
            size="sm"
            class="mb-3 flex-wrap"
            onValueChange={(valor) => {
              if (valor) filtroNotas = valor as TipoNota | "todas";
            }}
          >
            <ToggleGroup.Item value="todas">
              Todas ({conteoNotas.todas})
            </ToggleGroup.Item>
            {#each TIPOS_NOTA as tipo}
              <ToggleGroup.Item value={tipo}>
                {ETIQUETA_NOTA[tipo]} ({conteoNotas[tipo]})
              </ToggleGroup.Item>
            {/each}
          </ToggleGroup.Root>

          {#if notasVisibles.length === 0}
            <p class="text-sm text-muted-foreground">
              {filtroNotas === "todas"
                ? "Sin notas registradas."
                : `Sin registros de tipo ${ETIQUETA_NOTA[filtroNotas].toLowerCase()}.`}
            </p>
          {:else}
            <div class="flex flex-col gap-2">
              {#each notasVisibles as nota (nota.id)}
                <div
                  class="flex items-start gap-3 rounded-md bg-muted/40 px-3 py-2.5"
                >
                  {@render iconoNota(nota.tipo)}
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <Badge
                        variant={ESTILO_NOTA[nota.tipo].variante}
                        class={ESTILO_NOTA[nota.tipo].clase}
                      >
                        {ETIQUETA_NOTA[nota.tipo]}
                      </Badge>
                      <span class="text-xs text-muted-foreground">
                        {nota.autor} · {formatearFechaRelativa(nota.creadoEn)}
                      </span>
                    </div>
                    <p class="mt-1 whitespace-pre-line text-sm">
                      {nota.contenido}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Eliminar ${ETIQUETA_NOTA[nota.tipo].toLowerCase()} de ${nota.autor}`}
                    onclick={() => quitarNota(nota)}
                  >
                    <Trash2 class="text-destructive" />
                  </Button>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Tarjetas -->
        <div class="rounded-lg border bg-card p-6">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 class="text-sm font-medium">Tarjetas guardadas</h2>
              <p class="text-xs text-muted-foreground">
                Solo últimos 4 dígitos y token
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onclick={() => (dialogAbierto = true)}
            >
              <Plus data-icon="inline-start" />
              Agregar
            </Button>
          </div>

          {#if tarjetas.length === 0}
            <p class="text-sm text-muted-foreground">Sin tarjetas guardadas.</p>
          {:else}
            <div class="flex flex-col gap-2">
              {#each tarjetas as tarjeta (tarjeta.id)}
                <div
                  class="flex items-center gap-3 rounded-md bg-muted/40 px-3 py-2"
                >
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium">
                      {resumenTarjeta(tarjeta)}
                    </p>
                    <p class="truncate text-xs text-muted-foreground">
                      {tarjeta.titular} · {tarjeta.token}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Quitar tarjeta ${tarjeta.ultimos4}`}
                    onclick={() => quitarTarjeta(tarjeta)}
                  >
                    <Trash2 class="text-destructive" />
                  </Button>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>

    <ComunicacionDialog
      bind:open={dialogComunicacionAbierto}
      clienteId={datos?.id ?? clienteId}
      {autor}
    />
    <TarjetaDialog
      bind:open={dialogAbierto}
      clienteId={datos?.id ?? clienteId}
    />
    <NotaDialog
      bind:open={dialogNotaAbierto}
      clienteId={datos?.id ?? clienteId}
      {autor}
    />
  {/if}
</div>
