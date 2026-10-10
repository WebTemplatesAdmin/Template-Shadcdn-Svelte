<script lang="ts">
  import FormSkeleton from "../../forms/form-skeleton.svelte";
  import ProductoForm from "../../forms/producto-form.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const titulo = "Editar producto";
  const descripcion = "Actualiza los datos del producto";
  const textoBoton = "Guardar cambios";

  // Se resuelven juntos para montar el formulario una sola vez (evita remontajes).
  // svelte-ignore state_referenced_locally: `data` es estable por navegación.
  const datos = Promise.all([data.form, data.historial]);
</script>

<!-- Streaming: el formulario llega como promesa → skeleton inmediato. -->
{#await datos}
  <FormSkeleton />
{:then resultado}
  <ProductoForm
    form={resultado[0]}
    {titulo}
    {descripcion}
    {textoBoton}
    historial={resultado[1]}
    enlaceHistorial={`/productos/${data.id}/historial`}
    modo="editar"
  />
{:catch}
  <div class="mx-auto max-w-5xl py-20 text-center">
    <p class="text-sm text-muted-foreground">
      No se pudo cargar el producto. Intenta de nuevo.
    </p>
  </div>
{/await}
