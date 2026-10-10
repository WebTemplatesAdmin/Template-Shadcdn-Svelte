<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { cn } from "$lib/utils.js";
  import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
  import Loader2 from "@lucide/svelte/icons/loader-2";

  let {
    open = $bindable(false),
    title = "¿Estás seguro?",
    description = "Esta acción no se puede deshacer.",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = "destructive",
    icon: Icono = TriangleAlert,
    loading = false,
    children,
    onConfirm,
  }: {
    open?: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    /** "destructive" para acciones peligrosas (rojo), "default" para el resto. */
    variant?: "destructive" | "default";
    /** Icono superior; `null` para ocultarlo. */
    icon?: Component<{ class?: string }> | null;
    /** Muestra un spinner y deshabilita las acciones (ej. al confirmar async). */
    loading?: boolean;
    /** Contenido extra opcional (ej. "escribe el nombre para confirmar"). */
    children?: Snippet;
    onConfirm: () => void | Promise<void>;
  } = $props();
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <div class="flex items-start gap-3">
        {#if Icono}
          <span
            class={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              variant === "destructive"
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Icono class="h-5 w-5" />
          </span>
        {/if}
        <div class="space-y-1.5">
          <AlertDialog.Title>{title}</AlertDialog.Title>
          <AlertDialog.Description>{description}</AlertDialog.Description>
        </div>
      </div>
    </AlertDialog.Header>

    {#if children}
      <div class="py-2">
        {@render children()}
      </div>
    {/if}

    <AlertDialog.Footer>
      <AlertDialog.Cancel disabled={loading}>{cancelText}</AlertDialog.Cancel>
      <AlertDialog.Action
        onclick={onConfirm}
        disabled={loading}
        class={cn(
          variant === "destructive" &&
            "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        )}
      >
        {#if loading}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        {confirmText}
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
