// src/routes/(app)/clientes/[id]/comunicaciones/columns.ts
import type { ColumnDef } from "@tanstack/svelte-table";
import { renderComponent, renderSnippet } from "@tanstack/svelte-table";
import { createRawSnippet } from "svelte";
import type { DataTableFeatures } from "$lib/components/data-table/data-table-features.js";
import ColumnHeader from "$lib/components/data-table/column-header.svelte";
import type { ComunicacionCliente } from "$lib/types/cliente";
import {
  ETIQUETA_CANAL,
  ETIQUETA_DIRECCION,
  ETIQUETA_RESULTADO,
  formatearDuracion,
} from "$lib/utils/comunicacion";
import CanalCell from "./canal-cell.svelte";
import DireccionCell from "./direccion-cell.svelte";
import ResultadoCell from "./resultado-cell.svelte";
import FechaCell from "./fecha-cell.svelte";
import ResumenCell from "./resumen-cell.svelte";
import ComunicacionAcciones from "./comunicacion-acciones.svelte";

export type ComunicacionHandlers = {
  onEliminar: (comunicacion: ComunicacionCliente) => void;
};

export function createColumns(
  handlers: ComunicacionHandlers,
): ColumnDef<DataTableFeatures, ComunicacionCliente>[] {
  return [
    {
      accessorKey: "creadoEn",
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Fecha" }),
      cell: ({ row }) =>
        renderComponent(FechaCell, { fecha: row.original.creadoEn }),
    },
    {
      accessorKey: "canal",
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Canal" }),
      enableColumnFilter: true,
      filterFn: (row, _columnId, filterValue) => {
        const valor = String(filterValue ?? "");
        return !valor || valor === "todos" || row.original.canal === valor;
      },
      cell: ({ row }) =>
        renderComponent(CanalCell, { canal: row.original.canal }),
    },
    {
      accessorKey: "direccion",
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Dirección" }),
      enableColumnFilter: true,
      filterFn: (row, _columnId, filterValue) => {
        const valor = String(filterValue ?? "");
        return (
          !valor || valor === "todas" || row.original.direccion === valor
        );
      },
      cell: ({ row }) =>
        renderComponent(DireccionCell, { direccion: row.original.direccion }),
    },
    {
      accessorKey: "resultado",
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Resultado" }),
      cell: ({ row }) =>
        renderComponent(ResultadoCell, { resultado: row.original.resultado }),
    },
    {
      id: "duracion",
      accessorFn: (row) => row.duracionSegundos ?? -1,
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Duración" }),
      cell: ({ row }) => {
        const texto = formatearDuracion(row.original.duracionSegundos);
        const raw = createRawSnippet<[]>(() => ({
          render: () => `<span class="tabular-nums">${texto}</span>`,
        }));
        return renderSnippet(raw, []);
      },
    },
    {
      accessorKey: "contenido",
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Resumen" }),
      enableColumnFilter: true,
      // Busca en el resumen, el autor, el canal y el resultado.
      filterFn: (row, _columnId, filterValue) => {
        const consulta = String(filterValue ?? "")
          .trim()
          .toLowerCase();
        if (!consulta) return true;
        const comunicacion = row.original;
        return [
          comunicacion.contenido,
          comunicacion.autor,
          ETIQUETA_CANAL[comunicacion.canal],
          ETIQUETA_DIRECCION[comunicacion.direccion],
          ETIQUETA_RESULTADO[comunicacion.resultado],
        ].some((texto) => texto.toLowerCase().includes(consulta));
      },
      cell: ({ row }) =>
        renderComponent(ResumenCell, { contenido: row.original.contenido }),
    },
    {
      accessorKey: "autor",
      header: ({ column }) =>
        renderComponent(ColumnHeader, { column, title: "Autor" }),
      cell: ({ row }) => {
        const texto = row.original.autor;
        const raw = createRawSnippet<[]>(() => ({
          render: () => `<span class="whitespace-nowrap text-sm">${texto}</span>`,
        }));
        return renderSnippet(raw, []);
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) =>
        renderComponent(ComunicacionAcciones, {
          comunicacion: row.original,
          onEliminar: handlers.onEliminar,
        }),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
