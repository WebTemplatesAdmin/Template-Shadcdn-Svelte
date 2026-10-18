<!-- src/routes/(app)/clientes/[id]/tarjeta-dialog.svelte -->
<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { notificarError, notificarExito } from "$lib/utils/notify";
  import {
    crearTarjeta,
    MARCAS_TARJETA,
    resumenTarjeta,
  } from "$lib/utils/tarjeta";
  import { registrarTarjetaCreada } from "$lib/state/clientes.svelte";

  let {
    open = $bindable(false),
    clienteId,
  }: { open?: boolean; clienteId: number } = $props();

  let marca = $state("");
  let titular = $state("");
  let vencimiento = $state("");
  let ultimos4 = $state("");

  function guardar() {
    if (
      !titular.trim() ||
      !/^\d{2}\/\d{2}$/.test(vencimiento) ||
      !/^\d{4}$/.test(ultimos4)
    ) {
      notificarError(
        "Datos incompletos",
        "Completa titular, vencimiento (MM/AA) y los 4 dígitos.",
      );
      return;
    }

    const tarjeta = crearTarjeta(clienteId, {
      marca: marca || undefined,
      ultimos4,
      titular,
      vencimiento,
    });
    registrarTarjetaCreada(tarjeta);

    // TODO: enviar a tu API → POST /clientes/:id/tarjetas
    console.log(
      `[clientes] Payload (GUARDAR TARJETA) → POST /clientes/${clienteId}/tarjetas\n${JSON.stringify(tarjeta, null, 2)}`,
    );

    notificarExito("Tarjeta guardada", resumenTarjeta(tarjeta));
    marca = "";
    titular = "";
    vencimiento = "";
    ultimos4 = "";
    open = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>Agregar tarjeta</Dialog.Title>
      <Dialog.Description>
        Solo se guardan los últimos 4 dígitos y un token. Nunca el número
        completo ni el CVV.
      </Dialog.Description>
    </Dialog.Header>

    <div class="flex flex-col gap-3">
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="tm-marca">Marca</label>
        <Select.Root type="single" bind:value={marca}>
          <Select.Trigger id="tm-marca" class="w-full">
            {marca || "Selecciona la marca"}
          </Select.Trigger>
          <Select.Content>
            {#each MARCAS_TARJETA as opcion}
              <Select.Item value={opcion}>{opcion}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="tm-titular">Titular</label>
        <Input
          id="tm-titular"
          bind:value={titular}
          placeholder="Camila Restrepo"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="tm-vencimiento"
            >Vencimiento</label
          >
          <Input
            id="tm-vencimiento"
            bind:value={vencimiento}
            placeholder="08/28"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="tm-ultimos4"
            >Últimos 4 dígitos</label
          >
          <Input
            id="tm-ultimos4"
            bind:value={ultimos4}
            maxlength={4}
            placeholder="4412"
          />
        </div>
      </div>
    </div>

    <Dialog.Footer>
      <Button type="button" variant="outline" onclick={() => (open = false)}>
        Cancelar
      </Button>
      <Button type="button" onclick={guardar}>Guardar tarjeta</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
