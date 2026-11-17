'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

type Props = {
  mode: 'sign-in' | 'sign-up'
  redirectTo: string
}

export function AuthForm({ mode, redirectTo }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isSignUp = mode === 'sign-up'
  const destination = redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/'

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const result = isSignUp
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password })
      if (result.error) {
        setError(isSignUp
          ? '계정을 만들지 못했어요. 이메일 주소를 확인하거나 이미 가입한 계정인지 확인해 주세요.'
          : '이메일 또는 비밀번호를 확인해 주세요.')
        return
      }
      router.replace(destination)
      router.refresh()
    } catch {
      setError('요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f6f5] px-5 py-10 text-[#14273a]">
      <div className="w-full max-w-[440px]">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#5e747e] transition hover:text-[#087f77]"><ArrowLeft aria-hidden="true" className="size-4" /> 제주 주말소비로 돌아가기</Link>
        <section className="rounded-[26px] border border-[#e5ebe8] bg-white p-6 shadow-[0_12px_38px_rgba(26,48,56,0.07)] sm:p-8">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#e8f4f1] text-[#087e77]"><LockKeyhole aria-hidden="true" className="size-5" /></span>
          <p className="mt-5 text-xs font-bold tracking-[0.14em] text-[#168279]">JEJU WEEKEND DATA</p>
          <h1 className="mt-2 text-[27px] font-extrabold tracking-[-0.05em]">{isSignUp ? '계정 만들기' : '다시 만나서 반가워요'}</h1>
          <p className="mt-2 text-sm leading-6 text-[#73838f]">{isSignUp ? '질문 이력을 계정에 안전하게 저장해 보세요.' : '로그인해 저장된 질문 이력을 확인하세요.'}</p>

          <form onSubmit={submit} className="mt-7 flex flex-col gap-4">
            {isSignUp && <label className="flex flex-col gap-2 text-sm font-semibold text-[#455b6a]">이름<span className="relative"><UserRound aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#91a0a6]" /><input autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} maxLength={80} className="h-12 w-full rounded-xl border border-[#dfe7e3] bg-white pl-10 pr-3 text-sm font-normal text-[#283f50] outline-none transition focus:border-[#62a99e] focus:ring-4 focus:ring-[#e8f4f0]" placeholder="이름" /></span></label>}
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#455b6a]">이메일<span className="relative"><Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#91a0a6]" /><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} className="h-12 w-full rounded-xl border border-[#dfe7e3] bg-white pl-10 pr-3 text-sm font-normal text-[#283f50] outline-none transition focus:border-[#62a99e] focus:ring-4 focus:ring-[#e8f4f0]" placeholder="name@example.com" /></span></label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#455b6a]">비밀번호<span className="relative"><LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#91a0a6]" /><input type={showPassword ? 'text' : 'password'} autoComplete={isSignUp ? 'new-password' : 'current-password'} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-xl border border-[#dfe7e3] bg-white pl-10 pr-12 text-sm font-normal text-[#283f50] outline-none transition focus:border-[#62a99e] focus:ring-4 focus:ring-[#e8f4f0]" placeholder="8자 이상" /><button type="button" aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#788993] hover:bg-[#f2f6f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#137f78]">{showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}</button></span></label>
            {error && <p role="alert" className="rounded-xl border border-[#f1d8d5] bg-[#fff7f6] px-3.5 py-3 text-sm leading-5 text-[#9f514d]">{error}</p>}
            <button disabled={isSubmitting} type="submit" className="mt-1 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#087f77] px-5 text-sm font-bold text-white transition hover:bg-[#076c66] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d8efea] disabled:cursor-wait disabled:opacity-65">{isSubmitting ? '처리 중…' : isSignUp ? '계정 만들기' : '로그인'}</button>
          </form>

          <p className="mt-5 text-center text-sm text-[#778792]">{isSignUp ? '이미 계정이 있나요?' : '처음이신가요?'}{' '}
            <Link href={isSignUp ? '/sign-in' : '/sign-up'} className="font-bold text-[#087f77] underline decoration-[#acd2c7] underline-offset-4 hover:text-[#076c66]">{isSignUp ? '로그인' : '계정 만들기'}</Link>
          </p>
        </section>
        <p className="mt-5 text-center text-xs leading-5 text-[#91a0a6]">이메일과 비밀번호는 계정 인증 및 질문 이력 저장에만 사용됩니다.</p>
      </div>
    </main>
  )
}
