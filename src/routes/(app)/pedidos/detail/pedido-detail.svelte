<!-- src/routes/(app)/pedidos/detail/pedido-detail.svelte -->
<script lang="ts">
  import ImageIcon from "@lucide/svelte/icons/image";
  import FileText from "@lucide/svelte/icons/file-text";
  import Paperclip from "@lucide/svelte/icons/paperclip";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { cn } from "$lib/utils.js";
  import type { Pedido } from "$lib/types/pedido";
  import {
    TAMANIO_MAX_COMPROBANTE_MB,
    TIPOS_COMPROBANTE,
  } from "$lib/config/pagos";
  import { notificarError } from "$lib/utils/notify";
  import {
    contarArticulos,
    admiteComprobante,
    ESTILO_ESTADO,
    ESTILO_PAGO,
    ETIQUETA_CANAL,
    ETIQUETA_ESTADO,
    ETIQUETA_PAGO,
    etiquetaMetodo,
    formatearFechaHoraPedido,
    formatearMonto,
    puedeAdjuntarComprobante,
    puedeRechazarComprobante,
    puedeValidarComprobante,
    totalUnidades,
  } from "$lib/utils/pedido";

  let {
    pedido,
    onAdjuntarComprobante,
    onValidarPago,
    onRechazarPago,
  }: {
    pedido: Pedido;
    onAdjuntarComprobante: (pedido: Pedido, archivo: File) => void;
    onValidarPago: (pedido: Pedido) => void;
    onRechazarPago: (pedido: Pedido) => void;
  } = $props();

  const estilo = $derived(ESTILO_ESTADO[pedido.estado]);
  const estiloPago = $derived(ESTILO_PAGO[pedido.estadoPago]);
  const ultimo = $derived(pedido.historial.length - 1);

  const admiteSoporte = $derived(admiteComprobante(pedido.metodoPago));

  /** Resumen legible de la tarjeta (solo últimos 4 dígitos). */
  const tarjetaTexto = $derived(
    pedido.pago?.tarjeta
      ? `${pedido.pago.tarjeta.marca ? pedido.pago.tarjeta.marca + " · " : ""}•••• ${pedido.pago.tarjeta.ultimos4} · ${pedido.pago.tarjeta.titular} · vence ${pedido.pago.tarjeta.vencimiento}`
      : null,
  );

  let inputComprobante: HTMLInputElement | null = $state(null);

  function manejarComprobante(evento: Event) {
    const input = evento.currentTarget as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    if (
      !TIPOS_COMPROBANTE.includes(
        archivo.type as (typeof TIPOS_COMPROBANTE)[number],
      )
    ) {
      notificarError("Formato no válido", "Adjunta un PDF, JPG o PNG.");
      input.value = "";
      return;
    }
    if (archivo.size > TAMANIO_MAX_COMPROBANTE_MB * 1024 * 1024) {
      notificarError(
        "Archivo demasiado grande",
        `El comprobante no puede superar los ${TAMANIO_MAX_COMPROBANTE_MB} MB.`,
      );
      input.value = "";
      return;
    }

    onAdjuntarComprobante(pedido, archivo);
    input.value = "";
  }
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
    <p class="text-sm">{etiquetaMetodo(pedido.metodoPago)}</p>
    {#if pedido.pago?.transaccionId}
      <p class="text-xs text-muted-foreground">
        Transacción: {pedido.pago.transaccionId}
      </p>
    {/if}
    {#if tarjetaTexto}
      <p class="text-xs text-muted-foreground">{tarjetaTexto}</p>
    {/if}
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

  <Separator />

  <!-- Comprobante (evidencia de pago; no es el cobro en sí) -->
  <section class="flex flex-col gap-3">
    <h3
      class="text-xs font-medium uppercase tracking-wide text-muted-foreground"
    >
      Comprobante
    </h3>

    {#if pedido.comprobante}
      <div class="flex items-center gap-3 rounded-md border p-3">
        <FileText class="size-4 shrink-0 text-muted-foreground" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">
            {pedido.comprobante.archivo}
          </p>
          <p class="text-xs text-muted-foreground">
            Subido por {pedido.comprobante.subidoPor} · {formatearFechaHoraPedido(
              pedido.comprobante.subidoEn,
            )}
          </p>
          {#if pedido.comprobante.referencia}
            <p class="text-xs text-muted-foreground">
              Ref. {pedido.comprobante.referencia}
            </p>
          {/if}
        </div>
        <p class="text-sm font-medium tabular-nums">
          {formatearMonto(pedido.comprobante.monto)}
        </p>
      </div>

      {#if puedeValidarComprobante(pedido)}
        <div class="flex items-center gap-2">
          <Button size="sm" onclick={() => onValidarPago(pedido)}>
            Validar pago
          </Button>
          <Button
            variant="outline"
            size="sm"
            onclick={() => onRechazarPago(pedido)}
          >
            Rechazar
          </Button>
        </div>
      {/if}
    {:else if admiteSoporte && puedeAdjuntarComprobante(pedido)}
      <input
        bind:this={inputComprobante}
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        class="hidden"
        onchange={manejarComprobante}
      />
      <div>
        <Button
          variant="outline"
          size="sm"
          onclick={() => inputComprobante?.click()}
        >
          <Paperclip data-icon="inline-start" />
          Adjuntar comprobante
        </Button>
      </div>
      <p class="text-xs text-muted-foreground">
        Opcional: por si el cliente envía el soporte (transferencia, link de
        pago o billetera virtual). PDF, JPG o PNG, máx
        {TAMANIO_MAX_COMPROBANTE_MB} MB.
      </p>
    {:else if admiteSoporte}
      <p class="text-xs text-muted-foreground">Sin comprobante adjunto.</p>
    {:else}
      <p class="text-xs text-muted-foreground">
        Este método de pago no maneja comprobante.
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
