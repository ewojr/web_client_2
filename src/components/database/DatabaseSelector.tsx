import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown, Lock, Search } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import type { DatabaseCompact } from '@/api/types'

interface DatabaseSelectorProps {
  databases: DatabaseCompact[]
  currentDatabaseId: string | null
  currentDatabaseName?: string
  onSelect: (dbId: string) => void
}

export function DatabaseSelector({
  databases,
  currentDatabaseId,
  currentDatabaseName,
  onSelect,
}: DatabaseSelectorProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')

  const filtered = filter
    ? databases.filter((db) => db.name.toLowerCase().includes(filter.toLowerCase()))
    : databases

  function handleSelect(dbId: string) {
    onSelect(dbId)
    setOpen(false)
    setFilter('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
      >
        <Lock className="h-3.5 w-3.5 text-amber-400" />
        <span className="hidden max-w-48 truncate sm:inline">{currentDatabaseName || t('database.select')}</span>
        <ChevronDown className="h-3.5 w-3.5 text-white/60" />
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t('database.searchPlaceholder')}
              className="pl-9"
            />
          </div>
        </div>

        <div className="px-3 pb-1">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t('database.available')}
          </span>
        </div>

        <div className="max-h-64 overflow-y-auto p-1">
          {filtered.map((db) => {
            const isSelected = db.id === currentDatabaseId
            return (
              <button
                key={db.id}
                onClick={() => handleSelect(db.id)}
                className={`flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent ${
                  isSelected ? 'bg-accent' : ''
                }`}
              >
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{db.name}</div>
                  {db.description && (
                    <div className="truncate text-xs text-muted-foreground">
                      {db.description}
                    </div>
                  )}
                </div>
                {isSelected && <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />}
              </button>
            )
          })}

          {filtered.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              {t('database.noResults')}
            </div>
          )}
        </div>

        <div className="border-t px-3 py-2 text-center text-xs text-muted-foreground">
          {databases.length} {t('database.accessible')}
        </div>
      </PopoverContent>
    </Popover>
  )
}
