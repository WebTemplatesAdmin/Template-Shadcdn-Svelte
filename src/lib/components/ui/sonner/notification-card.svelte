<script lang="ts">
  import CircleCheck from "@lucide/svelte/icons/circle-check";
  import X from "@lucide/svelte/icons/x";

  let {
    titulo,
    descripcion,
    duracion = 5000,
    cerrar,
  }: {
    titulo: string;
    descripcion?: string;
    /** Duración (ms) que debe coincidir con la del toast para la barra de progreso. */
    duracion?: number;
    /** Callback para cerrar el toast (lo inyecta el helper). */
    cerrar?: () => void;
  } = $props();
</script>

<!-- Tarjeta de confirmación (estilo "notification card") -->
<div
  class="pointer-events-auto w-full overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-lg"
>
  <div class="flex items-start gap-3 p-4">
    <span
      class="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"
    >
      <CircleCheck class="h-5 w-5" />
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
  <div class="h-1 w-full bg-emerald-500/15">
    <div
      class="toast-progress h-full bg-emerald-500"
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
</style>
