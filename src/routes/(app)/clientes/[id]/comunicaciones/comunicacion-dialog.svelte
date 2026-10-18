<!-- src/routes/(app)/clientes/[id]/comunicaciones/comunicacion-dialog.svelte -->
<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import ArrowDownLeft from "@lucide/svelte/icons/arrow-down-left";
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
  import { notificarError, notificarExito } from "$lib/utils/notify";
  import {
    CANALES_COMUNICACION,
    ETIQUETA_CANAL,
    ETIQUETA_DIRECCION,
    ETIQUETA_RESULTADO,
    RESULTADOS_COMUNICACION,
    crearComunicacion,
  } from "$lib/utils/comunicacion";
  import { registrarComunicacionCreada } from "$lib/state/clientes.svelte";
  import type {
    CanalComunicacion,
    DireccionComunicacion,
    ResultadoComunicacion,
  } from "$lib/types/cliente";
  import { COLORES_CANAL, ICONOS_CANAL } from "./iconos";

  let {
    open = $bindable(false),
    clienteId,
    autor = "Juan Pérez",
  }: { open?: boolean; clienteId: number; autor?: string } = $props();

  let canal = $state<CanalComunicacion>("llamada");
  let direccion = $state<DireccionComunicacion>("saliente");
  let resultado = $state<ResultadoComunicacion>("contactado");
  let minutos = $state("0");
  let segundos = $state("0");
  let contenido = $state("");
  let error = $state(false);

  const esLlamada = $derived(canal === "llamada");

  function guardar() {
    if (!contenido.trim()) {
      error = true;
      notificarError(
        "Resumen requerido",
        "Describe brevemente de qué se habló.",
      );
      return;
    }

    const min = Math.max(0, Number(minutos) || 0);
    const seg = Math.min(59, Math.max(0, Number(segundos) || 0));
    const total = min * 60 + seg;

    const comunicacion = crearComunicacion(clienteId, {
      canal,
      direccion,
      resultado,
      ...(esLlamada && total > 0 ? { duracionSegundos: total } : {}),
      contenido,
      autor,
    });
    registrarComunicacionCreada(comunicacion);

    // TODO: enviar a tu API → POST /clientes/:id/comunicaciones
    console.log(
      `[clientes] Payload (REGISTRAR COMUNICACIÓN) → POST /clientes/${clienteId}/comunicaciones\n${JSON.stringify(comunicacion, null, 2)}`,
    );

    notificarExito(
      "Comunicación registrada",
      `${ETIQUETA_CANAL[canal]} · ${ETIQUETA_DIRECCION[direccion]}`,
    );

    canal = "llamada";
    direccion = "saliente";
    resultado = "contactado";
    minutos = "0";
    segundos = "0";
    contenido = "";
    error = false;
    open = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-lg">
    <Dialog.Header>
      <Dialog.Title>Registrar comunicación</Dialog.Title>
      <Dialog.Description>
        Historial omnicanal: llamadas, mensajería y contactos presenciales.
      </Dialog.Description>
    </Dialog.Header>

    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1.5">
        <span class="text-sm font-medium">Canal</span>
        <ToggleGroup.Root
          type="single"
          value={canal}
          variant="outline"
          size="sm"
          class="flex-wrap"
          onValueChange={(valor) => {
            if (valor) canal = valor as CanalComunicacion;
          }}
        >
          {#each CANALES_COMUNICACION as opcion}
            {@const Icono = ICONOS_CANAL[opcion]}
            <ToggleGroup.Item value={opcion}>
              <Icono
                data-icon="inline-start"
                class={COLORES_CANAL[opcion]}
              />
              {ETIQUETA_CANAL[opcion]}
            </ToggleGroup.Item>
          {/each}
        </ToggleGroup.Root>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <div class="flex flex-col gap-1.5">
          <span class="text-sm font-medium">Dirección</span>
          <ToggleGroup.Root
            type="single"
            value={direccion}
            variant="outline"
            size="sm"
            onValueChange={(valor) => {
              if (valor) direccion = valor as DireccionComunicacion;
            }}
          >
            <ToggleGroup.Item value="entrante">
              <ArrowDownLeft data-icon="inline-start" />
              Entrante
            </ToggleGroup.Item>
            <ToggleGroup.Item value="saliente">
              <ArrowUpRight data-icon="inline-start" />
              Saliente
            </ToggleGroup.Item>
          </ToggleGroup.Root>
        </div>

        <div class="flex min-w-40 flex-col gap-1.5">
          <label class="text-sm font-medium" for="com-resultado">
            Resultado
          </label>
          <Select.Root
            type="single"
            value={resultado}
            onValueChange={(valor) => {
              if (valor) resultado = valor as ResultadoComunicacion;
            }}
          >
            <Select.Trigger id="com-resultado" class="w-full">
              {ETIQUETA_RESULTADO[resultado]}
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                {#each RESULTADOS_COMUNICACION as opcion}
                  <Select.Item value={opcion}>
                    {ETIQUETA_RESULTADO[opcion]}
                  </Select.Item>
                {/each}
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      {#if esLlamada}
        <div class="flex flex-col gap-1.5">
          <span class="text-sm font-medium">Duración</span>
          <div class="flex items-end gap-2">
            <div class="flex w-24 flex-col gap-1">
              <label class="text-xs text-muted-foreground" for="com-minutos">
                Minutos
              </label>
              <Input
                id="com-minutos"
                type="number"
                min={0}
                bind:value={minutos}
              />
            </div>
            <div class="flex w-24 flex-col gap-1">
              <label class="text-xs text-muted-foreground" for="com-segundos">
                Segundos
              </label>
              <Input
                id="com-segundos"
                type="number"
                min={0}
                max={59}
                bind:value={segundos}
              />
            </div>
          </div>
        </div>
      {/if}

      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium" for="com-contenido">Resumen</label>
        <Textarea
          id="com-contenido"
          bind:value={contenido}
          oninput={() => (error = false)}
          maxlength={500}
          rows={4}
          aria-invalid={error}
          placeholder="Motivo o resultado de la comunicación…"
        />
        <div class="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>Se guarda con tu nombre y la fecha actual.</span>
          <span class="tabular-nums">{contenido.length}/500</span>
        </div>
      </div>
    </div>

    <Dialog.Footer>
      <Button type="button" variant="outline" onclick={() => (open = false)}>
        Cancelar
      </Button>
      <Button type="button" onclick={guardar}>Guardar comunicación</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
