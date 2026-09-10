<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import type { SuperForm } from "sveltekit-superforms";

  let {
    form,
    name,
    label,
    type = "text",
    placeholder = "",
    class: className = "",
    value = $bindable()
  }: {
    form: SuperForm<any>;
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    class?: string;
    value?: string;
  } = $props();
</script>

<Form.Field {form} {name}>
  <Form.Control>
    {#snippet children({ props })}
      <Form.Label>{label}</Form.Label>
      <Input
        {...props}
        {type}
        {placeholder}
        bind:value
      />
    {/snippet}
  </Form.Control>
  <Form.FieldErrors class="text-xs" />
</Form.Field>
