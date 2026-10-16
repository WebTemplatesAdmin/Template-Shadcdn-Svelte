// src/routes/(app)/pedidos/table/columns.ts
import type { ColumnDef } from "@tanstack/svelte-table";
import { renderComponent, renderSnippet } from "@tanstack/svelte-table";
import { createRawSnippet } from "svelte";
import type { DataTableFeatures } from "$lib/components/data-table/data-table-features.js";
import ColumnHeader from "$lib/components/data-table/column-header.svelte";
import { Checkbox } from "$lib/components/ui/checkbox/index.js";
import type { EstadoPedido, Pedido } from "$lib/types/pedido";
import { formatearMonto, totalUnidades } from "$lib/utils/pedido";
import PedidoCell from "./pedido-cell.svelte";
import ClienteCell from "./cliente-cell.svelte";
import OrigenCell from "./origen-cell.svelte";
import ArticulosCell from "./articulos-cell.svelte";
import PagoCell from "./pago-cell.svelte";
import EstadoCell from "./estado-cell.svelte";
import PedidoAcciones from "./pedido-acciones.svelte";

/** Acciones que la tabla delega a quien la usa (el estado de los pedidos vive allí). */
export type PedidoAccionesHandlers = {
  onVer: (pedido: Pedido) => void;
  onAvanzar: (pedido: Pedido) => void;
  onCobrar: (pedido: Pedido) => void;
  onCancelar: (pedido: Pedido) => void;
  onValidar: (pedido: Pedido) => void;
  onRechazar: (pedido: Pedido) => void;
};

export function createColumns(
  handlers: PedidoAccionesHandlers,
): ColumnDef<DataTableFeatures, Pedido>[] {
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
      accessorKey: "codigo",
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Pedido" }),
      enableColumnFilter: true,
      // Un solo buscador: código, cliente o email.
      filterFn: (row, _columnId, filterValue: string) => {
        const consulta = String(filterValue ?? "")
          .trim()
          .toLowerCase();
        if (!consulta) return true;
        const pedido = row.original;
        return (
          pedido.codigo.toLowerCase().includes(consulta) ||
          pedido.cliente.nombre.toLowerCase().includes(consulta) ||
          pedido.cliente.email.toLowerCase().includes(consulta)
        );
      },
      cell: ({ row }) =>
        renderComponent(PedidoCell, {
          codigo: row.original.codigo,
          fecha: row.original.fecha,
        }),
    },
    {
      id: "cliente",
      accessorFn: (row) => row.cliente.nombre,
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Cliente" }),
      cell: ({ row }) =>
        renderComponent(ClienteCell, {
          nombre: row.original.cliente.nombre,
          email: row.original.cliente.email,
        }),
    },
    {
      id: "canal",
      accessorFn: (row) => row.canal,
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Origen" }),
      enableColumnFilter: true,
      cell: ({ row }) =>
        renderComponent(OrigenCell, {
          canal: row.original.canal,
          creadoPor: row.original.creadoPor,
        }),
    },
    {
      id: "articulos",
      accessorFn: (row) => totalUnidades(row),
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Artículos" }),
      cell: ({ row }) =>
        renderComponent(ArticulosCell, { pedido: row.original }),
    },
    {
      accessorKey: "total",
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Total" }),
      cell: ({ row }) => {
        const texto = formatearMonto(row.original.total);
        const raw = createRawSnippet<[]>(() => ({
          render: () => `<span class="font-medium tabular-nums">${texto}</span>`,
        }));
        return renderSnippet(raw, []);
      },
    },
    {
      accessorKey: "metodoPago",
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Pago" }),
      enableColumnFilter: true,
      cell: ({ row }) =>
        renderComponent(PagoCell, {
          metodo: row.original.metodoPago,
          estadoPago: row.original.estadoPago,
        }),
    },
    {
      accessorKey: "estado",
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Estado" }),
      enableColumnFilter: true,
      filterFn: (row, _columnId, filterValue: EstadoPedido) =>
        row.original.estado === filterValue,
      cell: ({ row }) =>
        renderComponent(EstadoCell, { estado: row.original.estado }),
    },
    {
      id: "actions",
      cell: ({ row }) =>
        renderComponent(PedidoAcciones, {
          pedido: row.original,
          ...handlers,
        }),
    },
  ];
}
