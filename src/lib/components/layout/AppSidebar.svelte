<script lang="ts">
  import { getContext } from "svelte";
  import { page } from "$app/stores";
  import { cn } from "$lib/utils.js";

  // ⚠️ useSidebar se IMPORTA DIRECTAMENTE por nombre (no como Sidebar.useSidebar)
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { useSidebar } from "$lib/components/ui/sidebar/index.js";

  import type { NavSection } from "$lib/utils/menu";

  // ──────────────────────────────────────────────────────
  // CONTEXTO
  // ──────────────────────────────────────────────────────
  const menuSecciones = getContext<NavSection[]>("menuItems");
  const sidebar = useSidebar(); // 🔥 Reactivo: state, isMobile, toggle()...

  // ──────────────────────────────────────────────────────
  // HELPER: link activo
  // ──────────────────────────────────────────────────────
  function esActivo(urlItem: string): boolean {
    const rutaActual = $page.url.pathname;
    if (urlItem === "/dashboard") return rutaActual === "/dashboard";
    return rutaActual === urlItem || rutaActual.startsWith(urlItem + "/");
  }
</script>

<!-- ============================================================== -->
<!-- ROOT: collapsible = "icon" (colapsar a iconos)                 -->
<!-- ============================================================== -->
<Sidebar.Root collapsible="icon" variant="sidebar">

  <!-- =================== HEADER (Logo) =================== -->
  <Sidebar.Header class="border-sidebar-border">
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <!-- ⚠️ MenuItem NO usa snippets: children DIRECTO -->
        <Sidebar.MenuButton
          size="lg"
          class="!h-12 data-[active=true]:bg-transparent data-[state=open]:bg-transparent"
        >
          <!-- Logo -->
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18" />
              <path d="M7 14l4-4 4 4 5-5" />
            </svg>
          </div>
          <span class="truncate font-semibold tracking-tight text-sidebar-foreground">Mis Ventas</span>
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>

  <!-- =================== CONTENT (Menú) =================== -->
  <Sidebar.Content>

    {#each menuSecciones as seccion (seccion.sectionTitle ?? "seccion-sin-titulo")}

      <Sidebar.Group>

        {#if seccion.sectionTitle}
          <Sidebar.GroupLabel>{seccion.sectionTitle}</Sidebar.GroupLabel>
        {/if}

        <Sidebar.GroupContent>
          <Sidebar.Menu>

            {#each seccion.items as item (item.url)}

              <Sidebar.MenuItem>

                <!-- 🔥 MENU BUTTON con PROP ISACTIVE + TOOLTIP INTEGRADO -->
                <!-- Prop `child` = snippet que recibe los props de accesibilidad -->
                <Sidebar.MenuButton
                  isActive={esActivo(item.url ?? "")}
                  tooltipContent={item.title}
                  class={cn(
                    esActivo(item.url ?? "") &&
                      "!bg-sidebar-primary !text-sidebar-primary-foreground hover:!bg-sidebar-primary hover:!text-sidebar-primary-foreground"
                  )}
                >
                  {#snippet child({ props }: { props: Record<string, unknown> })}
                    <!-- Aquí el <a> REAL, con todos los props fusionados -->
                    <a href={item.url} {...props}>
                      <item.icon class="h-4 w-4 shrink-0" />
                      <span class="flex-1 truncate">{item.title}</span>
                      <!-- Badge OFICIAL: se oculta solo cuando colapsa -->
                      {#if item.badge}
                        <Sidebar.MenuBadge>{item.badge}</Sidebar.MenuBadge>
                      {/if}
                    </a>
                  {/snippet}
                </Sidebar.MenuButton>

              </Sidebar.MenuItem>

            {/each}

          </Sidebar.Menu>
        </Sidebar.GroupContent>

      </Sidebar.Group>

    {/each}

  </Sidebar.Content>

  <!-- =================== FOOTER =================== -->
  <Sidebar.Footer class="border-sidebar-border">
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton class="text-left data-[active=true]:bg-transparent">
          <span class="text-xs font-medium text-sidebar-foreground">Versión 1.0.0</span>
          <span class="truncate text-[10px] text-sidebar-foreground/60">© 2025 Mis Ventas</span>
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Footer>

</Sidebar.Root>
