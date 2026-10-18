<!-- src/routes/(app)/clientes/[id]/nota-dialog.svelte -->
<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import StickyNote from "@lucide/svelte/icons/sticky-note";
  import ShieldAlert from "@lucide/svelte/icons/shield-alert";
  import { notificarError, notificarExito } from "$lib/utils/notify";
  import { crearNota, ETIQUETA_NOTA } from "$lib/utils/nota";
  import { registrarNotaCreada } from "$lib/state/clientes.svelte";
  import type { TipoNota } from "$lib/types/cliente";

  let {
    open = $bindable(false),
    clienteId,
    autor = "Juan Pérez",
  }: { open?: boolean; clienteId: number; autor?: string } = $props();

  let tipo = $state<TipoNota>("nota");
  let contenido = $state("");
  let error = $state(false);

  const AYUDA: Record<TipoNota, string> = {
    nota: "Observaciones internas del cliente.",
    restriccion: "Se destacará en la bitácora y en el encabezado del perfil.",
  };

  function guardar() {
    if (!contenido.trim()) {
      error = true;
      notificarError(
        "Contenido requerido",
        "Escribe la nota antes de guardar.",
      );
      return;
    }

    const nota = crearNota(clienteId, { tipo, contenido, autor });
    registrarNotaCreada(nota);

    // TODO: enviar a tu API → POST /clientes/:id/notas
    console.log(
      `[clientes] Payload (AGREGAR NOTA) → POST /clientes/${clienteId}/notas\n${JSON.stringify(nota, null, 2)}`,
    );

    notificarExito("Nota agregada", ETIQUETA_NOTA[tipo]);
    tipo = "nota";
    contenido = "";
    error = false;
    open = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>Agregar nota</Dialog.Title>
      <Dialog.Description>
        Registra información interna: notas o restricciones del cliente.
      </Dialog.Description>
    </Dialog.Header>

    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1.5">
        <span class="text-sm font-medium">Tipo</span>
        <ToggleGroup.Root
          type="single"
          value={tipo}
          variant="outline"
          size="sm"
          class="flex-wrap"
          onValueChange={(valor) => {
            if (valor) tipo = valor as TipoNota;
          }}
        >
          <ToggleGroup.Item value="nota">
            <StickyNote data-icon="inline-start" />
            Nota
          </ToggleGroup.Item>
          <ToggleGroup.Item value="restriccion">
            <ShieldAlert data-icon="inline-start" />
            Restricción
          </ToggleGroup.Item>
        </ToggleGroup.Root>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium" for="nota-contenido">
          Contenido
        </label>
        <Textarea
          id="nota-contenido"
          bind:value={contenido}
          oninput={() => (error = false)}
          maxlength={500}
          rows={4}
          aria-invalid={error}
          placeholder="Escribe la nota de seguimiento…"
        />
        <div
          class="flex items-center justify-between gap-3 text-xs text-muted-foreground"
        >
          <span>{AYUDA[tipo]}</span>
          <span class="tabular-nums">{contenido.length}/500</span>
        </div>
      </div>
    </div>

    <Dialog.Footer>
      <Button type="button" variant="outline" onclick={() => (open = false)}>
        Cancelar
      </Button>
      <Button type="button" onclick={guardar}>Agregar nota</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
