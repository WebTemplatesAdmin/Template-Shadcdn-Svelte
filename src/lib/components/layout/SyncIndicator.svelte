<!-- src/lib/components/layout/SyncIndicator.svelte -->
<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { Button } from "$lib/components/ui/button/index.js";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";

  let ultimaActualizacion = $state(new Date());
  let sincronizando = $state(false);
  let tiempoRelativo = $state("Ahora mismo");

  function calcularTiempoRelativo() {
    const segundos = Math.floor((Date.now() - ultimaActualizacion.getTime()) / 1000);
    if (segundos < 10) return "Ahora mismo";
    if (segundos < 60) return `Hace ${segundos} seg`;
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `Hace ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    return `Hace ${horas} h`;
  }

  async function sincronizar() {
    sincronizando = true;
    await invalidateAll();
    ultimaActualizacion = new Date();
    sincronizando = false;
  }

  $effect(() => {
    const interval = setInterval(() => {
      tiempoRelativo = calcularTiempoRelativo();
    }, 5000);
    return () => clearInterval(interval);
  });
</script>

<div class="hidden items-center gap-1.5 text-xs text-muted-foreground lg:flex">
  <span>{tiempoRelativo}</span>
  <Button
    variant="ghost"
    size="icon"
    class="h-6 w-6"
    onclick={sincronizar}
    disabled={sincronizando}
    title="Actualizar datos"
  >
    <RefreshCw class="h-3.5 w-3.5 {sincronizando ? 'animate-spin' : ''}" />
  </Button>
</div>