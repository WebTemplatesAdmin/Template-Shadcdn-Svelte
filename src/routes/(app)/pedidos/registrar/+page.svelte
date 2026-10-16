<script lang="ts">
  import PedidoForm from "../forms/pedido-form.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Nuevo pedido · Mis Ventas</title>
</svelte:head>

<PedidoForm
  form={data.form}
  catalogo={data.catalogo}
  clientes={data.clientes}
  titulo="Nuevo pedido"
  descripcion="Registra una venta y déjale su seguimiento listo para tu API"
  textoBoton="Crear pedido"
/>
