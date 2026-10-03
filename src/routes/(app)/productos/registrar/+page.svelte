<script lang="ts">
  import ProductoForm from "../forms/producto-form.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<ProductoForm
  form={data.form}
  titulo="Nuevo producto"
  descripcion="Completa los datos para agregarlo a tu catálogo"
  textoBoton="Guardar producto"
/>