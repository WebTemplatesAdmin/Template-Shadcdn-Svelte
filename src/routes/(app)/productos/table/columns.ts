// src/routes/(app)/productos/table/columns.ts
import type { ColumnDef } from "@tanstack/svelte-table";
import type { DataTableFeatures } from "$lib/components/data-table/data-table-features.js";
import { renderSnippet, renderComponent } from "@tanstack/svelte-table";
import { createRawSnippet } from "svelte";
import { Checkbox } from "$lib/components/ui/checkbox/index.js";
import DataTableActions from "./data-table-actions.svelte";
import ColumnHeader from "./column-header.svelte";
import ProductCell from "./product-cell.svelte";
import StockCell from "./stock-cell.svelte";
import type { Producto } from "$lib/types/producto";
import { precioDesde, precioHasta, stockTotal } from "$lib/utils/producto";

// El tipo Producto vive en $lib/types (fuente única). Se re-exporta
// para conservar `import { type Producto } from "./table/columns"`.
export type { Producto };

// 👇 CAMBIO: ahora es una función que recibe el callback de eliminar
export function createColumns(
  onEliminar: (id: number) => void,
): ColumnDef<DataTableFeatures, Producto>[] {
  return [
    {
      id: "select",
      header: ({ table }) =>
        renderComponent(Checkbox, {
          checked: table.getIsAllPageRowsSelected(),
          indeterminate:
            table.getIsSomePageRowsSelected() &&
            !table.getIsAllPageRowsSelected(),
          onCheckedChange: (value: boolean) =>
            table.toggleAllPageRowsSelected(!!value),
          "aria-label": "Seleccionar todo",
        }),
      cell: ({ row }) =>
        renderComponent(Checkbox, {
          checked: row.getIsSelected(),
          onCheckedChange: (value: boolean) => row.toggleSelected(!!value),
          "aria-label": "Seleccionar fila",
          class:
            "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
        }),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Producto" }),
      enableColumnFilter: true,
      // Busca por nombre, SKU o código de barras
      filterFn: (row, _columnId, filterValue: string) => {
        const q = String(filterValue ?? "")
          .trim()
          .toLowerCase();
        if (!q) return true;
        const p = row.original;
        return (
          p.name.toLowerCase().includes(q) ||
          (p.sku ?? "").toLowerCase().includes(q) ||
          (p.codigoBarras ?? "").toLowerCase().includes(q)
        );
      },
      cell: ({ row }) =>
        renderComponent(ProductCell, {
          nombre: row.original.name,
          sku: row.original.sku,
          imagen: row.original.imagenes?.[0],
        }),
    },
    {
      accessorKey: "category",
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Categoría" }),
      enableColumnFilter: true,
    },
    {
      accessorKey: "price",
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Precio" }),
      enableColumnFilter: true,
      filterFn: (
        row,
        columnId,
        filterValue: [number | undefined, number | undefined],
      ) => {
        const [min, max] = filterValue;
        const valor = row.getValue(columnId) as number;
        if (min !== undefined && valor < min) return false;
        if (max !== undefined && valor > max) return false;
        return true;
      },
      cell: ({ row }) => {
        const desde = precioDesde(row.original);
        const hasta = precioHasta(row.original);
        const texto =
          desde === hasta
            ? `$${desde.toLocaleString()}`
            : `$${desde.toLocaleString()} – $${hasta.toLocaleString()}`;
        const raw = createRawSnippet<[]>(() => ({
          render: () => `<span>${texto}</span>`,
        }));
        return renderSnippet(raw, []);
      },
    },
    {
      accessorKey: "stock",
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Stock" }),
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue: number) => {
        const valor = row.getValue(columnId) as number;
        return valor >= filterValue;
      },
      cell: ({ row }) =>
        renderComponent(StockCell, {
          stock: stockTotal(row.original),
          minStock: row.original.minStock,
        }),
    },
    {
      id: "actions",
      cell: ({ row }) =>
        renderComponent(DataTableActions, {
          id: row.original.id,
          nombre: row.original.name, // 👈 agregado
          onEliminar, // 👈 agregado
        }),
    },
  ];
}