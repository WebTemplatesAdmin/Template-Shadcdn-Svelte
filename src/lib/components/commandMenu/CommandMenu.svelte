<!-- src/lib/components/layout/CommandMenu.svelte -->
<script lang="ts">
  import { goto } from "$app/navigation";
  import * as Command from "$lib/components/ui/command/index.js";
  import LayoutDashboard from "@lucide/svelte/icons/layout-dashboard";
  import Package from "@lucide/svelte/icons/package";
  import ShoppingCart from "@lucide/svelte/icons/shopping-cart";
  import TrendingUp from "@lucide/svelte/icons/trending-up";
  import Users from "@lucide/svelte/icons/users";
  import Settings from "@lucide/svelte/icons/settings";
  import Plus from "@lucide/svelte/icons/plus";
  import Tag from "@lucide/svelte/icons/tag";

  let { open = $bindable(false) }: { open?: boolean } = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      open = !open;
    }
  }

  function ir(ruta: string) {
    open = false;
    goto(ruta);
  }
</script>

<svelte:document onkeydown={handleKeydown} />

<Command.Dialog bind:open>
  <Command.Input placeholder="Buscar o escribir un comando..." />
  <Command.List>
    <Command.Empty>No se encontraron resultados.</Command.Empty>

    <Command.Group heading="Navegación">
      <Command.Item onSelect={() => ir("/dashboard")}>
        <LayoutDashboard class="mr-2 h-4 w-4" />
        Dashboard
      </Command.Item>
      <Command.Item onSelect={() => ir("/productos")}>
        <Package class="mr-2 h-4 w-4" />
        Productos
      </Command.Item>
      <Command.Item onSelect={() => ir("/pedidos")}>
        <ShoppingCart class="mr-2 h-4 w-4" />
        Pedidos
      </Command.Item>
      <Command.Item onSelect={() => ir("/ventas")}>
        <TrendingUp class="mr-2 h-4 w-4" />
        Ventas
      </Command.Item>
      <Command.Item onSelect={() => ir("/usuarios")}>
        <Users class="mr-2 h-4 w-4" />
        Usuarios
      </Command.Item>
      <Command.Item onSelect={() => ir("/configuracion")}>
        <Settings class="mr-2 h-4 w-4" />
        Configuración
      </Command.Item>
    </Command.Group>

    <Command.Separator />

    <Command.Group heading="Acciones rápidas">
      <Command.Item onSelect={() => ir("/productos/registrar")}>
        <Plus class="mr-2 h-4 w-4" />
        Nuevo producto
      </Command.Item>
      <Command.Item onSelect={() => ir("/productos?nueva-categoria=1")}>
        <Tag class="mr-2 h-4 w-4" />
        Nueva categoría
      </Command.Item>
    </Command.Group>
  </Command.List>
</Command.Dialog>