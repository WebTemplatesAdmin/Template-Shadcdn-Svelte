<!-- src/routes/(app)/clientes/[id]/comunicaciones/comunicaciones-panel.svelte -->
<script lang="ts">
  import DataTable from "$lib/components/data-table/data-table.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
  import Plus from "@lucide/svelte/icons/plus";
  import {
    CANALES_COMUNICACION,
    ETIQUETA_CANAL,
  } from "$lib/utils/comunicacion";
  import type {
    CanalComunicacion,
    ComunicacionCliente,
    DireccionComunicacion,
  } from "$lib/types/cliente";
  import { createColumns } from "./columns";

  let {
    comunicaciones,
    onEliminar,
    onNueva,
  }: {
    comunicaciones: ComunicacionCliente[];
    onEliminar: (comunicacion: ComunicacionCliente) => void;
    onNueva: () => void;
  } = $props();

  let filtroCanal = $state<CanalComunicacion | "todos">("todos");
  let filtroDireccion = $state<DireccionComunicacion | "todas">("todas");

  const columns = $derived(createColumns({ onEliminar }));

  const resumen = $derived({
    llamadas: comunicaciones.filter((c) => c.canal === "llamada").length,
    mensajes: comunicaciones.filter((c) =>
      ["whatsapp", "chat", "email", "sms"].includes(c.canal),
    ).length,
  });
</script>

<div class="rounded-lg border bg-card p-6">
  <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
    <div>
      <h2 class="text-sm font-medium">Comunicaciones</h2>
      <p class="text-xs text-muted-foreground">
        {comunicaciones.length}
        {comunicaciones.length === 1 ? "registro" : "registros"}
        · {resumen.llamadas}
        {resumen.llamadas === 1 ? "llamada" : "llamadas"}
        · {resumen.mensajes}
        {resumen.mensajes === 1 ? "mensaje" : "mensajes"}
      </p>
    </div>
    <Button variant="outline" size="sm" onclick={onNueva}>
      <Plus data-icon="inline-start" />
      Registrar comunicación
    </Button>
  </div>

  <DataTable data={comunicaciones} {columns}>
    {#snippet toolbar({ table })}
      <div class="flex w-full flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar por resumen, autor o canal..."
          value={(table.getColumn("contenido")?.getFilterValue() as string) ??
            ""}
          oninput={(evento) =>
            table
              .getColumn("contenido")
              ?.setFilterValue(evento.currentTarget.value)}
          class="md:max-w-xs"
        />

        <Select.Root
          type="single"
          value={filtroCanal}
          onValueChange={(valor) => {
            const canal = (valor ?? "todos") as CanalComunicacion | "todos";
            filtroCanal = canal;
            table
              .getColumn("canal")
              ?.setFilterValue(canal === "todos" ? "" : canal);
          }}
        >
          <Select.Trigger class="w-44">
            {filtroCanal === "todos"
              ? "Todos los canales"
              : ETIQUETA_CANAL[filtroCanal]}
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              <Select.Item value="todos">Todos los canales</Select.Item>
              {#each CANALES_COMUNICACION as canal}
                <Select.Item value={canal}>
                  {ETIQUETA_CANAL[canal]}
                </Select.Item>
              {/each}
            </Select.Group>
          </Select.Content>
        </Select.Root>

        <ToggleGroup.Root
          type="single"
          variant="outline"
          size="sm"
          value={filtroDireccion}
          onValueChange={(valor) => {
            if (!valor) return;
            const direccion = valor as DireccionComunicacion | "todas";
            filtroDireccion = direccion;
            table
              .getColumn("direccion")
              ?.setFilterValue(direccion === "todas" ? "" : direccion);
          }}
        >
          <ToggleGroup.Item value="todas">Todas</ToggleGroup.Item>
          <ToggleGroup.Item value="entrante">Entrantes</ToggleGroup.Item>
          <ToggleGroup.Item value="saliente">Salientes</ToggleGroup.Item>
        </ToggleGroup.Root>
      </div>
    {/snippet}
  </DataTable>
</div>
