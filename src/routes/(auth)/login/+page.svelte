<script lang="ts">
  import { superForm } from "sveltekit-superforms";
  import { zod4Client } from "sveltekit-superforms/adapters";
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
  import { loginSchema } from "./schema";
  import type { PageData } from "./$types";

  import SalesIllustration from "$lib/components/images/SalesIllustration.svelte";
  import InputFieldV2 from "$lib/components/InputsFormCustom/InputFieldV2.svelte";

  let { data }: { data: PageData } = $props();

  // svelte-ignore state_referenced_locally: falso positivo conocido de Superforms — superForm() solo necesita el valor inicial de data.form, no reactividad continua.
  const form = superForm(data.form, {
    validators: zod4Client(loginSchema),
    validationMethod: "auto",
    autoFocusOnError: true,
  });
  const { form: formData, enhance, submitting,reset } = form;
</script>

<div class="grid min-h-screen grid-cols-1 md:grid-cols-2">
  <div class="flex flex-col justify-center px-8 py-12 md:px-16">
    <div class="mx-auto w-full max-w-sm">
      <h1 class="mb-1 text-2xl font-semibold">Bienvenido de nuevo</h1>
      <p class="mb-8 text-sm text-muted-foreground">
        Ingresa tus datos para continuar
      </p>

      <form method="POST" class="space-y-5" use:enhance novalidate>
        <!-- <Form.Field {form} name="email">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Correo electrónico</Form.Label>
              <Input
                {...props}
                type="email"
                placeholder="nombre@tienda.com"
                bind:value={$formData.email}
              />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors class="text-xs" />
        </Form.Field> -->

        <InputFieldV2
          {form}
          name="email"
          label="Correo electrónico"
          type="email"
          placeholder="nombreee@tienda.com"
          required
          autocomplete="email"
          bind:value={$formData.email}
        />

        <!-- <Form.Field {form} name="password">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Contraseña</Form.Label>
              <Input
                {...props}
                type="password"
                placeholder="••••••••"
                bind:value={$formData.password}
              />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors class="text-xs" />
        </Form.Field> -->

        <InputFieldV2
          {form}
          name="password"
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          required
          autocomplete="current-password"
          bind:value={$formData.password}
        />

        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center gap-2">
            <Checkbox />
            <span class="text-muted-foreground">Recordarme</span>
          </label>
        </div>

        <Button type="submit" class="w-full">Iniciar sesión</Button>
         <Button type="button" variant="outline" class="w-full" onclick={() => reset()}>
            Cancelar
          </Button>
      </form>

      <!--  <p class="mt-6 text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?
        <a href="/register" class="text-primary hover:underline">Regístrate</a>
      </p> -->
    </div>
  </div>

  <div
    class="relative hidden flex-col items-center justify-center gap-8 overflow-hidden bg-slate-900 p-12 md:flex"
  >
    <div
      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-primary/10"
    ></div>

    <h1 class="relative text-4xl font-semibold text-white mb-4">Mis Ventas</h1>

    <div class="relative h-72 w-72">
      <SalesIllustration class="h-full w-full" />

      <div
        class="absolute -right-8 top-2 flex items-center gap-2 rounded-xl bg-background px-3.5 py-2.5 shadow-md"
      >
        <svg
          class="h-[18px] w-[18px] text-green-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 17l6-6 4 4 8-8M17 7h4v4"
          />
        </svg>
        <div>
          <p class="text-[11px] text-muted-foreground">Este mes</p>
          <p class="text-sm font-medium">+24% ventas</p>
        </div>
      </div>

      <div
        class="absolute -left-10 bottom-5 flex items-center gap-2 rounded-xl bg-background px-3.5 py-2.5 shadow-md"
      >
        <svg
          class="h-[18px] w-[18px] text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m-10-4h10"
          />
        </svg>
        <p class="text-sm font-medium">128 pedidos hoy</p>
      </div>
    </div>

    <div class="relative max-w-xs text-center">
      <h2 class="mb-2 text-lg font-medium text-white">Haz crecer tu negocio</h2>
      <p class="text-sm text-white">
        Gestiona tus productos, pedidos y ventas desde un solo lugar, en tiempo
        real.
      </p>
    </div>
  </div>
</div>