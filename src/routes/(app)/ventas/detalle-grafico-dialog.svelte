<!-- src/routes/(app)/ventas/detalle-grafico-dialog.svelte -->
<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import Download from "@lucide/svelte/icons/download";
  import { formatearMonto } from "$lib/utils/pedido";
  import { notificarExito } from "$lib/utils/notify";
  import type { PuntoSerie } from "$lib/utils/ventas";

  let {
    open = $bindable(false),
    titulo,
    descripcion,
    puntos,
  }: {
    open?: boolean;
    titulo: string;
    descripcion: string;
    puntos: PuntoSerie[];
  } = $props();

  const totalPedidos = $derived(
    puntos.reduce((suma, punto) => suma + punto.pedidos, 0),
  );
  const totalMonto = $derived(
    puntos.reduce((suma, punto) => suma + punto.total, 0),
  );

  function exportarCsv() {
    const filas = [
      ["Periodo", "Pedidos", "Monto"],
      ...puntos.map((punto) => [
        punto.etiqueta,
        String(punto.pedidos),
        String(punto.total),
      ]),
      ["Total", String(totalPedidos), String(totalMonto)],
    ];

    // BOM para que Excel respete los acentos.
    const csv = `\uFEFF${filas.map((fila) => fila.join(",")).join("\n")}`;
    const archivo = `${titulo
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}.csv`;

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = archivo;
    enlace.click();
    URL.revokeObjectURL(url);

    notificarExito("CSV exportado", archivo);
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-lg">
    <Dialog.Header>
      <Dialog.Title>{titulo}</Dialog.Title>
      <Dialog.Description>{descripcion}</Dialog.Description>
    </Dialog.Header>

    <div class="max-h-[60vh] overflow-auto rounded-md border">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b">
            <th
              scope="col"
              class="sticky top-0 z-10 bg-card px-4 py-2 text-left font-medium"
            >
              Periodo
            </th>
            <th
              scope="col"
              class="sticky top-0 z-10 bg-card px-4 py-2 text-right font-medium"
            >
              Pedidos
            </th>
            <th
              scope="col"
              class="sticky top-0 z-10 bg-card px-4 py-2 text-right font-medium"
            >
              Monto
            </th>
          </tr>
        </thead>
        <tbody>
          {#each puntos as punto (punto.etiqueta)}
            <tr class="border-b last:border-0">
              <td class="px-4 py-2">{punto.etiqueta}</td>
              <td class="px-4 py-2 text-right tabular-nums">
                {punto.pedidos}
              </td>
              <td class="px-4 py-2 text-right tabular-nums">
                {formatearMonto(punto.total)}
              </td>
            </tr>
          {/each}
        </tbody>
        <tfoot>
          <tr class="border-t font-medium">
            <td class="sticky bottom-0 z-10 bg-card px-4 py-2">Total</td>
            <td
              class="sticky bottom-0 z-10 bg-card px-4 py-2 text-right tabular-nums"
            >
              {totalPedidos}
            </td>
            <td
              class="sticky bottom-0 z-10 bg-card px-4 py-2 text-right tabular-nums"
            >
              {formatearMonto(totalMonto)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <Dialog.Footer>
      <Button type="button" variant="outline" onclick={exportarCsv}>
        <Download data-icon="inline-start" />
        Exportar CSV
      </Button>
      <Button type="button" onclick={() => (open = false)}>Cerrar</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
