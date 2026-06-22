import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/auth/LoginForm'
import { StatusFooter } from '@/components/layout/StatusFooter'

export default function LoginPage() {
  const { t } = useTranslation()

  return (
    <>
      <div className="flex flex-1 items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{t('login.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
      <StatusFooter />
    </>
  )
}
