<script lang="ts">
  import { setContext } from "svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import AppSidebar from "$lib/components/layout/AppSidebar.svelte";
  import AppNavbar from "$lib/components/layout/AppNavbar.svelte";
  import { agruparMenuPorSeccion, type NavSection } from "$lib/utils/menu";
  import type { LayoutData } from "./$types";

  let { children, data }: { children: import("svelte").Snippet; data: LayoutData } = $props();

  // svelte-ignore state_referenced_locally: falso positivo en SvelteKit SSR.
  // LayoutData se carga 1 sola vez vía load() y no cambia en runtime sin navegación full;
  // setContext inicializa el árbol al montar → es 100% seguro usarlo aquí.
  const menuSecciones: NavSection[] = agruparMenuPorSeccion(data.menu);
  setContext("menuItems", menuSecciones);
  setContext("usuarioActivo", {
    get usuario() {
      return data.usuario;
    },
  });
</script>

<!-- Provider = contexto global del sidebar -->
<Sidebar.Provider>

  <AppSidebar />

  <!-- Inset = área derecha con padding auto ajustado según ancho sidebar -->
  <Sidebar.Inset>

	<AppNavbar />

    <main class="flex-1 p-4 md:p-6 lg:p-8">
      {@render children()}
    </main>

  </Sidebar.Inset>

</Sidebar.Provider>
