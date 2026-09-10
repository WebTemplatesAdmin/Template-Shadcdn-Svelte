<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import Eye from "@lucide/svelte/icons/eye";
  import EyeOff from "@lucide/svelte/icons/eye-off";
  import { cn } from "$lib/utils.js";
  import type { SuperForm } from "sveltekit-superforms";


let mostrarPassword = $state(false);

 let {
  form,
  name,
  label,
  type = "text",
  placeholder = "",
  description,
  required = false,
  disabled = false,

  class: fieldClass = "",
  inputClass = "",
  labelClass = "",
  errorsClass = "text-xs",

  value = $bindable(),

  ...restProps
}: {
  form: SuperForm<any>;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  class?: string;
  inputClass?: string;
  labelClass?: string;
  errorsClass?: string;
  value?: any;
  [key: string]: unknown;
} = $props();

 const tipoRealInput = $derived(
    type === "password" && mostrarPassword ? "text" : type
  );

  const esPassword = $derived(type === "password");

</script>

<Form.Field {form} {name} class={cn(fieldClass)}>
  <Form.Control>
    {#snippet children({ props })}

      <Form.Label class={cn(labelClass)}>
        {label}
        {#if required}
          <span class="ml-0.5 text-destructive">*</span>
        {/if}
      </Form.Label>

      <div class="relative">

        <Input
          {...{
            ...props,
            ...restProps,
            type: tipoRealInput,
            placeholder,
            required,
            disabled,
            class: cn(inputClass, esPassword && "pr-10"),
          } as any}
          bind:value
        />

        {#if esPassword}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            class="absolute right-0 top-0 h-full aspect-square opacity-70 hover:opacity-100 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={disabled}
            onclick={() => (mostrarPassword = !mostrarPassword)}
            aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {#if mostrarPassword}
              <EyeOff class="h-4 w-4 text-muted-foreground" />
            {:else}
              <Eye class="h-4 w-4 text-muted-foreground" />
            {/if}
          </Button>
        {/if}

      </div>

      {#if description}
        <Form.Description class="text-xs text-muted-foreground">
          {description}
        </Form.Description>
      {/if}

    {/snippet}
  </Form.Control>
  <Form.FieldErrors class={errorsClass} />
</Form.Field>
