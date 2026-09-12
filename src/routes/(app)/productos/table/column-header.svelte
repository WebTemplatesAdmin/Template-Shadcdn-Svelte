<!-- src/routes/(app)/productos/table/column-header.svelte -->
<script lang="ts">
  import ArrowUpDown from "@lucide/svelte/icons/arrow-up-down";
  import ArrowUp from "@lucide/svelte/icons/arrow-up";
  import ArrowDown from "@lucide/svelte/icons/arrow-down";
  import { Button } from "$lib/components/ui/button/index.js";

  let { column, title }: { column: any; title: string } = $props();
</script>

<Button
  variant="ghost"
  size="sm"
  class="-ml-3 h-8"
  onclick={() => column.toggleSorting(column.getIsSorted() === "asc")}
>
  <span>{title}</span>
  {#if column.getIsSorted() === "asc"}
    <ArrowUp class="ml-2 h-4 w-4" />
  {:else if column.getIsSorted() === "desc"}
    <ArrowDown class="ml-2 h-4 w-4" />
  {:else}
    <ArrowUpDown class="ml-2 h-4 w-4" />
  {/if}
</Button>