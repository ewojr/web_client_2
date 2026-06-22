import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">{t('common.notFoundDescription')}</p>
      <Link to="/login" className={cn(buttonVariants({ variant: 'outline' }))}>
        {t('common.backToLogin')}
      </Link>
    </div>
  )
}
