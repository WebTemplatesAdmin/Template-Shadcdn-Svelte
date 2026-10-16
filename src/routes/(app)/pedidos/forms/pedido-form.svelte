<!-- src/routes/(app)/pedidos/forms/pedido-form.svelte -->
<script lang="ts">
  import { superForm } from "sveltekit-superforms";
  import { zod4Client } from "sveltekit-superforms/adapters";
  import InputFieldV2 from "$lib/components/InputsFormCustom/InputFieldV2.svelte";
  import * as Form from "$lib/components/ui/form/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import * as Command from "$lib/components/ui/command/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import Plus from "@lucide/svelte/icons/plus";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
  import UserPlus from "@lucide/svelte/icons/user-plus";
  import Braces from "@lucide/svelte/icons/braces";
  import Copy from "@lucide/svelte/icons/copy";
  import {
    construirPayloadPedido,
    pedidoSchema,
    type PedidoSchema,
    type ItemPedidoDatos,
  } from "../registrar/schemas/schema";
  import { METODOS_PAGO } from "$lib/config/pagos";
  import {
    admiteComprobante,
    CANALES,
    calcularTotales,
    ENVIO_ESTANDAR,
    ETIQUETA_CANAL,
    etiquetaMetodo,
    formatearMonto,
  } from "$lib/utils/pedido";
  import { etiquetaVariante } from "$lib/utils/producto";
  import {
    notificarAviso,
    notificarError,
    notificarExito,
  } from "$lib/utils/notify";
  import type { SuperValidated, Infer } from "sveltekit-superforms";
  import type { Producto } from "$lib/types/producto";
  import type { Cliente } from "$lib/types/cliente";
  import type { TarjetaGuardada } from "$lib/types/tarjeta";
  import {
    clientesCreados,
    registrarClienteCreado,
    registrarTarjetaCreada,
    tarjetasDeCliente,
  } from "$lib/state/clientes.svelte";

  let {
    form: formProp,
    catalogo,
    clientes: catalogoClientes,
    titulo,
    descripcion,
    textoBoton,
  }: {
    form: SuperValidated<Infer<PedidoSchema>>;
    catalogo: Producto[];
    clientes: Cliente[];
    titulo: string;
    descripcion: string;
    textoBoton: string;
  } = $props();

  // svelte-ignore state_referenced_locally: falso positivo conocido de Superforms
  const form = superForm(formProp, {
    validators: zod4Client(pedidoSchema),
    // Requerido: `items` es un array de objetos.
    dataType: "json",
    onResult({ result }) {
      if (result.type !== "redirect") return;
      notificarExito("Pedido creado", "El pedido se registró correctamente.");
    },
  });

  const { form: formData, enhance, submitting, errors } = form;

  // ============ Totales en vivo (misma fuente que el servidor) ============
  const totales = $derived(
    calcularTotales($formData.items, Number($formData.envio) || 0),
  );

  /** Marcas de tarjeta (ajústalas a tu país/pasarela). */
  const MARCAS_TARJETA = [
    "Visa",
    "Mastercard",
    "American Express",
    "Diners Club",
    "Otra",
  ];

  // ============ Cliente (desde la lista; se puede crear al vuelo) ============
  let clientePopoverAbierto = $state(false);
  let dialogNuevoClienteAbierto = $state(false);
  let nuevoCliente = $state({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
  });

  /** Catálogo + los creados en esta sesión (memoria, sin backend). */
  const listaClientes = $derived([...clientesCreados, ...catalogoClientes]);
  const clienteSeleccionado = $derived(
    listaClientes.find((c) => c.id === $formData.clienteId) ?? null,
  );

  function seleccionarCliente(cliente: Cliente) {
    // "Jala" los datos del perfil al pedido (snapshot).
    $formData.clienteId = cliente.id;
    $formData.clienteNombre = cliente.nombre;
    $formData.clienteEmail = cliente.email;
    $formData.clienteTelefono = cliente.telefono;
    $formData.clienteDireccion = cliente.direccion;
    clientePopoverAbierto = false;
    limpiarTarjeta(); // la tarjeta elegida era de otro cliente
  }

  function crearCliente() {
    if (!nuevoCliente.nombre.trim()) {
      notificarAviso(
        "Falta el nombre",
        "El nombre del cliente es obligatorio.",
      );
      return;
    }

    const cliente: Cliente = {
      id: 9000 + clientesCreados.length + 1,
      nombre: nuevoCliente.nombre.trim(),
      email: nuevoCliente.email.trim(),
      telefono: nuevoCliente.telefono.trim(),
      direccion: nuevoCliente.direccion.trim(),
      ...(nuevoCliente.ciudad.trim()
        ? { ciudad: nuevoCliente.ciudad.trim() }
        : {}),
      creadoEn: new Date().toISOString(),
    };

    registrarClienteCreado(cliente);
    seleccionarCliente(cliente);

    // TODO: enviar a tu API → POST /clientes
    console.log(
      `[clientes] Payload (CREAR) → POST /clientes\n${JSON.stringify(cliente, null, 2)}`,
    );

    notificarExito("Cliente creado", `${cliente.nombre} quedó seleccionado.`);
    dialogNuevoClienteAbierto = false;
    nuevoCliente = {
      nombre: "",
      email: "",
      telefono: "",
      direccion: "",
      ciudad: "",
    };
  }

  // ============ Tarjeta del cliente (seleccionar una guardada o guardar nueva) ============
  const tarjetasDelCliente = $derived(tarjetasDeCliente(clienteSeleccionado));

  /** Texto de la tarjeta en uso (solo últimos 4 dígitos). */
  const tarjetaActualTexto = $derived(
    $formData.tarjetaId
      ? `${$formData.tarjetaMarca ? $formData.tarjetaMarca + " " : ""}•••• ${$formData.tarjetaUltimos4} · vence ${$formData.tarjetaVencimiento}`
      : null,
  );

  function resumenTarjeta(tarjeta: TarjetaGuardada): string {
    return `${tarjeta.marca ? tarjeta.marca + " " : ""}•••• ${tarjeta.ultimos4} · vence ${tarjeta.vencimiento}`;
  }

  function aplicarTarjeta(tarjeta: TarjetaGuardada) {
    $formData.tarjetaId = tarjeta.id;
    $formData.tarjetaMarca = tarjeta.marca ?? "";
    $formData.tarjetaTitular = tarjeta.titular;
    $formData.tarjetaVencimiento = tarjeta.vencimiento;
    $formData.tarjetaUltimos4 = tarjeta.ultimos4;
  }

  function limpiarTarjeta() {
    $formData.tarjetaId = "";
    $formData.tarjetaMarca = "";
    $formData.tarjetaTitular = "";
    $formData.tarjetaVencimiento = "";
    $formData.tarjetaUltimos4 = "";
  }

  function seleccionarTarjeta(valor: string) {
    if (valor === "nueva") return limpiarTarjeta();
    const tarjeta = tarjetasDelCliente.find((t) => t.id === valor);
    if (tarjeta) aplicarTarjeta(tarjeta);
  }

  /** Guarda la tarjeta nueva (solo últimos 4 + token) y la deja en uso. */
  function guardarTarjeta() {
    const cliente = clienteSeleccionado;
    if (!cliente) {
      notificarAviso(
        "Selecciona un cliente",
        "La tarjeta se guarda en su perfil.",
      );
      return;
    }
    if (
      !$formData.tarjetaTitular.trim() ||
      !/^\d{2}\/\d{2}$/.test($formData.tarjetaVencimiento) ||
      !/^\d{4}$/.test($formData.tarjetaUltimos4)
    ) {
      notificarError(
        "Datos incompletos",
        "Completa titular, vencimiento (MM/AA) y los 4 dígitos.",
      );
      return;
    }

    const tarjeta: TarjetaGuardada = {
      id: `TAR-${cliente.id}-${Date.now()}`,
      clienteId: cliente.id,
      ...($formData.tarjetaMarca ? { marca: $formData.tarjetaMarca } : {}),
      ultimos4: $formData.tarjetaUltimos4,
      titular: $formData.tarjetaTitular.trim(),
      vencimiento: $formData.tarjetaVencimiento,
      // Demo: la pasarela devolvería este token al tokenizar la tarjeta.
      token: `tok_${($formData.tarjetaMarca || "card").toLowerCase()}_${$formData.tarjetaUltimos4}`,
      creadaEn: new Date().toISOString(),
    };

    registrarTarjetaCreada(tarjeta);
    aplicarTarjeta(tarjeta);

    // TODO: enviar a tu API → POST /clientes/:id/tarjetas
    console.log(
      `[clientes] Payload (GUARDAR TARJETA) → POST /clientes/${cliente.id}/tarjetas\n${JSON.stringify(tarjeta, null, 2)}`,
    );

    notificarExito(
      "Tarjeta guardada",
      `${resumenTarjeta(tarjeta)} quedó disponible para ${cliente.nombre}.`,
    );
  }

  // ============ Artículos ============
  function itemVacio(): ItemPedidoDatos {
    return {
      productoId: 0,
      nombre: "",
      varianteSku: undefined,
      cantidad: 1,
      precioUnitario: 0,
    };
  }

  function agregarItem() {
    $formData.items = [...$formData.items, itemVacio()];
  }

  function eliminarItem(index: number) {
    $formData.items = $formData.items.filter((_, i) => i !== index);
  }

  function seleccionarProducto(index: number, valor: string) {
    const producto = catalogo.find((p) => String(p.id) === valor);
    if (!producto) return;
    const variante = producto.variantes?.[0];
    $formData.items[index] = {
      ...$formData.items[index],
      productoId: producto.id,
      nombre: producto.name,
      precioUnitario: variante ? variante.price : producto.price,
      varianteSku: variante?.sku,
    };
  }

  function seleccionarVariante(index: number, sku: string) {
    const item = $formData.items[index];
    const producto = catalogo.find((p) => p.id === item.productoId);
    const variante = producto?.variantes?.find((v) => v.sku === sku);
    if (!variante) return;
    $formData.items[index] = {
      ...item,
      varianteSku: variante.sku,
      precioUnitario: variante.price,
    };
  }

  function variantesDe(productoId: number) {
    return catalogo.find((p) => p.id === productoId)?.variantes ?? [];
  }

  // ============ Vista previa del contrato (JSON) ============
  let dialogJsonAbierto = $state(false);
  const payloadJson = $derived(
    JSON.stringify(
      construirPayloadPedido($formData, { id: 0, codigo: "#nuevo" }),
      null,
      2,
    ),
  );

  async function copiarPayload() {
    try {
      await navigator.clipboard.writeText(payloadJson);
      notificarExito("JSON copiado", "El payload quedó en tu portapapeles.");
    } catch {
      notificarError("No se pudo copiar", "Copia el texto manualmente.");
    }
  }
</script>

<svelte:head>
  <title>{titulo} · Mis Ventas</title>
</svelte:head>

<div class="animate-fade-up mx-auto max-w-5xl pb-24">
  <a
    href="/pedidos"
    class="mb-6 mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
  >
    <ArrowLeft class="h-4 w-4" />
    Volver a pedidos
  </a>

  <div class="mb-6">
    <h1 class="text-2xl font-semibold">{titulo}</h1>
    <p class="text-sm text-muted-foreground">{descripcion}</p>
  </div>

  <form id="form-pedido" method="POST" use:enhance novalidate class="space-y-6">
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Columna principal -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Cliente -->
        <div class="rounded-lg border bg-card p-6">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h2 class="text-sm font-medium text-muted-foreground">Cliente</h2>
              <p class="text-xs text-muted-foreground">
                Elige uno de tu lista; sus datos se cargan solos.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onclick={() => (dialogNuevoClienteAbierto = true)}
            >
              <UserPlus data-icon="inline-start" />
              Nuevo cliente
            </Button>
          </div>

          <Form.Field {form} name="clienteId">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label>Cliente</Form.Label>
                <Popover.Root bind:open={clientePopoverAbierto}>
                  <Popover.Trigger>
                    {#snippet child({ props: triggerProps })}
                      <Button
                        {...props}
                        {...triggerProps}
                        type="button"
                        variant="outline"
                        class="w-full justify-between font-normal"
                      >
                        {clienteSeleccionado
                          ? clienteSeleccionado.nombre
                          : "Selecciona un cliente"}
                        <ChevronsUpDown class="opacity-50" />
                      </Button>
                    {/snippet}
                  </Popover.Trigger>
                  <Popover.Content
                    class="w-[22rem] max-w-[calc(100vw-2rem)] p-0"
                    align="start"
                  >
                    <Command.Root>
                      <Command.Input
                        placeholder="Buscar por nombre, email o teléfono..."
                      />
                      <Command.List>
                        <Command.Empty>Sin resultados.</Command.Empty>
                        {#each listaClientes as cliente (cliente.id)}
                          <Command.Item
                            value={`${cliente.nombre} ${cliente.email} ${cliente.telefono}`}
                            onSelect={() => seleccionarCliente(cliente)}
                          >
                            <div class="flex flex-col">
                              <span>{cliente.nombre}</span>
                              <span class="text-xs text-muted-foreground">
                                {cliente.email} · {cliente.telefono}
                              </span>
                            </div>
                          </Command.Item>
                        {/each}
                      </Command.List>
                    </Command.Root>
                  </Popover.Content>
                </Popover.Root>
              {/snippet}
            </Form.Control>
            <Form.FieldErrors />
          </Form.Field>

          {#if clienteSeleccionado}
            <div
              class="mt-4 grid grid-cols-1 gap-3 rounded-md border p-3 sm:grid-cols-3"
            >
              <div>
                <p class="text-xs text-muted-foreground">Email</p>
                <p class="text-sm">{clienteSeleccionado.email || "—"}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Teléfono</p>
                <p class="text-sm">{clienteSeleccionado.telefono || "—"}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">
                  Dirección de entrega
                </p>
                <p class="text-sm">{clienteSeleccionado.direccion || "—"}</p>
              </div>
            </div>
          {/if}
        </div>

        <!-- Artículos -->
        <div class="rounded-lg border bg-card p-6">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h2 class="text-sm font-medium text-muted-foreground">
                Artículos
              </h2>
              <p class="text-xs text-muted-foreground">
                Elige del catálogo; el precio se toma del producto o su
                variante.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onclick={agregarItem}
            >
              <Plus data-icon="inline-start" />
              Agregar
            </Button>
          </div>

          <div class="space-y-3">
            {#each $formData.items as item, i (i)}
              <div class="rounded-md border p-3">
                <div class="grid grid-cols-12 items-end gap-3">
                  <div class="col-span-12 sm:col-span-5">
                    <Select.Root
                      type="single"
                      value={item.productoId ? String(item.productoId) : ""}
                      onValueChange={(valor) => seleccionarProducto(i, valor)}
                    >
                      <Select.Trigger class="w-full">
                        {item.nombre || "Selecciona un producto"}
                      </Select.Trigger>
                      <Select.Content>
                        {#each catalogo as producto (producto.id)}
                          <Select.Item value={String(producto.id)}>
                            {producto.name} · {formatearMonto(producto.price)}
                          </Select.Item>
                        {/each}
                      </Select.Content>
                    </Select.Root>
                  </div>
                  <div class="col-span-6 sm:col-span-2">
                    <label
                      class="text-xs text-muted-foreground"
                      for={`item-cantidad-${i}`}>Cantidad</label
                    >
                    <input
                      id={`item-cantidad-${i}`}
                      type="number"
                      min="1"
                      bind:value={$formData.items[i].cantidad}
                      class="h-9 w-full rounded-md border px-2.5 text-sm"
                    />
                  </div>
                  <div class="col-span-6 sm:col-span-2">
                    <label
                      class="text-xs text-muted-foreground"
                      for={`item-precio-${i}`}>Precio</label
                    >
                    <input
                      id={`item-precio-${i}`}
                      type="number"
                      min="0"
                      bind:value={$formData.items[i].precioUnitario}
                      class="h-9 w-full rounded-md border px-2.5 text-sm"
                    />
                  </div>
                  <div class="col-span-10 sm:col-span-2">
                    <span class="text-xs text-muted-foreground">Subtotal</span>
                    <p
                      class="flex h-9 items-center text-sm font-medium tabular-nums"
                    >
                      {formatearMonto(
                        (Number($formData.items[i].cantidad) || 0) *
                          (Number($formData.items[i].precioUnitario) || 0),
                      )}
                    </p>
                  </div>
                  <div class="col-span-2 sm:col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Eliminar artículo ${i + 1}`}
                      onclick={() => eliminarItem(i)}
                    >
                      <Trash2 class="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {#if variantesDe(item.productoId).length > 0}
                  <div class="mt-3 space-y-1">
                    <label
                      class="text-xs text-muted-foreground"
                      for={`item-variante-${i}`}>Variante</label
                    >
                    <Select.Root
                      type="single"
                      value={item.varianteSku ?? ""}
                      onValueChange={(valor) => seleccionarVariante(i, valor)}
                    >
                      <Select.Trigger class="w-full sm:max-w-xs">
                        {item.varianteSku
                          ? item.varianteSku
                          : "Selecciona una variante"}
                      </Select.Trigger>
                      <Select.Content>
                        {#each variantesDe(item.productoId) as variante (variante.sku)}
                          <Select.Item value={variante.sku}>
                            {etiquetaVariante(variante.opciones)} · {formatearMonto(
                              variante.price,
                            )}
                          </Select.Item>
                        {/each}
                      </Select.Content>
                    </Select.Root>
                  </div>
                {/if}
              </div>
            {/each}

            {#if $formData.items.length === 0}
              <p class="py-6 text-center text-sm text-muted-foreground">
                Sin artículos. Agrega al menos uno para registrar el pedido.
              </p>
            {/if}
          </div>
        </div>

        <!-- Pago -->
        <div class="rounded-lg border bg-card p-6">
          <h2 class="mb-4 text-sm font-medium text-muted-foreground">Pago</h2>
          <div class="space-y-4">
            <Form.Field {form} name="metodoPago">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>Método de pago</Form.Label>
                  <Select.Root
                    type="single"
                    bind:value={$formData.metodoPago}
                    name={props.name}
                  >
                    <Select.Trigger {...props} class="w-full"
                      >{etiquetaMetodo($formData.metodoPago)}</Select.Trigger
                    >
                    <Select.Content>
                      {#each METODOS_PAGO as metodo}
                        <Select.Item value={metodo}
                          >{etiquetaMetodo(metodo)}</Select.Item
                        >
                      {/each}
                    </Select.Content>
                  </Select.Root>
                {/snippet}
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>

            <!-- ID de transacción: aplica a cualquier método de cobro electrónico -->
            <InputFieldV2
              {form}
              name="transaccionId"
              label="ID de transacción / referencia (opcional)"
              placeholder="Ej: TRX-556201 · TRF-8842019 · REC-2201"
              bind:value={$formData.transaccionId}
            />

            {#if $formData.metodoPago === "Tarjeta"}
              <div class="rounded-md border p-3">
                <p class="mb-3 text-xs text-muted-foreground">
                  Por seguridad solo se guardan los
                  <strong>últimos 4 dígitos</strong> y un token de la pasarela: nunca
                  el número completo ni el CVV.
                </p>

                {#if tarjetasDelCliente.length > 0}
                  <div class="space-y-1">
                    <label
                      class="text-sm font-medium leading-none"
                      for="tarjeta-guardada">Tarjeta del cliente</label
                    >
                    <Select.Root
                      type="single"
                      value={$formData.tarjetaId || "nueva"}
                      onValueChange={seleccionarTarjeta}
                    >
                      <Select.Trigger id="tarjeta-guardada" class="w-full">
                        {tarjetaActualTexto ?? "Nueva tarjeta"}
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="nueva">Nueva tarjeta</Select.Item>
                        {#each tarjetasDelCliente as tarjeta (tarjeta.id)}
                          <Select.Item value={tarjeta.id}>
                            {resumenTarjeta(tarjeta)}
                          </Select.Item>
                        {/each}
                      </Select.Content>
                    </Select.Root>
                  </div>
                {/if}

                {#if $errors.tarjetaId}
                  <p class="mt-2 text-xs text-destructive">
                    {$errors.tarjetaId[0]}
                  </p>
                {/if}

                {#if $formData.tarjetaId}
                  <p class="mt-3 text-xs text-muted-foreground">
                    Usando {tarjetaActualTexto}.
                  </p>
                {:else}
                  <div class="mt-3 space-y-3">
                    <Form.Field {form} name="tarjetaMarca">
                      <Form.Control>
                        {#snippet children({ props })}
                          <Form.Label>Marca</Form.Label>
                          <Select.Root
                            type="single"
                            bind:value={$formData.tarjetaMarca}
                            name={props.name}
                          >
                            <Select.Trigger {...props} class="w-full"
                              >{$formData.tarjetaMarca ||
                                "Selecciona la marca"}</Select.Trigger
                            >
                            <Select.Content>
                              {#each MARCAS_TARJETA as marca}
                                <Select.Item value={marca}>{marca}</Select.Item>
                              {/each}
                            </Select.Content>
                          </Select.Root>
                        {/snippet}
                      </Form.Control>
                      <Form.FieldErrors />
                    </Form.Field>

                    <InputFieldV2
                      {form}
                      name="tarjetaTitular"
                      label="Titular"
                      placeholder="Sofía Arango"
                      bind:value={$formData.tarjetaTitular}
                    />

                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <InputFieldV2
                        {form}
                        name="tarjetaVencimiento"
                        label="Vencimiento (MM/AA)"
                        placeholder="08/28"
                        bind:value={$formData.tarjetaVencimiento}
                      />
                      <InputFieldV2
                        {form}
                        name="tarjetaUltimos4"
                        label="Últimos 4 dígitos"
                        placeholder="4412"
                        maxlength={4}
                        bind:value={$formData.tarjetaUltimos4}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onclick={guardarTarjeta}
                    >
                      <Plus data-icon="inline-start" />
                      Guardar tarjeta
                    </Button>
                  </div>
                {/if}
              </div>
            {/if}

            {#if admiteComprobante($formData.metodoPago)}
              <p
                class="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground"
              >
                El comprobante de pago (transferencia, link de pago o billetera
                virtual) se adjunta <strong>después</strong>, desde el detalle
                del pedido, cuando el cliente lo envíe.
              </p>
            {/if}

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputFieldV2
                {form}
                name="envio"
                label="Costo de envío"
                type="number"
                placeholder={String(ENVIO_ESTANDAR)}
                bind:value={$formData.envio}
              />
            </div>

            <Form.Field {form} name="notas">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>Notas (opcional)</Form.Label>
                  <Textarea
                    {...props}
                    rows={3}
                    placeholder="Entregar antes de las 6 p.m."
                    bind:value={$formData.notas}
                  />
                {/snippet}
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>
          </div>
        </div>
      </div>

      <!-- Columna lateral: Origen + Resumen -->
      <div class="lg:col-span-1">
        <div class="sticky top-20 space-y-6">
          <div class="rounded-lg border bg-card p-6">
            <h2 class="mb-4 text-sm font-medium text-muted-foreground">
              Origen
            </h2>
            <div class="space-y-4">
              <Form.Field {form} name="canal">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>Canal</Form.Label>
                    <Select.Root
                      type="single"
                      bind:value={$formData.canal}
                      name={props.name}
                    >
                      <Select.Trigger {...props} class="w-full"
                        >{ETIQUETA_CANAL[$formData.canal]}</Select.Trigger
                      >
                      <Select.Content>
                        {#each CANALES as canal}
                          <Select.Item value={canal}
                            >{ETIQUETA_CANAL[canal]}</Select.Item
                          >
                        {/each}
                      </Select.Content>
                    </Select.Root>
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>

              {#if $formData.canal === "web"}
                <p class="text-xs text-muted-foreground">
                  Pedido creado por el cliente (e-commerce).
                </p>
              {:else}
                <InputFieldV2
                  {form}
                  name="creadoPor"
                  label="Registrado por (opcional)"
                  placeholder="Ana Gómez"
                  bind:value={$formData.creadoPor}
                />
              {/if}
            </div>
          </div>

          <div
            class="rounded-lg border border-primary/20 bg-primary/5 p-6 dark:bg-primary/10"
          >
            <h2 class="mb-4 text-sm font-medium text-foreground">Resumen</h2>
            <div class="space-y-3 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">Subtotal</span>
                <span class="tabular-nums"
                  >{formatearMonto(totales.subtotal)}</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">IVA (19%)</span>
                <span class="tabular-nums"
                  >{formatearMonto(totales.impuesto)}</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">Envío</span>
                <span class="tabular-nums">{formatearMonto(totales.envio)}</span
                >
              </div>
              <div class="border-t pt-3">
                <div
                  class="flex items-center justify-between text-base font-semibold"
                >
                  <span>Total</span>
                  <span class="tabular-nums"
                    >{formatearMonto(totales.total)}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>
</div>

<!-- Barra de acciones fija abajo -->
<div
  class="sticky bottom-0 -mx-4 -mb-4 border-t bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:-mx-6 md:-mb-6 md:px-6 lg:-mx-8 lg:-mb-8 lg:px-8"
>
  <div class="mx-auto flex max-w-5xl items-center justify-end gap-3 py-4">
    <Button
      type="button"
      variant="ghost"
      onclick={() => (dialogJsonAbierto = true)}
    >
      <Braces data-icon="inline-start" />
      Ver JSON
    </Button>
    <Button type="button" variant="outline" href="/pedidos">Cancelar</Button>
    <Button
      type="submit"
      form="form-pedido"
      disabled={$submitting}
      class="bg-primary text-white hover:bg-primary/90"
    >
      {$submitting ? "Guardando..." : textoBoton}
    </Button>
  </div>
</div>

<!-- Alta rápida de cliente (queda en memoria + se selecciona) -->
<Dialog.Root bind:open={dialogNuevoClienteAbierto}>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>Nuevo cliente</Dialog.Title>
      <Dialog.Description>
        Se agregará a la lista y quedará seleccionado en el pedido.
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-3">
      <div class="space-y-1">
        <label class="text-sm font-medium" for="nc-nombre">Nombre *</label>
        <input
          id="nc-nombre"
          bind:value={nuevoCliente.nombre}
          placeholder="Camila Restrepo"
          class="h-9 w-full rounded-md border px-2.5 text-sm"
        />
      </div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="space-y-1">
          <label class="text-sm font-medium" for="nc-email">Email</label>
          <input
            id="nc-email"
            type="email"
            bind:value={nuevoCliente.email}
            placeholder="camila@correo.com"
            class="h-9 w-full rounded-md border px-2.5 text-sm"
          />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium" for="nc-telefono">Teléfono</label>
          <input
            id="nc-telefono"
            bind:value={nuevoCliente.telefono}
            placeholder="+57 300 000 0000"
            class="h-9 w-full rounded-md border px-2.5 text-sm"
          />
        </div>
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium" for="nc-direccion">Dirección</label>
        <input
          id="nc-direccion"
          bind:value={nuevoCliente.direccion}
          placeholder="Cra 43A #18-11, Medellín"
          class="h-9 w-full rounded-md border px-2.5 text-sm"
        />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium" for="nc-ciudad">Ciudad</label>
        <input
          id="nc-ciudad"
          bind:value={nuevoCliente.ciudad}
          placeholder="Medellín"
          class="h-9 w-full rounded-md border px-2.5 text-sm"
        />
      </div>
    </div>

    <Dialog.Footer>
      <Button
        type="button"
        variant="outline"
        onclick={() => (dialogNuevoClienteAbierto = false)}
      >
        Cancelar
      </Button>
      <Button type="button" onclick={crearCliente}>Crear y seleccionar</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- Vista previa del contrato de datos (el JSON que recibe tu backend). -->
<Dialog.Root bind:open={dialogJsonAbierto}>
  <Dialog.Content class="sm:max-w-2xl">
    <Dialog.Header>
      <Dialog.Title>Payload para tu API</Dialog.Title>
      <Dialog.Description>
        JSON que se enviará a tu backend con POST /pedidos.
      </Dialog.Description>
    </Dialog.Header>

    <div class="max-h-[60vh] overflow-auto rounded-md border bg-muted/50 p-4">
      <pre class="text-xs leading-relaxed"><code>{payloadJson}</code></pre>
    </div>

    <Dialog.Footer>
      <Button
        type="button"
        variant="outline"
        onclick={() => (dialogJsonAbierto = false)}
      >
        Cerrar
      </Button>
      <Button type="button" onclick={copiarPayload}>
        <Copy data-icon="inline-start" />
        Copiar JSON
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
