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
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Toaster, toast } from "svelte-sonner";
  import type { SuperValidated, Infer } from "sveltekit-superforms";
  import ImageIcon from "@lucide/svelte/icons/image";
  import X from "@lucide/svelte/icons/x";
  import Tag from "@lucide/svelte/icons/tag";
  import TrendingDown from "@lucide/svelte/icons/trending-down";
  import PackagePlus from "@lucide/svelte/icons/package-plus";
  import ShoppingCart from "@lucide/svelte/icons/shopping-cart";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import type { EventoProducto } from "$lib/types/producto";

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
  });

  const { form: formData, enhance, submitting } = form;

  let inputArchivos: HTMLInputElement | null = $state(null);
  let inputImagenPresentacion: HTMLInputElement | null = $state(null);
  let indicePresentacionActual = $state<number | null>(null);
  const MAX_MB = 2;

  let categorias = $state([
    "gaseosa",
    "agua",
    "cerveza",
    "jugo",
    "energizante",
    "otro",
  ]);
  let dialogNuevaCategoriaAbierto = $state(false);
  let nuevaCategoriaNombre = $state("");
  const envases = ["vidrio", "pet", "lata", "tetrapak"];

  const margen = $derived.by(() => {
    const costo = $formData.costPrice;
    const venta = $formData.price;
    if (!costo || !venta || costo === 0) return 0;
    return (((venta - costo) / costo) * 100).toFixed(1);
  });

  function eliminarPresentacion(index: number) {
    $formData.presentaciones = $formData.presentaciones.filter(
      (_, i) => i !== index,
    );
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
    toast.success("Categoría creada con éxito");
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
        toast.error(`"${archivo.name}" no es una imagen`);
        continue;
      }
      if (archivo.size > MAX_MB * 1024 * 1024) {
        toast.error(`"${archivo.name}" supera los ${MAX_MB} MB`);
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
      toast.error(`" ${archivo.name} " no es una imagen`);
      input.value = "";
      return;
    }
    if (archivo.size > MAX_MB * 1024 * 1024) {
      toast.error(`" ${archivo.name} " supera los ${MAX_MB} MB`);
      input.value = "";
      return;
    }

    $formData.presentaciones[index].imagen = await leerComoDataUrl(archivo);
    input.value = "";
    indicePresentacionActual = null;
  }

  const ICONO_EVENTO = {
    promocion: Tag,
    precio: TrendingDown,
    stock: PackagePlus,
    venta: ShoppingCart,
    creacion: Sparkles,
  } as const;

  function formatearFecha(iso: string): string {
    return new Date(iso).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
</script>

<div class="mx-auto max-w-5xl pb-24">
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

        <!-- Bebida -->
        <div class="rounded-lg border bg-card p-6">
          <h2 class="mb-4 text-sm font-medium text-muted-foreground">
            Detalles de la bebida
          </h2>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <InputFieldV2
                {form}
                name="volumen"
                label="Volumen"
                type="number"
                placeholder="350"
                bind:value={$formData.volumen}
              />

              <Form.Field {form} name="unidadVolumen">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>Unidad</Form.Label>
                    <Select.Root
                      type="single"
                      bind:value={$formData.unidadVolumen}
                      name={props.name}
                    >
                      <Select.Trigger {...props} class="w-full"
                        >{$formData.unidadVolumen}</Select.Trigger
                      >
                      <Select.Content>
                        <Select.Item value="ml">ml</Select.Item>
                        <Select.Item value="l">Litros</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>
            </div>

            <Form.Field {form} name="tipoEnvase">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>Tipo de envase</Form.Label>
                  <Select.Root
                    type="single"
                    bind:value={$formData.tipoEnvase}
                    name={props.name}
                  >
                    <Select.Trigger {...props} class="w-full capitalize">
                      {$formData.tipoEnvase || "Selecciona el envase"}
                    </Select.Trigger>
                    <Select.Content>
                      {#each envases as e}
                        <Select.Item value={e} class="capitalize"
                          >{e}</Select.Item
                        >
                      {/each}
                    </Select.Content>
                  </Select.Root>
                {/snippet}
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>

            <div class="grid grid-cols-2 gap-4">
              <InputFieldV2
                {form}
                name="gradosAlcohol"
                label="Grados de alcohol (%)"
                type="number"
                step="0.1"
                placeholder="0"
                bind:value={$formData.gradosAlcohol}
              />
              <InputFieldV2
                {form}
                name="diasVidaUtil"
                label="Días de vida útil"
                type="number"
                placeholder="180"
                bind:value={$formData.diasVidaUtil}
              />
            </div>

            <div
              class="flex items-center justify-between rounded-md border p-3"
            >
              <div>
                <p class="text-sm font-medium">Retornable</p>
                <p class="text-xs text-muted-foreground">
                  El envase se devuelve y cobra depósito
                </p>
              </div>
              <Switch bind:checked={$formData.retornable} />
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
              <InputFieldV2
                {form}
                name="price"
                label="Precio de venta (unidad)"
                type="number"
                step="0.01"
                placeholder="3500"
                bind:value={$formData.price}
              />
            </div>

            {#if $formData.costPrice > 0 && $formData.price > 0}
              <p class="text-sm text-muted-foreground">
                Margen de ganancia: <span class="font-medium text-foreground"
                  >{margen}%</span
                >
              </p>
            {/if}

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
              <InputFieldV2
                {form}
                name="stock"
                label="Stock (unidades individuales)"
                type="number"
                placeholder="480"
                bind:value={$formData.stock}
              />
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
      </div>

      <!-- Columna lateral: Categoría + Estado, sticky -->
      <div class="lg:col-span-1">
        <div class="sticky top-20 space-y-6">
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
                    <li class="flex gap-3">
                      <div
                        class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted"
                      >
                        <!-- svelte-ignore svelte_component_deprecated -->
                        <svelte:component
                          this={ICONO_EVENTO[evento.tipo]}
                          class="h-4 w-4 text-muted-foreground"
                        />
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
                        {#if evento.enlace}
                          <a
                            href={evento.enlace}
                            class="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            Ver detalle
                            <ArrowRight class="h-3 w-3" />
                          </a>
                        {/if}
                      </div>
                    </li>
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

<Toaster
  richColors
  style="
    --success-bg: #1a7f1a; 
    --success-text: #fff; 
    --success-border: #1a7f1a;
  "
/>
