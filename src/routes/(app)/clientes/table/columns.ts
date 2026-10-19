// src/routes/(app)/clientes/table/columns.ts
import type { ColumnDef } from "@tanstack/svelte-table";
import { renderComponent, renderSnippet } from "@tanstack/svelte-table";
import { createRawSnippet } from "svelte";
import type { DataTableFeatures } from "$lib/components/data-table/data-table-features.js";
import ColumnHeader from "$lib/components/data-table/column-header.svelte";
import type { ClienteResumen } from "$lib/types/cliente";
import { formatearMonto } from "$lib/utils/pedido";
import ClienteCell from "./cliente-cell.svelte";
import ClienteAcciones from "./cliente-acciones.svelte";

export type ClienteAccionesHandlers = {
  onVer: (cliente: ClienteResumen) => void;
};

/** Rango numérico usado por los filtros de total comprado y pedidos. */
export type RangoNumerico = {
  min: number | null;
  max: number | null;
};

/** Devuelve true si el valor cae dentro del rango (extremos opcionales). */
export function dentroDeRango(valor: number, rango: RangoNumerico): boolean {
  if (rango.min !== null && valor < rango.min) return false;
  if (rango.max !== null && valor > rango.max) return false;
  return true;
}

export function createColumns(
  handlers: ClienteAccionesHandlers,
): ColumnDef<DataTableFeatures, ClienteResumen>[] {
  return [
    {
      id: "cliente",
      accessorFn: (row) => row.nombre,
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Cliente" }),
      enableColumnFilter: true,
      // Un solo buscador: nombre, email o teléfono.
      filterFn: (row, _columnId, filterValue: string) => {
        const consulta = String(filterValue ?? "")
          .trim()
          .toLowerCase();
        if (!consulta) return true;
        const cliente = row.original;
        return (
          cliente.nombre.toLowerCase().includes(consulta) ||
          cliente.email.toLowerCase().includes(consulta) ||
          cliente.telefono.toLowerCase().includes(consulta)
        );
      },
      cell: ({ row }) =>
        renderComponent(ClienteCell, { cliente: row.original }),
    },
    {
      accessorKey: "telefono",
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Teléfono" }),
      cell: ({ row }) => {
        const texto = row.original.telefono || "—";
        const raw = createRawSnippet<[]>(() => ({
          render: () => `<span class="tabular-nums">${texto}</span>`,
        }));
        return renderSnippet(raw, []);
      },
    },
    {
      id: "ciudad",
      accessorFn: (row) => row.ciudad ?? "—",
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Ciudad" }),
      enableColumnFilter: true,
      filterFn: (row, _columnId, filterValue: string) => {
        if (!filterValue || filterValue === "todas") return true;
        return (row.original.ciudad ?? "").trim() === filterValue;
      },
    },
    {
      id: "tarjetas",
      accessorFn: (row) => row.tarjetas?.length ?? 0,
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Tarjetas" }),
    },
    {
      accessorKey: "pedidos",
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Pedidos" }),
      enableColumnFilter: true,
      filterFn: (row, _columnId, filterValue: RangoNumerico | undefined) =>
        !filterValue || dentroDeRango(row.original.pedidos, filterValue),
    },
    {
      accessorKey: "totalComprado",
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Total comprado" }),
      enableColumnFilter: true,
      filterFn: (row, _columnId, filterValue: RangoNumerico | undefined) =>
        !filterValue || dentroDeRango(row.original.totalComprado, filterValue),
      cell: ({ row }) => {
        const texto = formatearMonto(row.original.totalComprado);
        const raw = createRawSnippet<[]>(() => ({
          render: () => `<span class="font-medium tabular-nums">${texto}</span>`,
        }));
        return renderSnippet(raw, []);
      },
    },
    {
      id: "actions",
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Acciones" }),
      cell: ({ row }) =>
        renderComponent(ClienteAcciones, {
          cliente: row.original,
          onVer: handlers.onVer,
        }),
    },
  ];
}
