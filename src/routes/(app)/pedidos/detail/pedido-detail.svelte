<!-- src/routes/(app)/pedidos/detail/pedido-detail.svelte -->
<script lang="ts">
  import ImageIcon from "@lucide/svelte/icons/image";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { cn } from "$lib/utils.js";
  import type { Pedido } from "$lib/types/pedido";
  import {
    contarArticulos,
    ESTILO_ESTADO,
    ESTILO_PAGO,
    ETIQUETA_CANAL,
    ETIQUETA_ESTADO,
    ETIQUETA_PAGO,
    formatearFechaHoraPedido,
    formatearMonto,
    totalUnidades,
  } from "$lib/utils/pedido";

  let { pedido }: { pedido: Pedido } = $props();

  const estilo = $derived(ESTILO_ESTADO[pedido.estado]);
  const estiloPago = $derived(ESTILO_PAGO[pedido.estadoPago]);
  const ultimo = $derived(pedido.historial.length - 1);
</script>

<div class="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4">
  <!-- Cliente -->
  <section class="flex flex-col gap-1">
    <h3
      class="text-xs font-medium uppercase tracking-wide text-muted-foreground"
    >
      Cliente
    </h3>
    <p class="text-sm font-medium">{pedido.cliente.nombre}</p>
    <p class="text-xs text-muted-foreground">{pedido.cliente.email}</p>
    <p class="text-xs text-muted-foreground">{pedido.cliente.telefono}</p>
    <p class="text-xs text-muted-foreground">{pedido.cliente.direccion}</p>
  </section>

  <Separator />

  <!-- Origen -->
  <section class="flex flex-col gap-1">
    <h3
      class="text-xs font-medium uppercase tracking-wide text-muted-foreground"
    >
      Origen
    </h3>
    <p class="text-sm font-medium">{ETIQUETA_CANAL[pedido.canal]}</p>
    <p class="text-xs text-muted-foreground">
      {pedido.creadoPor
        ? `Registrado por ${pedido.creadoPor}`
        : "Creado por el cliente"}
    </p>
  </section>

  <Separator />

  <!-- Artículos -->
  <section class="flex flex-col gap-3">
    <h3
      class="text-xs font-medium uppercase tracking-wide text-muted-foreground"
    >
      {contarArticulos(pedido)} líneas · {totalUnidades(pedido)} unidades
    </h3>
    <ul class="flex flex-col gap-3">
      {#each pedido.items as item (item.nombre)}
        <li class="flex items-center gap-3">
          <div
            class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted"
          >
            {#if item.imagen}
              <img
                src={item.imagen}
                alt=""
                class="h-full w-full object-cover"
              />
            {:else}
              <ImageIcon class="size-4 text-muted-foreground" />
            {/if}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{item.nombre}</p>
            <p class="text-xs text-muted-foreground">
              {item.cantidad} × {formatearMonto(item.precioUnitario)}
            </p>
          </div>
          <p class="text-sm font-medium tabular-nums">
            {formatearMonto(item.cantidad * item.precioUnitario)}
          </p>
        </li>
      {/each}
    </ul>
  </section>

  <Separator />

  <!-- Totales -->
  <section class="flex flex-col gap-2 text-sm">
    <div class="flex items-center justify-between">
      <span class="text-muted-foreground">Subtotal</span>
      <span class="tabular-nums">{formatearMonto(pedido.subtotal)}</span>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-muted-foreground">IVA (19%)</span>
      <span class="tabular-nums">{formatearMonto(pedido.impuesto)}</span>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-muted-foreground">Envío</span>
      <span class="tabular-nums">{formatearMonto(pedido.envio)}</span>
    </div>
    <Separator />
    <div class="flex items-center justify-between text-base font-semibold">
      <span>Total</span>
      <span class="tabular-nums">{formatearMonto(pedido.total)}</span>
    </div>
  </section>

  <Separator />

  <!-- Pago -->
  <section class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <h3
        class="text-xs font-medium uppercase tracking-wide text-muted-foreground"
      >
        Pago
      </h3>
      <Badge variant={estiloPago.variante} class={estiloPago.clase}>
        {ETIQUETA_PAGO[pedido.estadoPago]}
      </Badge>
    </div>
    <p class="text-sm">{pedido.metodoPago}</p>
    {#if pedido.pagadoEn}
      <p class="text-xs text-muted-foreground">
        Cobrado el {formatearFechaHoraPedido(pedido.pagadoEn)}
      </p>
    {:else if pedido.vencimiento}
      <p class="text-xs text-muted-foreground">
        Vence el {formatearFechaHoraPedido(pedido.vencimiento)}
      </p>
    {/if}
  </section>

  {#if pedido.notas}
    <Separator />
    <section class="flex flex-col gap-1">
      <h3
        class="text-xs font-medium uppercase tracking-wide text-muted-foreground"
      >
        Notas
      </h3>
      <p class="text-sm text-muted-foreground">{pedido.notas}</p>
    </section>
  {/if}

  <Separator />

  <!-- Seguimiento -->
  <section class="flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <h3
        class="text-xs font-medium uppercase tracking-wide text-muted-foreground"
      >
        Seguimiento
      </h3>
      <Badge variant={estilo.variante} class={estilo.clase}>
        {ETIQUETA_ESTADO[pedido.estado]}
      </Badge>
    </div>

    <ul class="flex flex-col">
      {#each pedido.historial as evento, indice (evento.estado + evento.fecha)}
        <li class="flex gap-3">
          <div class="flex flex-col items-center">
            <span
              class={cn(
                "mt-1 size-2.5 shrink-0 rounded-full",
                indice === ultimo ? "bg-primary" : "bg-muted-foreground/30",
              )}
            ></span>
            {#if indice < ultimo}
              <span class="w-px flex-1 bg-border"></span>
            {/if}
          </div>
          <div class={cn("pb-4", indice === ultimo && "pb-0")}>
            <p class="text-sm font-medium">{ETIQUETA_ESTADO[evento.estado]}</p>
            <p class="text-xs text-muted-foreground">
              {formatearFechaHoraPedido(evento.fecha)}
            </p>
          </div>
        </li>
      {/each}
    </ul>
  </section>
</div>
