<script lang="ts">
  import ProductoForm from "../../forms/producto-form.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<ProductoForm
  form={data.form}
  titulo="Editar producto"
  descripcion="Actualiza los datos del producto"
  textoBoton="Guardar cambios"
  historial={data.historial}
  enlaceHistorial={`/ productos /${data.id}/ historial `}
/>
