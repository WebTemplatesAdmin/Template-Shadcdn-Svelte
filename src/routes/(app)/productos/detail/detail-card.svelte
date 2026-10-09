<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import { cn } from "$lib/utils.js";

  let {
    title,
    icon: Icono,
    variant = "default",
    children,
    class: className = "",
  }: {
    title: string;
    icon?: Component<{ class?: string }>;
    variant?: "default" | "primary";
    children: Snippet;
    class?: string;
  } = $props();
</script>

<!-- Tarjeta de sección de solo lectura: mismo patrón del proyecto -->
<section
  class={cn(
    "rounded-lg border p-6",
    variant === "primary"
      ? "border-primary/20 bg-primary/5 dark:bg-primary/10"
      : "bg-card",
    className,
  )}
>
  <h2
    class={cn(
      "mb-4 flex items-center gap-2 text-sm font-medium",
      variant === "primary" ? "text-foreground" : "text-muted-foreground",
    )}
  >
    {#if Icono}
      <Icono class="h-4 w-4 text-primary" />
    {/if}
    {title}
  </h2>

  {@render children()}
</section>
