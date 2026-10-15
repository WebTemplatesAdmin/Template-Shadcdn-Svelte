<!-- src/routes/(app)/pedidos/table/pedido-acciones.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import MoreVertical from "@lucide/svelte/icons/more-vertical";
  import type { Pedido } from "$lib/types/pedido";
  import {
    ETIQUETA_ESTADO,
    puedeCancelar,
    puedeCobrar,
    siguienteEstado,
  } from "$lib/utils/pedido";

  let {
    pedido,
    onVer,
    onAvanzar,
    onCobrar,
    onCancelar,
  }: {
    pedido: Pedido;
    onVer: (pedido: Pedido) => void;
    onAvanzar: (pedido: Pedido) => void;
    onCobrar: (pedido: Pedido) => void;
    onCancelar: (pedido: Pedido) => void;
  } = $props();

  const siguiente = $derived(siguienteEstado(pedido.estado));
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="ghost"
        size="icon"
        aria-label="Acciones del pedido"
      >
        <MoreVertical />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end">
    <DropdownMenu.Group>
      <DropdownMenu.Item onclick={() => onVer(pedido)}>
        Ver detalle
      </DropdownMenu.Item>
      {#if siguiente}
        <DropdownMenu.Item onclick={() => onAvanzar(pedido)}>
          Marcar como {ETIQUETA_ESTADO[siguiente].toLowerCase()}
        </DropdownMenu.Item>
      {/if}
      {#if puedeCobrar(pedido)}
        <DropdownMenu.Item onclick={() => onCobrar(pedido)}>
          Marcar como pagado
        </DropdownMenu.Item>
      {/if}
    </DropdownMenu.Group>
    {#if puedeCancelar(pedido)}
      <DropdownMenu.Separator />
      <DropdownMenu.Item
        variant="destructive"
        onclick={() => onCancelar(pedido)}
      >
        Cancelar pedido
      </DropdownMenu.Item>
    {/if}
  </DropdownMenu.Content>
</DropdownMenu.Root>
