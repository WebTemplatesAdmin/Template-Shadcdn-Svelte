<script lang="ts">
  import { page } from "$app/state";
  import ClienteDetalle from "./cliente-detalle.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  // El usuario viene del layout (mock); se reemplaza por la sesión real.
  const autor = $derived(page.data.usuario?.nombre ?? "Sistema");
</script>

<svelte:head>
  <title>{data.cliente?.nombre ?? "Cliente"} · Mis Ventas</title>
</svelte:head>

<ClienteDetalle
  cliente={data.cliente}
  clienteId={data.clienteId}
  pedidos={data.pedidos}
  {autor}
/>
