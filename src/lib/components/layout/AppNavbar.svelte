<script lang="ts">
  import { page } from "$app/stores";
  import { cn } from "$lib/utils.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  // Iconos FIJOS: import directo (sin getIcon, sin svelte:component)
  import Search from "@lucide/svelte/icons/search";
  import Bell from "@lucide/svelte/icons/bell";
  import Menu from "@lucide/svelte/icons/menu";
  import UserNav from "./UserNav.svelte";

  const notificaciones = [
    {
      id: 1,
      titulo: "Nuevo pedido recibido",
      detalle: "Pedido #1042 por $85.000",
      tiempo: "Hace 5 min",
    },
    {
      id: 2,
      titulo: "Stock bajo",
      detalle: "Camiseta básica algodón: quedan 3 unidades",
      tiempo: "Hace 1 hora",
    },
    {
      id: 3,
      titulo: "Pago confirmado",
      detalle: "Pedido #1038 fue pagado",
      tiempo: "Hace 3 horas",
    },
  ];
</script>

<header
  class="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6"
>
  <div class="flex items-center gap-3 flex-1">
    <Sidebar.Trigger variant="ghost" size="icon">
      <Menu class="h-5 w-5" />
    </Sidebar.Trigger>
    <div class="hidden flex-col sm:flex">
      <h1 class="text-base font-semibold leading-none tracking-tight">
        {#if $page.url.pathname === "/dashboard" || $page.url.pathname === "/"}
          Dashboard
        {:else if $page.url.pathname.startsWith("/productos")}
          Productos
        {:else if $page.url.pathname.startsWith("/pedidos")}
          Pedidos
        {:else if $page.url.pathname.startsWith("/ventas")}
          Ventas
        {:else if $page.url.pathname.startsWith("/usuarios")}
          Usuarios
        {:else if $page.url.pathname.startsWith("/configuracion")}
          Configuración
        {:else if $page.url.pathname.startsWith("/ayuda")}
          Ayuda
        {:else}
          Panel
        {/if}
      </h1>
      <p class="text-xs text-muted-foreground mt-1">
        Gestiona tu negocio en tiempo real
      </p>
    </div>
  </div>
  <div class="ml-auto flex items-center gap-2 md:gap-3">
    <div class="relative hidden md:block w-72 lg:w-96">
      <Search
        class="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        placeholder="Buscar productos, pedidos, clientes..."
        class="w-full rounded-md bg-muted/50 pl-9 h-9"
      />
    </div>
    <!-- <Button variant="ghost" size="icon" class="relative">
      <Bell class="h-5 w-5" />
      <span class="absolute top-1.5 right-1.5 flex h-2 w-2">
        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
        <span class="relative inline-flex h-2 w-2 rounded-full bg-destructive"></span>
      </span>
    </Button> -->

    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Button {...props} variant="ghost" size="icon" class="relative">
            <Bell class="h-5 w-5" />
            {#if notificaciones.length > 0}
              <span class="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span
                  class="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"
                ></span>
                <span
                  class="relative inline-flex h-2 w-2 rounded-full bg-destructive"
                ></span>
              </span>
            {/if}
          </Button>
        {/snippet}
      </DropdownMenu.Trigger>

      <DropdownMenu.Content class="w-80" align="end">
        <DropdownMenu.Label>Notificaciones</DropdownMenu.Label>
        <DropdownMenu.Separator />

        {#if notificaciones.length === 0}
          <p class="px-2 py-4 text-center text-sm text-muted-foreground">
            No tienes notificaciones nuevas
          </p>
        {:else}
          {#each notificaciones as noti (noti.id)}
            <DropdownMenu.Item class="flex flex-col items-start gap-0.5 py-2">
              <span class="text-sm font-medium">{noti.titulo}</span>
              <span class="text-xs text-muted-foreground">{noti.detalle}</span>
              <span class="text-[11px] text-muted-foreground/70"
                >{noti.tiempo}</span
              >
            </DropdownMenu.Item>
          {/each}
        {/if}

        <DropdownMenu.Separator />
        <DropdownMenu.Item>
          {#snippet child({ props })}
            <a
              href="/notificaciones"
              {...props}
              class="w-full text-center text-xs font-medium text-primary ml-2"
            >
              Ver todas las notificaciones
            </a>
          {/snippet}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>

    <UserNav />
  </div>
</header>
