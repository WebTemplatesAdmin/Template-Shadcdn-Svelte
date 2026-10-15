<!-- src/routes/(app)/pedidos/table/origen-cell.svelte -->
<script lang="ts">
  import type { Component } from "svelte";
  import Globe from "@lucide/svelte/icons/globe";
  import Phone from "@lucide/svelte/icons/phone";
  import MessageCircle from "@lucide/svelte/icons/message-circle";
  import Store from "@lucide/svelte/icons/store";
  import type { CanalPedido } from "$lib/types/pedido";
  import { ETIQUETA_CANAL } from "$lib/utils/pedido";

  let {
    canal,
    creadoPor,
  }: { canal: CanalPedido; creadoPor?: string } = $props();

  const ICONO: Record<CanalPedido, Component> = {
    web: Globe,
    telefono: Phone,
    whatsapp: MessageCircle,
    presencial: Store,
  };

  const Icono = $derived(ICONO[canal]);
</script>

<div class="flex items-center gap-2">
  <Icono class="size-4 shrink-0 text-muted-foreground" />
  <div class="min-w-0">
    <p class="truncate text-sm">{ETIQUETA_CANAL[canal]}</p>
    {#if creadoPor}
      <p class="truncate text-xs text-muted-foreground">{creadoPor}</p>
    {/if}
  </div>
</div>
