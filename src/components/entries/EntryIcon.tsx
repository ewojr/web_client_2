import { useState } from 'react'
import {
  Key,
  CreditCard,
  FileText,
  UserCircle,
  Info,
  Landmark,
  File,
  Monitor,
  Terminal,
  Radio,
  Settings,
  Fingerprint,
  Folder,
  type LucideIcon,
} from 'lucide-react'
import type { EntryType } from '@/api/types'
import { getIconUrl } from '@/lib/icons'

const ENTRY_TYPE_ICONS: Record<EntryType | 'folder', { icon: LucideIcon; color: string }> = {
  password: { icon: Key, color: 'text-amber-600' },
  credit_card: { icon: CreditCard, color: 'text-blue-600' },
  license: { icon: FileText, color: 'text-green-600' },
  identity: { icon: UserCircle, color: 'text-indigo-600' },
  information: { icon: Info, color: 'text-cyan-600' },
  banking: { icon: Landmark, color: 'text-emerald-600' },
  document: { icon: File, color: 'text-orange-600' },
  rdp: { icon: Monitor, color: 'text-purple-600' },
  putty: { icon: Terminal, color: 'text-gray-600' },
  teamviewer: { icon: Radio, color: 'text-blue-500' },
  custom: { icon: Settings, color: 'text-gray-500' },
  passkey: { icon: Fingerprint, color: 'text-violet-600' },
  folder: { icon: Folder, color: 'text-amber-600' },
}

interface EntryIconProps {
  type: EntryType | 'folder'
  /** Icon filename from the server (e.g. "ico12.svg", "favicon_github.png") */
  icon?: string
  className?: string
}

export function EntryIcon({ type, icon, className = 'h-5 w-5' }: EntryIconProps) {
  // Track the URL that failed to load, not just a boolean. EntryIcon instances
  // are reused across entry selection, so a stale boolean would force the
  // generic fallback for every subsequently selected entry. Comparing against
  // the current URL resets the failure automatically when the icon changes.
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const iconUrl = getIconUrl(icon)
  const imgFailed = failedUrl === iconUrl

  // Show server icon if available and not failed
  if (iconUrl && !imgFailed) {
    return (
      <img
        src={iconUrl}
        alt=""
        className={`${className} shrink-0 object-contain`}
        onError={() => setFailedUrl(iconUrl)}
      />
    )
  }

  // Fallback to Lucide icon by entry type
  const config = ENTRY_TYPE_ICONS[type] ?? ENTRY_TYPE_ICONS.password
  const Icon = config.icon
  return <Icon className={`${className} shrink-0 ${config.color}`} />
}
