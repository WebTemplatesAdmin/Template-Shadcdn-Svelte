<script lang="ts">
  import { getContext } from "svelte";
  import {
    Avatar,
    AvatarImage,
    AvatarFallback,
  } from "$lib/components/ui/avatar/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import {
    User as UserIcon,
    Settings2 as SettingsIcon,
    LogOut as LogOutIcon,
    ChevronDown,
  } from "@lucide/svelte";

  type UsuarioActivo = {
    nombre: string;
    email: string;
    rol: string;
    iniciales: string;
  };

  type ContextoUsuario = {
  usuario: UsuarioActivo;
};
  const ctx = getContext<ContextoUsuario>("usuarioActivo");
  const usuario = $derived(ctx.usuario);
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button
      {...props}
        variant="ghost"
        class="h-9 gap-2 rounded-full px-1.5 py-1.5 data-[state=open]:bg-muted"
      >
        <Avatar class="h-7 w-7 rounded-md">
          <AvatarFallback
            class="bg-muted text-xs font-semibold text-foreground"
          >
            {usuario.iniciales}
          </AvatarFallback>
        </Avatar>
        <div class="hidden flex-col items-start leading-tight sm:flex">
          <span class="text-sm font-medium">{usuario.nombre}</span>
          <span class="text-[11px] text-muted-foreground">{usuario.rol}</span>
        </div>
        <ChevronDown
          class="hidden h-3.5 w-3.5 text-muted-foreground sm:block"
        />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>

  <DropdownMenu.Content class="w-64" align="end" sideOffset={8}>
    <div class="flex flex-col gap-1 border-b border-border p-3 text-sm">
      <p class="font-medium leading-none">{usuario.nombre}</p>
      <p class="text-xs text-muted-foreground leading-none">{usuario.email}</p>
    </div>

    <DropdownMenu.Label>Cuenta</DropdownMenu.Label>

    <DropdownMenu.Item>
      <UserIcon class="h-4 w-4 me-2" />
      <span>Mi perfil</span>
    </DropdownMenu.Item>

    <DropdownMenu.Item>
      <SettingsIcon class="h-4 w-4 me-2" />
      <span>Configuración</span>
    </DropdownMenu.Item>

    <DropdownMenu.Separator />

    <DropdownMenu.Item variant="destructive" class="!p-0">
      <form method="POST" action="/logout" class="w-full">
        <button
          type="submit"
          class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm focus:bg-destructive/10 focus:outline-none"
        >
          <LogOutIcon class="h-4 w-4 me-2" />
          <span>Cerrar sesión</span>
        </button>
      </form>
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
