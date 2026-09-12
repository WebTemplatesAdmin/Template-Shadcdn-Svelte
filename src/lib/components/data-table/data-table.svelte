<script lang="ts" generics="TData extends RowData">
  import {
    type ColumnDef,
    type RowData,
    createTable,
    FlexRender,
  } from "@tanstack/svelte-table";
  import * as Table from "$lib/components/ui/table/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { features, type DataTableFeatures } from "./data-table-features.js";
  import type { Snippet } from "svelte";
  import * as Select from "$lib/components/ui/select/index.js";

  // 👇 Tipo explícito de la instancia de tabla, con los genéricos correctos
  type TableInstance = ReturnType<typeof createTable<DataTableFeatures, TData>>;

  type DataTableProps<TData extends RowData> = {
    columns: ColumnDef<DataTableFeatures, TData>[];
    data: TData[];
    toolbar?: Snippet<[{ table: TableInstance }]>;
  };

  let { data, columns, toolbar }: DataTableProps<TData> = $props();

  const table = createTable({
    features,
    get data() {
      return data;
    },
    get columns() {
      return columns;
    },
  });
</script>

<div class="space-y-4">
  {#if toolbar}
    <div class="flex items-center justify-between gap-4 py-4">
      {@render toolbar({ table })}
    </div>
  {/if}

  <div class="rounded-md border overflow-hidden">
    <Table.Root>
      <Table.Header class="thead-custom-bg">
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head
                colspan={header.colSpan}
                class="thead-custom-textcolor border-r border-white/20 last:border-r-0 py-1"
              >
                {#if !header.isPlaceholder}
                  <FlexRender {header} />
                {/if}
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each table.getRowModel().rows as row (row.id)}
          <Table.Row data-state={row.getIsSelected() && "selected"}>
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell class="border-r border-gray-200 last:border-r-0 py-0">
                <FlexRender {cell} />
              </Table.Cell>
            {/each}
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell colspan={columns.length} class="h-12 text-center">
              Sin resultados.
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>

  <div class="flex items-center justify-between pt-4">
    <div class="flex-1 text-sm text-muted-foreground">
      {table.getFilteredSelectedRowModel().rows.length} de
      {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
    </div>

    <div class="flex items-center gap-6">
      <div class="flex items-center gap-2">
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

      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onclick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onclick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
        </Button>
      </div>
    </div>
  </div>
</div>

<style>
  :global(.thead-custom-bg) {
    background-color: #f0f0f0 !important;
  }
  :global(.thead-custom-textcolor) {
    color: #000 !important;
  }
</style>
