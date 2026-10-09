<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/utils.js";

  let {
    label,
    value,
    mono = false,
    children,
  }: {
    label: string;
    value?: string | number | null;
    mono?: boolean;
    children?: Snippet;
  } = $props();
</script>

<!-- Par etiqueta/valor de solo lectura (dentro de un <dl>) -->
<div class="flex items-start justify-between gap-4 text-sm">
  <dt class="text-muted-foreground">{label}</dt>
  <dd
    class={cn("text-right font-medium text-foreground", mono && "font-mono")}
  >
    {#if children}
      {@render children()}
    {:else}
      {value ?? "—"}
    {/if}
  </dd>
</div>
