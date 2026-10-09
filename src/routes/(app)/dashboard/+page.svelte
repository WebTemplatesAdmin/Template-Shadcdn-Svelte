<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Dashboard · Mis Ventas</title>
</svelte:head>

<h1>Dashboard</h1>

<p>¡Bienvenido a tu dashboard!</p>
