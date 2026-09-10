<!-- src/lib/components/images/SalesIllustration.svelte -->
<script lang="ts">
  let { class: className = "" }: { class?: string } = $props();
</script>

<svg viewBox="190 120 320 320" xmlns="http://www.w3.org/2000/svg" class={className} role="img">
  <title>Ilustración de ventas</title>
  <desc>Una bolsa de compras con una línea de crecimiento ascendente</desc>
  <rect x="260" y="220" width="160" height="160" rx="16" fill="#ffffff" fill-opacity="0.12" />
  <path d="M290 220 L290 195 Q290 170 315 170 L365 170 Q390 170 390 195 L390 220" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="14" stroke-linecap="round" />
  <rect x="285" y="255" width="110" height="8" rx="4" fill="#ffffff" opacity="0.5" />
  <rect x="285" y="275" width="80" height="8" rx="4" fill="#ffffff" opacity="0.5" />
  <path d="M240 400 L300 340 L340 375 L440 260" fill="none" stroke="#5eb1ff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M410 260 L440 260 L440 290" fill="none" stroke="#5eb1ff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="240" cy="400" r="8" fill="#5eb1ff" />
  <circle cx="300" cy="340" r="8" fill="#5eb1ff" />
  <circle cx="340" cy="375" r="8" fill="#5eb1ff" />
  <circle cx="440" cy="260" r="8" fill="#5eb1ff" />
</svg>