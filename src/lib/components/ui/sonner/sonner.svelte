<script lang="ts">
  import { Toaster as Sonner, type ToasterProps } from "svelte-sonner";
  import { cn } from "$lib/utils.js";

  let { class: className, toastOptions, ...restProps }: ToasterProps = $props();
</script>

<!--
  Wrapper de svelte-sonner.
  El aspecto (tarjeta + acentos por tipo) se define con tokens en layout.css
  para los toasts estándar; los de confirmación usan una tarjeta propia
  (notification-card.svelte) vía toast.custom.
-->
<Sonner
  position="bottom-right"
  closeButton
  class={cn("toaster group", className)}
  toastOptions={{
    descriptionClass: "!text-muted-foreground",
    classes: {
      title: "!text-sm !font-semibold",
      description: "!text-xs",
      actionButton:
        "!rounded-md !bg-primary !text-primary-foreground !text-xs !font-medium",
      cancelButton:
        "!rounded-md !bg-muted !text-muted-foreground !text-xs !font-medium",
      closeButton:
        "!rounded-full !border !border-border !bg-card !text-muted-foreground",
    },
    ...toastOptions,
  }}
  {...restProps}
/>
