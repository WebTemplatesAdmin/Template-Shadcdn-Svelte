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
  import { productoSchema } from "./schemas/schema.ts";
  import type { PageData } from "./$types";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Toaster, toast } from 'svelte-sonner'

  let { data }: { data: PageData } = $props();

  // svelte-ignore state_referenced_locally: falso positivo conocido de Superforms
  const form = superForm(data.form, {
    validators: zod4Client(productoSchema),
  });

  const { form: formData, enhance, submitting } = form;

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

  function agregarPresentacion() {
    $formData.presentaciones = [
      ...$formData.presentaciones,
      {
        nombre: "",
        sku: "",
        codigoBarras: "",
        unidadesPorPaquete: 2,
        price: 0,
      },
    ];
  }

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
    $formData.category = valor; // la selecciona automáticamente
    nuevaCategoriaNombre = "";
    dialogNuevaCategoriaAbierto = false;
    toast.success("Categoría creada con éxito");
    // TODO: llamar a tu products-ms para guardar la categoría permanentemente
  }
</script>

<div class="mx-auto max-w-5xl pb-24">
  <a
    href="/productos"
    class="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
  >
    <ArrowLeft class="h-4 w-4" />
    Volver a productos
  </a>

  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-semibold">Nuevo producto</h1>
      <p class="text-sm text-muted-foreground">
        Completa los datos para agregarlo a tu catálogo
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
        {$submitting ? "Guardando..." : "Guardar producto"}
      </Button>
    </div>
  </div>

  <form id="form-producto" method="POST" use:enhance class="space-y-6">
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Columna principal -->
      <div class="space-y-6 lg:col-span-2">
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
                class="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-end gap-3 rounded-md border p-3"
              >
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
        {$submitting ? "Guardando..." : "Guardar producto"}
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
      {$submitting ? "Guardando..." : "Guardar producto"}
    </Button>
  </div>
</div>

<Dialog.Root bind:open={dialogNuevaCategoriaAbierto}>
  <Dialog.Content class="sm:max-w-sm">
    <Dialog.Header>
      <Dialog.Title>Nueva categoría</Dialog.Title>
      <Dialog.Description>Se agregará a la lista y quedará seleccionada.</Dialog.Description>
    </Dialog.Header>

    <div class="space-y-2">
      <label class="text-sm font-medium" for="nueva-categoria-input">Nombre</label>
      <input
        id="nueva-categoria-input"
        bind:value={nuevaCategoriaNombre}
        placeholder="Ej: Lácteos"
        class="h-9 w-full rounded-md border px-2.5 text-sm"
        onkeydown={(e) => e.key === "Enter" && crearCategoria()}
      />
    </div>

    <Dialog.Footer>
      <Button type="button" variant="outline" onclick={() => (dialogNuevaCategoriaAbierto = false)}>
        Cancelar
      </Button>
      <Button type="button" onclick={crearCategoria}>Crear y seleccionar</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<Toaster richColors
style="
    --success-bg: #1a7f1a; 
    --success-text: #fff; 
    --success-border: #1a7f1a;
  "  />