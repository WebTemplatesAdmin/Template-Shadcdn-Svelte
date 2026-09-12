// src/routes/(app)/productos/table/columns.ts
import type { ColumnDef } from "@tanstack/svelte-table";
import type { DataTableFeatures } from "$lib/components/data-table/data-table-features.js";
import { renderSnippet, renderComponent } from "@tanstack/svelte-table";
import { createRawSnippet } from "svelte";
import { Checkbox } from "$lib/components/ui/checkbox/index.js";
import DataTableActions from "./data-table-actions.svelte";
import ColumnHeader from "./column-header.svelte";



export type Producto = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
};

export const columns: ColumnDef<DataTableFeatures, Producto>[] = [
  // Columna de checkbox para selección de filas
  {
    id: "select",
    header: ({ table }) =>
      renderComponent(Checkbox, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
        onCheckedChange: (value: boolean) => table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Seleccionar todo",
      }),
    cell: ({ row }) =>
      renderComponent(Checkbox, {
        checked: row.getIsSelected(),
        onCheckedChange: (value: boolean) => row.toggleSelected(!!value),
        "aria-label": "Seleccionar fila",
        class: "data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      }),
    enableSorting: false,
    enableHiding: false,
  },

  // Columnas de datos
  {
    accessorKey: "name",
    header: ({ column }) => renderComponent(ColumnHeader, { column, title: "Nombre" }),
    enableColumnFilter: true,
  },
  {
    accessorKey: "category",
    header: ({ column }) => renderComponent(ColumnHeader, { column, title: "Categoría" }),
    enableColumnFilter: true,
  },
  {
    accessorKey: "price",
    header: ({ column }) => renderComponent(ColumnHeader, { column, title: "Precio" }),
    cell: ({ getValue }) => {
      const raw = createRawSnippet<[]>(() => ({
        render: () => `<span>$${(getValue() as number).toLocaleString()}</span>`,
      }));
      return renderSnippet(raw, []);
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => renderComponent(ColumnHeader, { column, title: "Stock" }),
  },

  // Columna de acciones (editar, eliminar)
  {
    id: "actions",
    cell: ({ row }) =>
      renderComponent(DataTableActions, { id: row.original.id }),
  },
];