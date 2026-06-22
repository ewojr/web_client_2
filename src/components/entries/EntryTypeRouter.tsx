import type { EntryDetail } from '@/api/types'
import { PasswordDetail } from './types/PasswordDetail'
import { CreditCardDetail } from './types/CreditCardDetail'
import { LicenseDetail } from './types/LicenseDetail'
import { IdentityDetail } from './types/IdentityDetail'
import { InformationDetail } from './types/InformationDetail'
import { BankingDetail } from './types/BankingDetail'
import { DocumentDetail } from './types/DocumentDetail'
import { RdpDetail } from './types/RdpDetail'
import { PuttyDetail } from './types/PuttyDetail'
import { TeamViewerDetail } from './types/TeamViewerDetail'
import { PasskeyDetail } from './types/PasskeyDetail'

interface EntryTypeRouterProps {
  entry: EntryDetail
}

export function EntryTypeRouter({ entry }: EntryTypeRouterProps) {
  switch (entry.type) {
    case 'password':
    case 'custom':
      return <PasswordDetail entry={entry} />
    case 'credit_card':
      return <CreditCardDetail entry={entry} />
    case 'license':
      return <LicenseDetail entry={entry} />
    case 'identity':
      return <IdentityDetail entry={entry} />
    case 'information':
      return <InformationDetail entry={entry} />
    case 'banking':
      return <BankingDetail entry={entry} />
    case 'document':
      return <DocumentDetail entry={entry} />
    case 'rdp':
      return <RdpDetail entry={entry} />
    case 'putty':
      return <PuttyDetail entry={entry} />
    case 'teamviewer':
      return <TeamViewerDetail entry={entry} />
    case 'passkey':
      return <PasskeyDetail entry={entry} />
    default:
      return (
        <div className="py-4 text-center text-sm text-muted-foreground">
          Entry type not supported in web client.
        </div>
      )
  }
}
