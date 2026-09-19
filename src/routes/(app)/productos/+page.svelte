<script lang="ts">
  import DataTable from "$lib/components/data-table/data-table.svelte";
  import { createColumns, type Producto } from "./table/columns";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import Download from "@lucide/svelte/icons/download";
  import Plus from "@lucide/svelte/icons/plus";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import SlidersHorizontal from "@lucide/svelte/icons/sliders-horizontal";
  import MoreVertical from "@lucide/svelte/icons/more-vertical";
  import ProductRail from "./product-rail.svelte";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import ConfirmDialog from "$lib/components/confirmDialog/ConfirmDialog.svelte";
  import { toast, Toaster } from "svelte-sonner";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";

  let { data } = $props();

  function exportarCSV(table: any) {
    const seleccionados = table
      .getFilteredSelectedRowModel()
      .rows.map((r: any) => r.original) as Producto[];
    if (seleccionados.length === 0) {
      alert("Selecciona al menos un producto");
      return;
    }
    const csv =
      "Nombre,Precio,Stock\n" +
      seleccionados.map((p) => `${p.name},${p.price},${p.stock}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "productos.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function eliminarSeleccionados(table: any) {
    const seleccionados = table
      .getFilteredSelectedRowModel()
      .rows.map((r: any) => r.original) as Producto[];
    if (seleccionados.length === 0) return;

    const confirmar = confirm(
      `¿Eliminar ${seleccionados.length} producto(s)? Esta acción no se puede deshacer.`,
    );
    if (!confirmar) return;

    // TODO: llamar a tu products-ms para eliminar cada uno por su id
    console.log(
      "Eliminando:",
      seleccionados.map((p) => p.id),
    );
  }

  const categorias = ["Ropa", "Calzado", "Accesorios"]; // TODO: sacar dinámicamente de tus productos o de tu products-ms

  let precioMin = $state("");
  let precioMax = $state("");
  let stockMin = $state("");

  function aplicarFiltrosAvanzados(table: any) {
    const min = precioMin ? Number(precioMin) : undefined;
    const max = precioMax ? Number(precioMax) : undefined;
    const stockMinVal = stockMin ? Number(stockMin) : undefined;

    table
      .getColumn("price")
      ?.setFilterValue(
        min !== undefined || max !== undefined ? [min, max] : undefined,
      );
    table.getColumn("stock")?.setFilterValue(stockMinVal);
  }

  let sheetCategoriaAbierto = $state(false);
  let confirmEliminarAbierto = $state(false);
  let tablaParaEliminar: any = null;

  function pedirConfirmacionEliminar(table: any) {
    const seleccionados = table.getFilteredSelectedRowModel().rows;
    if (seleccionados.length === 0) return;
    tablaParaEliminar = table;
    confirmEliminarAbierto = true;
  }

  function confirmarEliminacion() {
    const seleccionados = tablaParaEliminar
      .getFilteredSelectedRowModel()
      .rows.map((r: any) => r.original) as Producto[];

    // TODO: llamar a tu products-ms para eliminar cada uno por su id
    console.log(
      "Eliminando:",
      seleccionados.map((p) => p.id),
    );
    toast.success("Eliminados");

    confirmEliminarAbierto = false;
  }

  // 👇 NUEVO: función para eliminar un producto individual desde el menú "..."
  function eliminarProductoIndividual(id: number) {
    // TODO: llamar a tu products-ms para eliminar por id
    console.log("Eliminando producto individual:", id);
    toast.success("Producto eliminado");
  }

  // 👇 NUEVO: se generan las columnas pasándole la función de arriba
  const columns = createColumns(eliminarProductoIndividual);
</script>

<div class="pr-16">
  <div class="min-w-0 flex-1">
    

    <DataTable data={data.productos} {columns}>
      {#snippet toolbar({ table })}
        <!-- ============ VERSIÓN MOBILE (< md) ============ -->
        <div class="flex w-full flex-col gap-2 md:hidden">
          <Input
            placeholder="Buscar producto..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            oninput={(e) =>
              table.getColumn("name")?.setFilterValue(e.currentTarget.value)}
          />

          <div class="flex items-center gap-2">
            <Popover.Root>
              <Popover.Trigger>
                {#snippet child({ props })}
                  <Button {...props} variant="outline" class="flex-1">
                    <SlidersHorizontal class="mr-2 h-4 w-4" />
                    Filtros
                  </Button>
                {/snippet}
              </Popover.Trigger>
              <Popover.Content class="w-72 space-y-4">
                <div class="space-y-2">
                  <p class="text-sm font-medium">Categoría</p>
                  <Select.Root
                    type="single"
                    value={(table
                      .getColumn("category")
                      ?.getFilterValue() as string) ?? ""}
                    onValueChange={(value) =>
                      table
                        .getColumn("category")
                        ?.setFilterValue(value || undefined)}
                  >
                    <Select.Trigger class="w-full">
                      {(table
                        .getColumn("category")
                        ?.getFilterValue() as string) || "Categoría"}
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="">Todas las categorías</Select.Item>
                      {#each categorias as cat}
                        <Select.Item value={cat}>{cat}</Select.Item>
                      {/each}
                    </Select.Content>
                  </Select.Root>
                </div>

                <div class="space-y-2">
                  <p class="text-sm font-medium">Rango de precio</p>
                  <div class="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Mín"
                      bind:value={precioMin}
                      class="h-8"
                    />
                    <span class="text-muted-foreground">-</span>
                    <Input
                      type="number"
                      placeholder="Máx"
                      bind:value={precioMax}
                      class="h-8"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <p class="text-sm font-medium">Stock mínimo</p>
                  <Input
                    type="number"
                    placeholder="Ej: 10"
                    bind:value={stockMin}
                    class="h-8"
                  />
                </div>

                <div class="flex items-center justify-between border-t pt-3">
                  <p class="text-sm text-muted-foreground">Filas por página</p>
                  <Select.Root
                    type="single"
                    value={String(table.atoms.pagination.get().pageSize)}
                    onValueChange={(value) => table.setPageSize(Number(value))}
                  >
                    <Select.Trigger class="w-20">
                      {table.atoms.pagination.get().pageSize}
                    </Select.Trigger>
                    <Select.Content>
                      {#each [5, 10, 50, 100] as size}
                        <Select.Item value={String(size)}>{size}</Select.Item>
                      {/each}
                    </Select.Content>
                  </Select.Root>
                </div>

                <Button
                  size="sm"
                  class="w-full"
                  onclick={() => aplicarFiltrosAvanzados(table)}
                >
                  Aplicar filtros
                </Button>
              </Popover.Content>
            </Popover.Root>

            <Button
              class="flex-1 bg-primary text-white border border-primary hover:bg-primary/80 hover:text-white"
            >
              <Plus class="mr-2 h-4 w-4" />
              Nuevo
            </Button>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                {#snippet child({ props })}
                  <Button {...props} variant="outline" size="icon">
                    <MoreVertical class="h-4 w-4" />
                  </Button>
                {/snippet}
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end">
                <DropdownMenu.Item onclick={() => exportarCSV(table)}>
                  Exportar ({table.getFilteredSelectedRowModel().rows.length})
                </DropdownMenu.Item>
                {#if table.getFilteredSelectedRowModel().rows.length > 0}
                  <DropdownMenu.Item
                    variant="destructive"
                    onclick={() => eliminarSeleccionados(table)}
                  >
                    Eliminar ({table.getFilteredSelectedRowModel().rows.length})
                  </DropdownMenu.Item>
                {/if}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>

        <!-- ============ VERSIÓN DESKTOP (md+) ============ -->
        <div class="hidden md:flex flex-1 items-center gap-3">
          <Input
            placeholder="Buscar producto..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            oninput={(e) =>
              table.getColumn("name")?.setFilterValue(e.currentTarget.value)}
            class="max-w-sm"
          />

          <!-- Filtro principal: Categoría -->
          <Select.Root
            type="single"
            value={(table.getColumn("category")?.getFilterValue() as string) ??
              ""}
            onValueChange={(value) =>
              table.getColumn("category")?.setFilterValue(value || undefined)}
          >
            <Select.Trigger class="h-9 w-[160px]">
              {(table.getColumn("category")?.getFilterValue() as string) ||
                "Categoría"}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="">Todas las categorías</Select.Item>
              {#each categorias as cat}
                <Select.Item value={cat}>{cat}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>

          <!-- Más filtros -->
          <Popover.Root>
            <Popover.Trigger>
              {#snippet child({ props })}
                <Button {...props} variant="outline" class="h-9">
                  <SlidersHorizontal class="mr-2 h-4 w-4" />
                  Más filtros
                </Button>
              {/snippet}
            </Popover.Trigger>
            <Popover.Content class="w-72 space-y-4">
              <div class="space-y-2">
                <p class="text-sm font-medium">Rango de precio</p>
                <div class="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Mín"
                    bind:value={precioMin}
                    class="h-8"
                  />
                  <span class="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Máx"
                    bind:value={precioMax}
                    class="h-8"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <p class="text-sm font-medium">Stock mínimo</p>
                <Input
                  type="number"
                  placeholder="Ej: 10"
                  bind:value={stockMin}
                  class="h-8"
                />
              </div>

              <Button
                size="sm"
                class="w-full"
                onclick={() => aplicarFiltrosAvanzados(table)}
              >
                Aplicar filtros
              </Button>
            </Popover.Content>
          </Popover.Root>

          <div class="flex items-center gap-2 ml-auto">
            <p class="text-sm text-muted-foreground whitespace-nowrap">
              Filas por página
            </p>
            <Select.Root
              type="single"
              value={String(table.atoms.pagination.get().pageSize)}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <Select.Trigger class="h-8 w-17.5">
                {table.atoms.pagination.get().pageSize}
              </Select.Trigger>
              <Select.Content>
                {#each [5, 10, 50, 100] as size}
                  <Select.Item value={String(size)}>{size}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>
        </div>

        <div class="hidden md:flex items-center gap-2 shrink-0">
          {#if table.getFilteredSelectedRowModel().rows.length > 0}
            <Button
              variant="destructive"
              onclick={() => pedirConfirmacionEliminar(table)}
            >
              <Trash2 class="mr-2 h-4 w-4" />
              Eliminar ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          {/if}
          <Button variant="outline" onclick={() => exportarCSV(table)}>
            <Download class="mr-2 h-4 w-4" />
            Exportar ({table.getFilteredSelectedRowModel().rows.length})
          </Button>
          <Button
            variant="outline"
            class="bg-primary text-white border border-primary hover:bg-primary/80 hover:text-white"
            href="/productos/registrar"
          >
            <Plus class="mr-2 h-4 w-4 " />
            Nuevo producto
          </Button>
        </div>
      {/snippet}
    </DataTable>
  </div>
  <ProductRail onNuevaCategoria={() => (sheetCategoriaAbierto = true)} />
</div>

<Sheet.Root bind:open={sheetCategoriaAbierto}>
  <Sheet.Content side="right" class="w-full sm:max-w-sm">
    <Sheet.Header>
      <Sheet.Title>Nueva categoría</Sheet.Title>
      <Sheet.Description
        >Crea una categoría para organizar tus productos.</Sheet.Description
      >
    </Sheet.Header>

    <form method="POST" action="?/crearCategoria" class="space-y-4 px-4">
      <!-- Aquí va el Form.Field con Superforms, igual que en el login -->
    </form>

    <Sheet.Footer>
      <Sheet.Close>
        {#snippet child({ props })}
          <Button {...props} variant="outline" class="w-full">Cancelar</Button>
        {/snippet}
      </Sheet.Close>
    </Sheet.Footer>
  </Sheet.Content>
</Sheet.Root>

<ConfirmDialog
  bind:open={confirmEliminarAbierto}
  title="¿Eliminar productos seleccionados?"
  description="Esta acción no se puede deshacer. Los productos se eliminarán permanentemente."
  confirmText="Eliminar"
  onConfirm={confirmarEliminacion}
/>

<Toaster
  richColors
  style="
    --success-bg: #1a7f1a; 
    --success-text: #fff; 
    --success-border: #1a7f1a;
  "
/>
