<script lang="ts">
  import { superForm } from "sveltekit-superforms";
  import { zod4Client } from "sveltekit-superforms/adapters";
  import InputFieldV2 from "$lib/components/InputsFormCustom/InputFieldV2.svelte";
  import * as Form from "$lib/components/ui/form/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import Plus from "@lucide/svelte/icons/plus";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import { productoSchema, type ProductoSchema } from "../schemas/schema";
  import { CATEGORIAS } from "$lib/config/categorias";
  import EventoItem from "../detail/evento-item.svelte";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import {
    notificarExito,
    notificarError,
    notificarAviso,
    notificarInfo,
  } from "$lib/utils/notify";
  import type { SuperValidated, Infer } from "sveltekit-superforms";
  import ImageIcon from "@lucide/svelte/icons/image";
  import X from "@lucide/svelte/icons/x";
  import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
  import Gauge from "@lucide/svelte/icons/gauge";
  import type { EventoProducto } from "$lib/types/producto";
  import {
    calcularMargen,
    esMargenNegativo,
    calcularValorInventario,
    calcularPrecioConIva,
    formatearMoneda,
    etiquetaVariante,
  } from "$lib/utils/producto";

  let {
    form: formProp,
    titulo,
    descripcion,
    textoBoton,
    historial,
    enlaceHistorial,
    modo = "crear",
  }: {
    form: SuperValidated<Infer<ProductoSchema>>;
    titulo: string;
    descripcion: string;
    textoBoton: string;
    historial?: EventoProducto[];
    enlaceHistorial?: string;
    /** "crear" = alta (todo editable) · "editar" = bloquea campos de identidad */
    modo?: "crear" | "editar";
  } = $props();

  // En edición se bloquean los campos que definen la identidad del producto.
  const esEdicion = $derived(modo === "editar");

  // svelte-ignore state_referenced_locally: falso positivo conocido de Superforms
  const form = superForm(formProp, {
    validators: zod4Client(productoSchema),
    // Requerido para datos anidados: `presentaciones` y `atributos`
    // son arrays de objetos. Interactúa con use:enhance del <form>.
    dataType: "json",
  });

  const { form: formData, enhance, submitting } = form;

  let inputArchivos: HTMLInputElement | null = $state(null);
  let inputImagenPresentacion: HTMLInputElement | null = $state(null);
  let indicePresentacionActual = $state<number | null>(null);
  const MAX_MB = 2;

  let categorias = $state<string[]>([...CATEGORIAS]);
  let dialogNuevaCategoriaAbierto = $state(false);
  let nuevaCategoriaNombre = $state("");

  // ============ KPIs derivados del producto (solo lectura) ============
  const margen = $derived(calcularMargen($formData.costPrice, $formData.price));
  const margenNegativo = $derived(
    esMargenNegativo($formData.costPrice, $formData.price),
  );
  const valorInventario = $derived(
    calcularValorInventario($formData.stock, $formData.costPrice),
  );
  const precioConIva = $derived(
    calcularPrecioConIva($formData.price, $formData.taxRate),
  );

  // ============ Variantes (si existen, el precio y el stock se derivan) ============
  const hayVariantes = $derived($formData.variantes.length > 0);
  const precioMin = $derived(
    $formData.variantes.length
      ? Math.min(...$formData.variantes.map((v) => v.price))
      : 0,
  );
  const precioMax = $derived(
    $formData.variantes.length
      ? Math.max(...$formData.variantes.map((v) => v.price))
      : 0,
  );
  const stockSuma = $derived(
    $formData.variantes.reduce((acc, v) => acc + v.stock, 0),
  );

  // Mantiene `price` y `stock` del producto en sincronía con sus variantes.
  $effect(() => {
    if (hayVariantes) {
      $formData.price = precioMin;
      $formData.stock = stockSuma;
    }
  });

  function eliminarPresentacion(index: number) {
    $formData.presentaciones = $formData.presentaciones.filter(
      (_, i) => i !== index,
    );
  }

  function agregarAtributo() {
    $formData.atributos = [...$formData.atributos, { nombre: "", valor: "" }];
  }

  function eliminarAtributo(index: number) {
    $formData.atributos = $formData.atributos.filter((_, i) => i !== index);
  }

  // ============ Variantes ============
  function agregarOpcion() {
    $formData.opciones = [...$formData.opciones, { nombre: "", valores: [] }];
  }

  function eliminarOpcion(index: number) {
    $formData.opciones = $formData.opciones.filter((_, i) => i !== index);
  }

  function setValoresOpcion(index: number, texto: string) {
    $formData.opciones[index].valores = texto
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  function claveOpciones(opciones: Record<string, string>): string {
    return Object.keys(opciones)
      .sort()
      .map((k) => `${k}:${opciones[k]}`)
      .join("|");
  }

  function generarVariantes() {
    // Se ignoran las filas vacías y se FUSIONAN las que repiten nombre: así
    // funciona tanto "Talla: S, M" como dos filas "Talla" con "S" y "M".
    const fusionadas: { nombre: string; valores: string[] }[] = [];
    let huboFusion = false;
    for (const op of $formData.opciones) {
      const nombre = op.nombre.trim();
      const valores = [
        ...new Set(op.valores.map((v) => v.trim()).filter(Boolean)),
      ];
      if (!nombre || valores.length === 0) continue;

      const existente = fusionadas.find(
        (f) => f.nombre.toLowerCase() === nombre.toLowerCase(),
      );
      if (existente) {
        existente.valores = [...new Set([...existente.valores, ...valores])];
        huboFusion = true;
      } else {
        fusionadas.push({ nombre, valores });
      }
    }

    if (fusionadas.length === 0) {
      notificarAviso(
        "Define al menos una opción",
        "Cada opción necesita un nombre y valores (ej. Talla → S, M).",
      );
      return;
    }

    // Refleja la fusión en el formulario (una fila por opción)
    $formData.opciones = fusionadas;

    if (huboFusion) {
      notificarInfo(
        "Opciones fusionadas",
        "Había opciones con el mismo nombre; se unieron sus valores.",
      );
    }

    // Producto cartesiano de las opciones
    const combinaciones = fusionadas.reduce<Record<string, string>[]>(
      (acc, op) =>
        acc.flatMap((combo) =>
          op.valores.map((valor) => ({ ...combo, [op.nombre]: valor })),
        ),
      [{}],
    );

    // Conserva los datos ya cargados de las combinaciones existentes
    const existentes = new Map(
      $formData.variantes.map((v) => [claveOpciones(v.opciones), v]),
    );
    $formData.variantes = combinaciones.map((opciones) => {
      const previo = existentes.get(claveOpciones(opciones));
      return (
        previo ?? { sku: "", opciones, price: $formData.price || 0, stock: 0 }
      );
    });
  }

  function eliminarVariante(index: number) {
    $formData.variantes = $formData.variantes.filter((_, i) => i !== index);
  }

  function crearCategoria() {
    if (!nuevaCategoriaNombre.trim()) return;
    const valor = nuevaCategoriaNombre.trim().toLowerCase();
    if (!categorias.includes(valor)) {
      categorias = [...categorias, valor];
    }
    $formData.category = valor;
    nuevaCategoriaNombre = "";
    dialogNuevaCategoriaAbierto = false;
    notificarExito(
      "Categoría creada",
      `La categoría "${valor}" se creó correctamente.`,
    );
    // TODO: llamar a tu products-ms para guardar la categoría permanentemente
  }

  function abrirSelectorArchivos() {
    inputArchivos?.click();
  }

  async function manejarArchivos(evento: Event) {
    const input = evento.currentTarget as HTMLInputElement;
    const archivos = Array.from(input.files ?? []);

    for (const archivo of archivos) {
      if (!archivo.type.startsWith("image/")) {
        notificarError(
          "Archivo no válido",
          `"${archivo.name}" no es una imagen.`,
        );
        continue;
      }
      if (archivo.size > MAX_MB * 1024 * 1024) {
        notificarError(
          "Archivo demasiado grande",
          `"${archivo.name}" supera los ${MAX_MB} MB.`,
        );
        continue;
      }
      const dataUrl = await leerComoDataUrl(archivo);
      $formData.imagenes = [...$formData.imagenes, dataUrl];
    }

    input.value = ""; // permite volver a elegir el mismo archivo
  }

  function agregarPresentacion() {
    $formData.presentaciones = [
      ...$formData.presentaciones,
      {
        nombre: "",
        sku: "",
        codigoBarras: "",
        unidadesPorPaquete: 2,
        price: 0,
        imagen: "",
      },
    ];
  }
  // TODO: cuando exista tu endpoint de subida, reemplaza esto por el upload
  // y guarda la URL devuelta en lugar del base64.
  function leerComoDataUrl(archivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve(lector.result as string);
      lector.onerror = () => reject(lector.error);
      lector.readAsDataURL(archivo);
    });
  }

  function eliminarImagen(index: number) {
    $formData.imagenes = $formData.imagenes.filter((_, i) => i !== index);
  }

  function abrirSelectorImagenPresentacion(index: number) {
    indicePresentacionActual = index;
    inputImagenPresentacion?.click();
  }

  async function manejarImagenPresentacion(evento: Event) {
    const input = evento.currentTarget as HTMLInputElement;
    const archivo = input.files?.[0];
    const index = indicePresentacionActual;
    if (!archivo || index === null) {
      input.value = "";
      return;
    }
    if (!archivo.type.startsWith("image/")) {
      notificarError(
        "Archivo no válido",
        `" ${archivo.name} " no es una imagen.`,
      );
      input.value = "";
      return;
    }
    if (archivo.size > MAX_MB * 1024 * 1024) {
      notificarError(
        "Archivo demasiado grande",
        `" ${archivo.name} " supera los ${MAX_MB} MB.`,
      );
      input.value = "";
      return;
    }

    $formData.presentaciones[index].imagen = await leerComoDataUrl(archivo);
    input.value = "";
    indicePresentacionActual = null;
  }
</script>

<svelte:head>
  <title>{titulo} · Mis Ventas</title>
</svelte:head>

<div class="animate-fade-up mx-auto max-w-5xl pb-24">
  <a
    href="/productos"
    class="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-5"
  >
    <ArrowLeft class="h-4 w-4" />
    Volver a productos
  </a>

  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-semibold">{titulo}</h1>
      <p class="text-sm text-muted-foreground">
        {descripcion}
      </p>
    </div>
    <div class="hidden items-center gap-3 sm:flex">
      <Button type="button" variant="outline" href="/productos">Cancelar</Button
      >
      <Button
        type="submit"
        form="form-producto"
        disabled={$submitting}
        class="bg-primary text-white hover:bg-primary/90"
      >
        {$submitting ? "Guardando..." : textoBoton}
      </Button>
    </div>
  </div>

  <form id="form-producto" method="POST" use:enhance class="space-y-6">
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Columna principal -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Imágenes (opcional) -->
        <div class="rounded-lg border bg-card p-6">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h2 class="text-sm font-medium text-muted-foreground">
                Imágenes
                <span class="font-normal text-muted-foreground/70"
                  >(opcional)</span
                >
              </h2>
              <p class="text-xs text-muted-foreground">
                Puedes agregarlas ahora o más tarde. La primera será la
                principal.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onclick={abrirSelectorArchivos}
            >
              <Plus class="mr-2 h-4 w-4" />
              Agregar
            </Button>
          </div>

          <!-- Input de archivos oculto: lo dispara el botón "Agregar" -->
          <input
            bind:this={inputArchivos}
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            onchange={manejarArchivos}
          />

          {#if $formData.imagenes.length > 0}
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {#each $formData.imagenes as url, i}
                <div
                  class="group relative aspect-square overflow-hidden rounded-md border bg-muted"
                >
                  <img
                    src={url}
                    alt={`Imagen ${i + 1} del producto`}
                    class="h-full w-full object-cover"
                  />
                  {#if i === 0}
                    <span
                      class="absolute left-1.5 top-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-white"
                    >
                      Principal
                    </span>
                  {/if}
                  <button
                    type="button"
                    aria-label={`Eliminar imagen ${i + 1}`}
                    onclick={() => eliminarImagen(i)}
                    class="absolute right-1.5 top-1.5 rounded-md bg-background/90 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 class="h-3.5 w-3.5 text-destructive" />
                  </button>
                </div>
              {/each}
            </div>
          {:else}
            <p class="py-6 text-center text-sm text-muted-foreground">
              Sin imágenes. Puedes crear el producto igual y agregarlas después.
            </p>
          {/if}
        </div>
        <!-- General -->
        <div class="rounded-lg border bg-card p-6">
          <h2 class="mb-4 text-sm font-medium text-muted-foreground">
            Información general
          </h2>
          <div class="space-y-4">
            <InputFieldV2
              {form}
              name="name"
              label="Nombre del producto"
              placeholder="Coca-Cola"
              bind:value={$formData.name}
            />

            <Form.Field {form} name="description">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>Descripción</Form.Label>
                  <Textarea
                    {...props}
                    rows={3}
                    placeholder="Describe el producto brevemente"
                    bind:value={$formData.description}
                  />
                {/snippet}
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>

            <InputFieldV2
              {form}
              name="brand"
              label="Marca"
              placeholder="Coca-Cola Company"
              bind:value={$formData.brand}
            />

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputFieldV2
                {form}
                name="sku"
                label="SKU"
                placeholder="COCA-350"
                readonly={esEdicion}
                inputClass={esEdicion
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : ""}
                bind:value={$formData.sku}
              />

              <InputFieldV2
                {form}
                name="codigoBarras"
                label="Código de barras"
                placeholder="7701234567890"
                readonly={esEdicion}
                inputClass={esEdicion
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : ""}
                bind:value={$formData.codigoBarras}
              />
            </div>
          </div>
        </div>

        <!-- Especificaciones (atributos genéricos, adaptables a cualquier rubro) -->
        <div class="rounded-lg border bg-card p-6">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h2 class="text-sm font-medium text-muted-foreground">
                Especificaciones
              </h2>
              <p class="text-xs text-muted-foreground">
                Agrega las que necesites: talla, color, peso, volumen, envase…
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onclick={agregarAtributo}
            >
              <Plus class="mr-2 h-4 w-4" />
              Agregar
            </Button>
          </div>

          <div class="space-y-4">
            <InputFieldV2
              {form}
              name="diasVidaUtil"
              label="Vida útil (días)"
              type="number"
              placeholder="180"
              bind:value={$formData.diasVidaUtil}
            />

            <div class="space-y-3">
              {#each $formData.atributos as _, i}
                <div class="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
                  <div class="space-y-1">
                    <label
                      class="text-xs text-muted-foreground"
                      for={`attr-nombre-${i}`}>Nombre</label
                    >
                    <input
                      id={`attr-nombre-${i}`}
                      bind:value={$formData.atributos[i].nombre}
                      placeholder="Volumen"
                      class="h-9 w-full rounded-md border px-2.5 text-sm"
                    />
                  </div>
                  <div class="space-y-1">
                    <label
                      class="text-xs text-muted-foreground"
                      for={`attr-valor-${i}`}>Valor</label
                    >
                    <input
                      id={`attr-valor-${i}`}
                      bind:value={$formData.atributos[i].valor}
                      placeholder="350 ml"
                      class="h-9 w-full rounded-md border px-2.5 text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Eliminar especificación ${i + 1}`}
                    onclick={() => eliminarAtributo(i)}
                  >
                    <Trash2 class="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              {/each}

              {#if $formData.atributos.length === 0}
                <p class="py-6 text-center text-sm text-muted-foreground">
                  Sin especificaciones. Agrega las que necesites.
                </p>
              {/if}
            </div>
          </div>
        </div>

        <!-- Costo e inventario -->
        <div class="rounded-lg border bg-card p-6">
          <h2 class="mb-4 text-sm font-medium text-muted-foreground">
            Costo e inventario
          </h2>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <InputFieldV2
                {form}
                name="costPrice"
                label="Precio de costo"
                type="number"
                step="0.01"
                placeholder="2500"
                bind:value={$formData.costPrice}
              />
              {#if hayVariantes}
                <div class="space-y-1">
                  <p class="text-sm font-medium leading-none">
                    Precio de venta (desde variantes)
                  </p>
                  <p
                    class="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground"
                  >
                    {formatearMoneda(precioMin, $formData.currency)} – {formatearMoneda(
                      precioMax,
                      $formData.currency,
                    )}
                  </p>
                </div>
              {:else}
                <InputFieldV2
                  {form}
                  name="price"
                  label="Precio de venta (unidad)"
                  type="number"
                  step="0.01"
                  placeholder="3500"
                  bind:value={$formData.price}
                />
              {/if}
            </div>

            <div class="grid grid-cols-2 gap-4">
              <Form.Field {form} name="currency">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>Moneda</Form.Label>
                    <Select.Root
                      type="single"
                      bind:value={$formData.currency}
                      name={props.name}
                    >
                      <Select.Trigger {...props} class="w-full"
                        >{$formData.currency}</Select.Trigger
                      >
                      <Select.Content>
                        <Select.Item value="COP">COP</Select.Item>
                        <Select.Item value="USD">USD</Select.Item>
                        <Select.Item value="MXN">MXN</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>

              <Form.Field {form} name="taxRate">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>IVA</Form.Label>
                    <Select.Root
                      type="single"
                      bind:value={$formData.taxRate}
                      name={props.name}
                    >
                      <Select.Trigger {...props} class="w-full"
                        >{$formData.taxRate}%</Select.Trigger
                      >
                      <Select.Content>
                        <Select.Item value="0">0%</Select.Item>
                        <Select.Item value="5">5%</Select.Item>
                        <Select.Item value="19">19%</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>
            </div>

            <div class="grid grid-cols-2 gap-4">
              {#if hayVariantes}
                <div class="space-y-1">
                  <p class="text-sm font-medium leading-none">
                    Stock (suma de variantes)
                  </p>
                  <p
                    class="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground"
                  >
                    {stockSuma.toLocaleString("es-CO")}
                  </p>
                </div>
              {:else}
                <InputFieldV2
                  {form}
                  name="stock"
                  label="Stock (unidades individuales)"
                  type="number"
                  placeholder="480"
                  bind:value={$formData.stock}
                />
              {/if}
              <InputFieldV2
                {form}
                name="minStock"
                label="Stock mínimo"
                type="number"
                placeholder="20"
                bind:value={$formData.minStock}
              />
            </div>

            <InputFieldV2
              {form}
              name="location"
              label="Ubicación en almacén"
              placeholder="Pasillo 4, Estante B"
              bind:value={$formData.location}
            />
          </div>
        </div>

        <!-- Presentaciones -->
        <div class="rounded-lg border bg-card p-6">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h2 class="text-sm font-medium text-muted-foreground">
                Formas de venta adicionales
              </h2>
              <p class="text-xs text-muted-foreground">
                El stock se descuenta siempre de las unidades individuales
              </p>
            </div>

            <input
              bind:this={inputImagenPresentacion}
              type="file"
              accept="image/*"
              class="hidden"
              onchange={manejarImagenPresentacion}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onclick={agregarPresentacion}
            >
              <Plus class="mr-2 h-4 w-4" />
              Agregar
            </Button>
          </div>

          <div class="space-y-3">
            {#each $formData.presentaciones as _, i}
              <div
                class="grid grid-cols-[auto_1fr_1fr_1fr_1fr_auto] items-end gap-3 rounded-md border p-3"
              >
                <!-- Imagen (opcional, 1 sola) -->
                <div class="space-y-1">
                  <span class="text-xs text-muted-foreground">Imagen</span>
                  <div class="relative h-9 w-9">
                    <button
                      type="button"
                      onclick={() => abrirSelectorImagenPresentacion(i)}
                      aria-label={`Imagen de la presentación ${i + 1}`}
                      class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border bg-muted hover:border-primary"
                    >
                      {#if $formData.presentaciones[i].imagen}
                        <img
                          src={$formData.presentaciones[i].imagen}
                          alt=""
                          class="h-full w-full object-cover"
                        />
                      {:else}
                        <ImageIcon class="h-4 w-4 text-muted-foreground" />
                      {/if}
                    </button>
                    {#if $formData.presentaciones[i].imagen}
                      <button
                        type="button"
                        aria-label={`Quitar imagen de la presentación ${i + 1}`}
                        onclick={() =>
                          ($formData.presentaciones[i].imagen = "")}
                        class="absolute -right-1.5 -top-1.5 rounded-full border bg-background p-0.5"
                      >
                        <X class="h-3 w-3 text-destructive" />
                      </button>
                    {/if}
                  </div>
                </div>

                <div class="space-y-1">
                  <label
                    class="text-xs text-muted-foreground"
                    for={`pres-nombre-${i}`}>Nombre</label
                  >
                  <input
                    id={`pres-nombre-${i}`}
                    bind:value={$formData.presentaciones[i].nombre}
                    placeholder="Six-pack"
                    class="h-9 w-full rounded-md border px-2.5 text-sm"
                  />
                </div>
                <div class="space-y-1">
                  <label
                    class="text-xs text-muted-foreground"
                    for={`pres-sku-${i}`}>SKU</label
                  >
                  <input
                    id={`pres-sku-${i}`}
                    bind:value={$formData.presentaciones[i].sku}
                    placeholder="COCA-350-6P"
                    class="h-9 w-full rounded-md border px-2.5 text-sm"
                  />
                </div>
                <div class="space-y-1">
                  <label
                    class="text-xs text-muted-foreground"
                    for={`pres-unidades-${i}`}>Unidades</label
                  >
                  <input
                    id={`pres-unidades-${i}`}
                    type="number"
                    bind:value={$formData.presentaciones[i].unidadesPorPaquete}
                    placeholder="6"
                    class="h-9 w-full rounded-md border px-2.5 text-sm"
                  />
                </div>
                <div class="space-y-1">
                  <label
                    class="text-xs text-muted-foreground"
                    for={`pres-precio-${i}`}>Precio</label
                  >
                  <input
                    id={`pres-precio-${i}`}
                    type="number"
                    bind:value={$formData.presentaciones[i].price}
                    placeholder="19000"
                    class="h-9 w-full rounded-md border px-2.5 text-sm"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onclick={() => eliminarPresentacion(i)}
                >
                  <Trash2 class="h-4 w-4 text-destructive" />
                </Button>
              </div>
            {/each}

            {#if $formData.presentaciones.length === 0}
              <p class="py-6 text-center text-sm text-muted-foreground">
                Este producto solo se vende por unidad. Agrega una presentación
                si también se vende en paquetes.
              </p>
            {/if}
          </div>
        </div>

        <!-- Variantes (opciones con stock/precio propios) -->
        <div class="rounded-lg border bg-card p-6">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h2 class="text-sm font-medium text-muted-foreground">
                Variantes
              </h2>
              <p class="text-xs text-muted-foreground">
                Opcional. Úsalo cuando cada combinación (talla, color…) tenga
                stock y precio propios.
              </p>
            </div>
            <div class="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onclick={agregarOpcion}
              >
                <Plus class="mr-2 h-4 w-4" />
                Opción
              </Button>
              <Button type="button" size="sm" onclick={generarVariantes}>
                Generar
              </Button>
            </div>
          </div>

          {#if $formData.opciones.length === 0}
            <p class="py-6 text-center text-sm text-muted-foreground">
              Sin opciones. Agrega una fila por opción (ej. Talla) con sus
              valores separados por coma (S, M, L) y pulsa "Generar".
            </p>
          {:else}
            <div class="space-y-3">
              {#each $formData.opciones as _, i}
                <div class="grid grid-cols-[1fr_2fr_auto] items-end gap-3">
                  <div class="space-y-1">
                    <label
                      class="text-xs text-muted-foreground"
                      for={`op-nombre-${i}`}>Opción</label
                    >
                    <input
                      id={`op-nombre-${i}`}
                      bind:value={$formData.opciones[i].nombre}
                      placeholder="Talla"
                      class="h-9 w-full rounded-md border px-2.5 text-sm"
                    />
                  </div>
                  <div class="space-y-1">
                    <label
                      class="text-xs text-muted-foreground"
                      for={`op-valores-${i}`}
                      >Valores (separados por coma)</label
                    >
                    <input
                      id={`op-valores-${i}`}
                      value={$formData.opciones[i].valores.join(", ")}
                      oninput={(e) =>
                        setValoresOpcion(i, e.currentTarget.value)}
                      placeholder="S, M, L"
                      class="h-9 w-full rounded-md border px-2.5 text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Eliminar opción ${i + 1}`}
                    onclick={() => eliminarOpcion(i)}
                  >
                    <Trash2 class="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              {/each}
            </div>
          {/if}

          {#if $formData.variantes.length > 0}
            <p class="mt-4 text-xs text-muted-foreground">
              Cada fila es una combinación única; define su SKU, precio y stock.
            </p>
            <div class="mt-2 overflow-x-auto rounded-md border">
              <table class="w-full text-sm">
                <thead class="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th class="px-3 py-2 text-left font-medium">Variante</th>
                    <th class="px-3 py-2 text-left font-medium">SKU</th>
                    <th class="px-3 py-2 text-left font-medium">Precio</th>
                    <th class="px-3 py-2 text-left font-medium">Stock</th>
                    <th class="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {#each $formData.variantes as _, i}
                    <tr class="border-t">
                      <td class="px-3 py-2 font-medium">
                        {etiquetaVariante($formData.variantes[i].opciones) ||
                          "—"}
                      </td>
                      <td class="px-3 py-2">
                        <input
                          bind:value={$formData.variantes[i].sku}
                          placeholder="CAM-M-NEG"
                          class="h-8 w-full min-w-28 rounded-md border px-2 text-sm"
                        />
                      </td>
                      <td class="px-3 py-2">
                        <input
                          type="number"
                          bind:value={$formData.variantes[i].price}
                          class="h-8 w-24 rounded-md border px-2 text-sm"
                        />
                      </td>
                      <td class="px-3 py-2">
                        <input
                          type="number"
                          bind:value={$formData.variantes[i].stock}
                          class="h-8 w-20 rounded-md border px-2 text-sm"
                        />
                      </td>
                      <td class="px-3 py-2 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Eliminar variante ${i + 1}`}
                          onclick={() => eliminarVariante(i)}
                        >
                          <Trash2 class="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
            <p class="mt-2 text-xs text-muted-foreground">
              Con variantes, el <strong>precio (desde)</strong> y el
              <strong>stock</strong> del producto se calculan automáticamente.
            </p>
          {/if}
        </div>
      </div>

      <!-- Columna lateral: Categoría + Estado, sticky -->
      <div class="lg:col-span-1">
        <div class="sticky top-20 space-y-6">
          {#if esEdicion}
            <!-- Resumen / KPIs del producto (solo lectura) -->
            <div
              class="rounded-lg border border-primary/20 bg-primary/5 p-6 dark:bg-primary/10"
            >
              <h2
                class="mb-4 flex items-center gap-2 text-sm font-medium text-foreground"
              >
                <Gauge class="h-4 w-4 text-primary" />
                Resumen
              </h2>

              <div class="space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground">Precio con IVA</span>
                  <span class="text-base font-semibold text-foreground">
                    {formatearMoneda(precioConIva, $formData.currency)}
                  </span>
                </div>

                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground">Margen</span>
                  <span
                    class={margenNegativo
                      ? "text-base font-semibold text-destructive"
                      : "text-base font-semibold text-green-600 dark:text-green-500"}
                  >
                    {margen}%
                  </span>
                </div>

                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground">Valor del inventario</span
                  >
                  <span class="text-base font-semibold text-foreground">
                    {formatearMoneda(valorInventario, $formData.currency)}
                  </span>
                </div>
              </div>

              {#if margenNegativo}
                <div
                  class="mt-4 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3"
                >
                  <TriangleAlert
                    class="mt-0.5 h-4 w-4 shrink-0 text-destructive"
                  />
                  <p class="text-xs text-destructive">
                    Estás vendiendo <strong>por debajo del costo</strong>.
                    Revisa el precio de venta.
                  </p>
                </div>
              {/if}
            </div>
          {/if}

          <div class="rounded-lg border bg-card p-6">
            <h2 class="mb-4 text-sm font-medium text-muted-foreground">
              Organización
            </h2>
            <div class="space-y-4">
              <Form.Field {form} name="category">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>Categoría</Form.Label>
                    <Select.Root
                      type="single"
                      bind:value={$formData.category}
                      name={props.name}
                    >
                      <Select.Trigger {...props} class="w-full capitalize">
                        {$formData.category || "Selecciona una categoría"}
                      </Select.Trigger>
                      <Select.Content>
                        {#each categorias as cat}
                          <Select.Item value={cat} class="capitalize"
                            >{cat}</Select.Item
                          >
                        {/each}
                        <div class="mt-1 border-t pt-1">
                          <button
                            type="button"
                            class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-primary hover:bg-muted"
                            onclick={() => (dialogNuevaCategoriaAbierto = true)}
                          >
                            <Plus class="h-3.5 w-3.5" />
                            Crear nueva categoría
                          </button>
                        </div>
                      </Select.Content>
                    </Select.Root>
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>

              <Form.Field {form} name="status">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>Estado</Form.Label>
                    <Select.Root
                      type="single"
                      bind:value={$formData.status}
                      name={props.name}
                    >
                      <Select.Trigger {...props} class="w-full capitalize"
                        >{$formData.status}</Select.Trigger
                      >
                      <Select.Content>
                        <Select.Item value="activo">Activo</Select.Item>
                        <Select.Item value="inactivo">Inactivo</Select.Item>
                        <Select.Item value="borrador">Borrador</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>

              <div
                class="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <p class="text-sm font-medium">Destacado</p>
                  <p class="text-xs text-muted-foreground">Mostrar en inicio</p>
                </div>
                <Switch bind:checked={$formData.featured} />
              </div>
            </div>
          </div>

          <!-- Información relacionada (solo lectura; solo se muestra en edición) -->
          {#if historial}
            <div class="rounded-lg border bg-card p-6">
              <h2 class="mb-4 text-sm font-medium text-muted-foreground">
                Información relacionada
              </h2>

              {#if historial.length === 0}
                <p class="text-sm text-muted-foreground">
                  Sin eventos registrados para este producto.
                </p>
              {:else}
                <ul class="space-y-4">
                  {#each historial as evento (evento.id)}
                    <EventoItem {evento} />
                  {/each}
                </ul>
              {/if}

              {#if enlaceHistorial}
                <Button
                  variant="outline"
                  size="sm"
                  class="mt-4 w-full"
                  href={enlaceHistorial}
                >
                  Ver historial completo
                </Button>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>

    <div class="flex items-center justify-end gap-3 border-t pt-6 sm:hidden">
      <Button type="button" variant="outline" href="/productos">Cancelar</Button
      >
      <Button
        type="submit"
        disabled={$submitting}
        class="bg-primary text-white hover:bg-primary/90"
      >
        {$submitting ? "Guardando..." : textoBoton}
      </Button>
    </div>
  </form>
</div>

<!-- Barra de acciones fija abajo -->
<div
  class="sticky bottom-0 -mx-4 -mb-4 border-t bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:-mx-6 md:-mb-6 md:px-6 lg:-mx-8 lg:-mb-8 lg:px-8"
>
  <div class="mx-auto flex max-w-5xl items-center justify-end gap-3 py-4">
    <Button type="button" variant="outline" href="/productos">Cancelar</Button>
    <Button
      type="submit"
      form="form-producto"
      disabled={$submitting}
      class="bg-primary text-white hover:bg-primary/90"
    >
      {$submitting ? "Guardando..." : textoBoton}
    </Button>
  </div>
</div>

<Dialog.Root bind:open={dialogNuevaCategoriaAbierto}>
  <Dialog.Content class="sm:max-w-sm">
    <Dialog.Header>
      <Dialog.Title>Nueva categoría</Dialog.Title>
      <Dialog.Description
        >Se agregará a la lista y quedará seleccionada.</Dialog.Description
      >
    </Dialog.Header>

    <div class="space-y-2">
      <label class="text-sm font-medium" for="nueva-categoria-input"
        >Nombre</label
      >
      <input
        id="nueva-categoria-input"
        bind:value={nuevaCategoriaNombre}
        placeholder="Ej: Lácteos"
        class="h-9 w-full rounded-md border px-2.5 text-sm"
        onkeydown={(e) => e.key === "Enter" && crearCategoria()}
      />
    </div>

    <Dialog.Footer>
      <Button
        type="button"
        variant="outline"
        onclick={() => (dialogNuevaCategoriaAbierto = false)}
      >
        Cancelar
      </Button>
      <Button type="button" onclick={crearCategoria}>Crear y seleccionar</Button
      >
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
