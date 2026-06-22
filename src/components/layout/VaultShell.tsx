import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import { useMediaQuery } from '@/hooks/useMediaQuery'

interface VaultShellProps {
  sidebar: ReactNode
  content: ReactNode
  /** Detail panel — shown inline on desktop, as a sheet on smaller screens */
  detail?: ReactNode
  /** Info panel — shown inline on desktop when no entry is selected, hidden on mobile */
  infoPanel?: ReactNode
  statusBar: ReactNode
  sidebarOpen: boolean
  onSidebarOpenChange: (open: boolean) => void
  /** Whether an entry is selected (controls detail sheet visibility on mobile) */
  detailOpen: boolean
  /** Called when the detail sheet is closed on mobile */
  onDetailClose: () => void
}

function ResizeHandle() {
  return (
    <Separator className="w-px bg-border transition-colors hover:bg-primary/40 active:bg-primary/60" />
  )
}

export function VaultShell({
  sidebar,
  content,
  detail,
  infoPanel,
  statusBar,
  sidebarOpen,
  onSidebarOpenChange,
  detailOpen,
  onDetailClose,
}: VaultShellProps) {
  const { t } = useTranslation()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isTablet = useMediaQuery('(min-width: 768px)')

  // On desktop, show detail or infoPanel inline in the right panel
  const rightPanel = detail ?? infoPanel

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Main content area */}
      <div className="flex min-h-0 flex-1">
        {isTablet ? (
          <Group orientation="horizontal" id="vault-panels">
            {/* Sidebar */}
            <Panel id="sidebar" defaultSize="18%" minSize="12%" maxSize="30%">
              <aside className="flex h-full flex-col bg-card">
                <ScrollArea className="flex-1">{sidebar}</ScrollArea>
              </aside>
            </Panel>

            <ResizeHandle />

            {/* Center content */}
            <Panel id="content" minSize="30%">
              <main className="flex h-full flex-col">
                <ScrollArea className="flex-1">{content}</ScrollArea>
              </main>
            </Panel>

            {/* Right panel — desktop only inline (entry detail or info panel) */}
            {rightPanel && isDesktop && (
              <>
                <ResizeHandle />
                <Panel id="detail" defaultSize="28%" minSize="20%" maxSize="45%">
                  <aside className="flex h-full flex-col bg-card">
                    <ScrollArea className="flex-1">{rightPanel}</ScrollArea>
                  </aside>
                </Panel>
              </>
            )}
          </Group>
        ) : (
          <>
            {/* Mobile: sidebar as sheet */}
            <Sheet open={sidebarOpen} onOpenChange={onSidebarOpenChange}>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <ScrollArea className="h-full">{sidebar}</ScrollArea>
              </SheetContent>
            </Sheet>

            {/* Center content */}
            <main className="flex min-w-0 flex-1 flex-col">
              <ScrollArea className="flex-1">{content}</ScrollArea>
            </main>
          </>
        )}

        {/* Detail sheet for tablet/mobile — only when an entry is selected */}
        {!isDesktop && detail && (
          <Sheet open={detailOpen} onOpenChange={(open) => { if (!open) onDetailClose() }}>
            <SheetContent side="right" className="w-80 p-0 sm:w-96">
              <SheetTitle className="sr-only">{t('entry.detailsTitle')}</SheetTitle>
              <ScrollArea className="h-full">{detail}</ScrollArea>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Status bar */}
      <footer className="flex h-8 shrink-0 items-center border-t bg-muted/30 px-4 text-xs text-muted-foreground">
        {statusBar}
      </footer>
    </div>
  )
}
