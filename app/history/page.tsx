import Link from 'next/link'
import { desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ArrowLeft, ArrowRight, History, MapPin, CalendarDays } from 'lucide-react'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { queryHistory } from '@/lib/db/schema'

export default async function HistoryPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in?returnTo=%2Fhistory')

  const rows = await db
    .select()
    .from(queryHistory)
    .where(eq(queryHistory.userId, session.user.id))
    .orderBy(desc(queryHistory.createdAt))
    .limit(100)

  return (
    <main className="min-h-screen bg-[#f4f6f5] px-5 py-8 text-[#14273a] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-[860px]">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#5e747e] transition hover:text-[#087f77]"><ArrowLeft aria-hidden="true" className="size-4" /> 비교 화면으로 돌아가기</Link>
        <div className="mt-7 flex items-start gap-3 rounded-[24px] border border-[#e5ebe8] bg-white p-5 shadow-[0_8px_30px_rgba(26,48,56,0.04)] sm:p-7">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#eaf5f2] text-[#087f77]"><History aria-hidden="true" className="size-5" /></span>
          <div><p className="text-xs font-bold tracking-[0.12em] text-[#168279]">ACCOUNT</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">내 질문 이력</h1><p className="mt-2 text-sm leading-6 text-[#778792]">{session.user.name}님이 성공적으로 비교한 조건이에요. 선택하면 현재 데이터로 다시 비교합니다.</p></div>
        </div>

        {rows.length ? (
          <ol className="mt-5 flex flex-col gap-3">
            {rows.map((row) => (
              <li key={row.id}>
                <Link href={`/?replay=${encodeURIComponent(row.id)}`} className="group flex flex-col gap-4 rounded-2xl border border-[#e4eae7] bg-white p-4 shadow-[0_4px_18px_rgba(31,54,61,0.025)] transition hover:border-[#b7d0c8] hover:shadow-[0_8px_24px_rgba(31,54,61,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#137f78] sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-bold leading-6 text-[#2c4354]">{row.question}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-medium text-[#7a8b94]">
                      <span className="inline-flex items-center gap-1"><MapPin aria-hidden="true" className="size-3.5" /> {row.districtType} · {row.userType}</span>
                      <span className="inline-flex items-center gap-1"><CalendarDays aria-hidden="true" className="size-3.5" /> {row.startMonth}{row.startMonth !== row.endMonth ? ` — ${row.endMonth}` : ''}</span>
                      <time dateTime={row.createdAt.toISOString()}>{new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(row.createdAt)}</time>
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-[#f1f7f4] px-3.5 py-2.5 text-xs font-bold text-[#28766d] transition group-hover:bg-[#e4f1eb] sm:self-auto">다시 비교 <ArrowRight aria-hidden="true" className="size-3.5 transition group-hover:translate-x-0.5" /></span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-5 rounded-[24px] border border-dashed border-[#d7e2de] bg-white px-6 py-12 text-center">
            <History aria-hidden="true" className="mx-auto size-7 text-[#8da29b]" />
            <h2 className="mt-4 font-bold">저장된 질문이 아직 없어요</h2>
            <p className="mt-2 text-sm leading-6 text-[#778792]">비교를 완료하면 질문과 검색 조건이 이곳에 저장됩니다.</p>
            <Link href="/" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#087f77] px-4 text-sm font-bold text-white hover:bg-[#076c66]">첫 비교 시작하기 <ArrowRight aria-hidden="true" className="size-4" /></Link>
          </div>
        )}
        <p className="mt-5 text-xs leading-5 text-[#8a989f]">최근 100개 질문만 표시됩니다. 각 이력은 로그인한 계정에서만 볼 수 있습니다.</p>
      </div>
    </main>
  )
}
