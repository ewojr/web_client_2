import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Settings, Globe, LogOut, User, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { OptionsDialog } from '@/components/options/OptionsDialog'
import { UserProfilePanel } from '@/components/profile/UserProfilePanel'
import { DatabaseSelector } from '@/components/database/DatabaseSelector'
import { useOptionsStore } from '@/stores/optionsStore'
import { useAuthStore } from '@/stores/authStore'
import { useVaultAppBarStore } from '@/hooks/useVaultAppBar'
import { LANGUAGES } from '@/i18n/languages'

export function AppBar() {
  const vault = useVaultAppBarStore((s) => s.vault)
  const { t, i18n } = useTranslation()
  const setLanguage = useOptionsStore((s) => s.setLanguage)
  const currentLang = useOptionsStore((s) => s.language)
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const storeLogout = useAuthStore((s) => s.logout)

  const [showOptions, setShowOptions] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  // `language` is null until the user explicitly picks one — fall back to the
  // active (browser-detected) i18n language so the UI reflects reality.
  const effectiveLang = currentLang ?? i18n.language
  const currentLangLabel =
    LANGUAGES.find((l) => l.code === effectiveLang)?.label ?? effectiveLang.slice(0, 2).toUpperCase()
  const currentDb = vault?.databases.find((db) => db.id === vault.currentDatabaseId)

  const initials = user?.display_name
    ? user.display_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.name?.slice(0, 2).toUpperCase() ?? '?'

  function handleLogout() {
    // Explicit user sign-out: revoke the token server-side and fan the logout
    // out to other tabs (both handled inside the store).
    storeLogout({ broadcast: true, revoke: true })
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-1.5 border-b bg-brand px-2 sm:gap-3 sm:px-4">
        {/* App icon — doubles as mobile menu button in vault mode */}
        <button
          className="shrink-0 rounded-md p-1 transition-colors hover:bg-white/10"
          onClick={vault?.showMenuButton ? vault.onMenuClick : undefined}
          title="Password Depot"
        >
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Password Depot" className="h-8 w-8" />
        </button>

        {/* App name text */}
        <span className="hidden text-lg font-normal text-white sm:inline">Password Depot</span>

        {/* Vault controls — only when authenticated */}
        {vault && isAuthenticated && (
          <>
            <DatabaseSelector
              databases={vault.databases}
              currentDatabaseId={vault.currentDatabaseId}
              currentDatabaseName={currentDb?.name}
              onSelect={vault.onDatabaseChange}
            />

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search */}
            <div className="relative w-40 sm:w-56 md:w-72">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={vault.searchQuery}
                onChange={(e) => vault.onSearchChange(e.target.value)}
                placeholder={t('vault.search')}
                className="border-white/30 bg-white pl-9 pr-8 text-foreground placeholder:text-muted-foreground focus-visible:border-white/60 focus-visible:ring-white/30"
              />
              {vault.searchQuery && (
                <button
                  onClick={() => vault.onSearchChange('')}
                  aria-label={t('vault.clearSearch')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </>
        )}

        {/* Spacer when not in vault */}
        {!vault && <div className="flex-1" />}

        {/* Right side controls */}
        <div className="flex items-center gap-1">
          {/* Language selector — hidden on mobile, available in Options dialog */}
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={t('header.language')}
              className="hidden items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:inline-flex"
            >
              <Globe className="h-4 w-4" />
              <span>{currentLangLabel}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={effectiveLang === lang.code ? 'font-medium' : ''}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Options */}
          <button
            aria-label={t('header.options')}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            onClick={() => setShowOptions(true)}
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* User Menu — only when authenticated */}
          {isAuthenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-2 rounded-md px-2 py-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-white/20 text-xs text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm md:inline">{user.display_name || user.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowProfile(true)}>
                  <User className="mr-2 h-4 w-4" />
                  {t('header.profile')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('header.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      <OptionsDialog open={showOptions} onClose={() => setShowOptions(false)} />
      <UserProfilePanel open={showProfile} onClose={() => setShowProfile(false)} />
    </>
  )
}
