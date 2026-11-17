import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { AuthForm } from '@/components/auth-form'
import { auth } from '@/lib/auth'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams
  const redirectTo = typeof params.returnTo === 'string' ? params.returnTo : '/'
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect(redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/')
  return <AuthForm mode="sign-in" redirectTo={redirectTo} />
}
