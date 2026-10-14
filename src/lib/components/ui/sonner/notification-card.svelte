<script lang="ts">
  import CircleCheck from "@lucide/svelte/icons/circle-check";
  import CircleX from "@lucide/svelte/icons/circle-x";
  import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
  import Info from "@lucide/svelte/icons/info";
  import X from "@lucide/svelte/icons/x";
  import { cn } from "$lib/utils.js";

  type TipoNotificacion = "success" | "error" | "warning" | "info";

  let {
    tipo = "success",
    titulo,
    descripcion,
    duracion = 5000,
    cerrar,
  }: {
    tipo?: TipoNotificacion;
    titulo: string;
    descripcion?: string;
    /** Duración (ms) que debe coincidir con la del toast para la barra de progreso. */
    duracion?: number;
    /** Callback para cerrar el toast (lo inyecta el helper). */
    cerrar?: () => void;
  } = $props();

  const CONFIG = {
    success: {
      Icono: CircleCheck,
      badge: "bg-emerald-500/10 text-emerald-500",
      barra: "bg-emerald-500",
    },
    error: {
      Icono: CircleX,
      badge: "bg-destructive/10 text-destructive",
      barra: "bg-destructive",
    },
    warning: {
      Icono: TriangleAlert,
      badge: "bg-amber-500/10 text-amber-500",
      barra: "bg-amber-500",
    },
    info: {
      Icono: Info,
      badge: "bg-blue-500/10 text-blue-500",
      barra: "bg-blue-500",
    },
  } as const;

  const cfg = $derived(CONFIG[tipo] ?? CONFIG.success);
  const Icono = $derived(cfg.Icono);
</script>

<!-- Tarjeta de notificación (un mismo diseño para todos los tipos) -->
<div
  class="pointer-events-auto w-full overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-lg"
>
  <div class="flex items-start gap-3 p-4">
    <span
      class={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full",
        cfg.badge,
      )}
    >
      <Icono class="h-5 w-5" />
    </span>

    <div class="min-w-0 flex-1 pt-0.5">
      <p class="text-sm font-semibold leading-tight">{titulo}</p>
      {#if descripcion}
        <p class="mt-1 text-xs leading-snug text-muted-foreground">
          {descripcion}
        </p>
      {/if}
    </div>

    <button
      type="button"
      aria-label="Cerrar notificación"
      onclick={cerrar}
      class="-mr-1 -mt-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <X class="h-4 w-4" />
    </button>
  </div>

  <!-- Barra de progreso (auto-cierre) -->
  <div class={cn("h-1 w-full opacity-15", cfg.barra)}>
    <div
      class={cn("toast-progress h-full", cfg.barra)}
      style="--toast-duracion: {duracion}ms"
    ></div>
  </div>
</div>

<style>
  .toast-progress {
    transform-origin: left;
    animation: toast-progress var(--toast-duracion, 5000ms) linear forwards;
  }

  @keyframes toast-progress {
    from {
      transform: scaleX(1);
    }
    to {
      transform: scaleX(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .toast-progress {
      animation: none;
    }
  }
</style>
