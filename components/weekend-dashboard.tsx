'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Bot,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Database,
  History,
  LogOut,
  MapPin,
  MessageCircleQuestion,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { aggregateObservations, interpretQuestion, resolveIntentComparison, validateFilters } from '@/lib/jeju/aggregate'
import type { ComparisonResult, DatasetMetadata, Filters, Observation } from '@/lib/jeju/types'

type ComparisonResponse = ComparisonResult & {
  intent: 'compare' | 'monthly' | 'availability'
  dataset: DatasetMetadata
}

type Props = {
  user: { id: string; name: string; email: string } | null
  isAdmin: boolean
  initialFilters: Filters
  initialQuestion?: string
  initialResult?: ComparisonResponse | null
  initialError?: string | null
  initialObservations?: Observation[]
  initialDataset?: DatasetMetadata
}

const initialSelection: Filters = {
  districtType: '제주시',
  userType: '내국인',
  startMonth: '2016-09',
  endMonth: '2017-11',
}

const sampleFilters: Filters = {
  districtType: '제주시',
  userType: '내국인',
  startMonth: '2017-04',
  endMonth: '2017-04',
}
const sampleQuestion = '2017년 4월 제주시 구도심 내국인 비교'

const quickExamples = [
  { label: '17년 11월 제주시 내국인 (+288)', question: '17년 11월 제주 구도심 내국인 토·일 비교해줘' },
  { label: '그럼 서귀포는? (+998)', question: '그럼 서귀포는?' },
  { label: '그 차이가 매달 비슷했어?', question: '그 차이가 매달 비슷했어?' },
  { label: '어느 달까지 볼 수 있어?', question: '어느 달까지 볼 수 있어?' },
]

type JejuDatasetPayload = {
  datasetId: number
  coverage: { startMonth: string; endMonth: string }
  data: Array<{
    districtType: string
    userType: string
    dtYearMonth: string
    dtWeek: string
    useCount: number
  }>
}

function formatDatasetMonth(month: string) {
  return /^\d{6}$/.test(month) ? `${month.slice(0, 4)}-${month.slice(4)}` : month
}

async function readAttachedDataset() {
  const response = await fetch('/jeju-weekend-608.json', { cache: 'force-cache' })
  if (!response.ok) throw new Error('제주데이터허브 608 JSON을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')

  const payload = await response.json() as JejuDatasetPayload
  if (payload.datasetId !== 608 || !Array.isArray(payload.data)) {
    throw new Error('제주데이터허브 608 JSON 형식을 확인해 주세요.')
  }

  const observations: Observation[] = payload.data.map((row) => ({
    districtType: row.districtType,
    userType: row.userType,
    dtYearMonth: formatDatasetMonth(row.dtYearMonth),
    dtWeek: row.dtWeek,
    useCount: String(row.useCount),
  }))
  const metadata: DatasetMetadata = {
    source: 'preview-file',
    version: 'jejudatahub-608-201609-201711',
    rowCount: observations.length,
    observedStart: formatDatasetMonth(payload.coverage.startMonth),
    observedEnd: formatDatasetMonth(payload.coverage.endMonth),
    collectedAt: null,
  }

  return { observations, metadata }
}

function number(value: number) {
  return value.toLocaleString('ko-KR')
}

function monthLabel(month: string) {
  return month.replace('-', '년 ') + '월'
}

function SourceBadge({ dataset }: { dataset: DatasetMetadata }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dce7e4] bg-[#f3f8f6] px-3 py-1.5 text-xs font-semibold text-[#45645f]">
      <Database aria-hidden="true" className="size-3.5" />
      {dataset.source === 'database' ? 'DB 데이터' : '제주데이터허브 608 JSON'}
    </span>
  )
}

export function WeekendDashboard({
  user,
  isAdmin,
  initialFilters,
  initialQuestion = '',
  initialResult = null,
  initialError = null,
  initialObservations,
  initialDataset,
}: Props) {
  const router = useRouter()
  const [filters, setFilters] = useState<Filters>(initialFilters ?? initialSelection)
  const [question, setQuestion] = useState(initialQuestion)
  const [result, setResult] = useState<ComparisonResponse | null>(initialResult)
  const [previousFilters, setPreviousFilters] = useState<Filters | null>(initialResult?.filters ?? null)
  const [error, setError] = useState<{ kind: 'invalid' | 'server'; message: string } | null>(
    initialError ? { kind: 'invalid', message: initialError } : null,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [aiInsight, setAiInsight] = useState<string | null>(null)
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)

  async function requestAiInsight() {
    if (!result || isGeneratingAi) return
    setIsGeneratingAi(true)
    try {
      const response = await fetch('/api/ai/insight', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          districtType: result.filters.districtType,
          userType: result.filters.userType,
          period: `${monthLabel(result.filters.startMonth)}${result.filters.startMonth !== result.filters.endMonth ? ` — ${monthLabel(result.filters.endMonth)}` : ''}`,
          saturdayTotal: result.saturdayTotal,
          sundayTotal: result.sundayTotal,
          difference: result.difference,
          summary: result.summary,
        }),
      })
      if (response.ok) {
        const data = await response.json()
        if (data.insight) {
          setAiInsight(data.insight)
        }
      }
    } catch {
      // safe ignore
    } finally {
      setIsGeneratingAi(false)
    }
  }

  async function compare(nextFilters = filters, nextQuestion = question) {
    setIsLoading(true)
    setError(null)
    setAiInsight(null)
    try {
      // 1. 활성 DB 버전 기반의 실시간 API 비교 (로그인 사용자는 검색 이력 자동 적재)
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: nextQuestion, filters: nextFilters, previousFilters }),
      })

      if (response.ok) {
        const nextResult = (await response.json()) as ComparisonResponse
        setResult(nextResult)
        setFilters(nextResult.filters)
        if (nextResult.status === 'success') {
          setPreviousFilters(nextResult.filters)
        }
        return
      }

      if (response.status === 422 || response.status === 400) {
        const errPayload = (await response.json().catch(() => ({}))) as { error?: string }
        const message = errPayload.error ?? '입력 조건을 확인해 주세요.'
        setError({ kind: 'invalid', message })
        setResult(null)
        return
      }

      throw new Error('API 서버 연결이 원활하지 않아 로컬 데이터셋으로 전환합니다.')
    } catch {
      // 2. 서버 미연결/오프라인 환경 시 로컬 데이터셋 폴백 집계
      try {
        const dataset = initialObservations && initialDataset
          ? { observations: initialObservations, metadata: initialDataset }
          : await readAttachedDataset()
        const interpreted = interpretQuestion(nextQuestion, validateFilters(nextFilters), previousFilters)
        const comparison = resolveIntentComparison(dataset.observations, interpreted)

        const nextResult: ComparisonResponse = {
          ...comparison,
          intent: interpreted.intent,
          requestedPeriod: interpreted.requestedPeriod,
          dataset: dataset.metadata,
        }
        setResult(nextResult)
        setFilters(nextResult.filters)
        if (nextResult.status === 'success') {
          setPreviousFilters(nextResult.filters)
        }
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : '비교 결과를 불러오지 못했어요.'
        const kind = /선택해 주세요|입력해 주세요|늦을 수|조회 기간은|형식을 확인/.test(message) ? 'invalid' : 'server'
        setError({ kind, message })
        setResult(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void compare()
  }

  function submitQuestionOnEnter(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      if (event.nativeEvent.isComposing || event.keyCode === 229) return
      event.preventDefault()
      void compare()
    }
  }

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  async function runExample() {
    setFilters(sampleFilters)
    setQuestion(sampleQuestion)
    await compare(sampleFilters, sampleQuestion)
  }

  async function runQuickQuery(text: string) {
    setQuestion(text)
    await compare(filters, text)
  }

  async function signOut() {
    setIsSigningOut(true)
    await authClient.signOut()
    router.refresh()
    setIsSigningOut(false)
  }

  const resultBarMax = result
    ? Math.max(result.saturdayTotal, result.sundayTotal, 1)
    : 1

  return (
    <div className="min-h-screen bg-[#f4f6f5] text-[#14273a]">
      <header className="border-b border-[#e7ebe9] bg-white/90">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#005BAC]">
            <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-[14px] bg-[#EFF6FF] text-[#005BAC]">
              <span className="size-3 rounded-full border-[3px] border-current" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[11px] font-bold tracking-[0.05em] text-[#005BAC]">(재)제주테크노파크 빅데이터 센터</span>
              <span className="text-[16px] font-extrabold tracking-[-0.04em]">제주 구도심 주말소비 분석 콘솔</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-1.5 text-xs font-bold text-[#334155] transition hover:bg-[#F8FAFC] sm:inline-flex"
            >
              서비스 소개 홈
            </Link>
            {user ? (
              <details className="relative group">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-[#e2e8e5] bg-white py-1.5 pl-2 pr-3 text-sm font-semibold shadow-sm outline-none transition hover:border-[#bfd6d0] focus-visible:ring-2 focus-visible:ring-[#137f78] [&::-webkit-details-marker]:hidden">
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#eef3f2] text-[#46635d]"><UserRound aria-hidden="true" className="size-4" /></span>
                  <span className="max-w-[112px] truncate sm:max-w-none">{user.name}</span>
                  <ChevronDown aria-hidden="true" className="size-4 text-[#788997] transition group-open:rotate-180" />
                </summary>
                <nav aria-label="계정 메뉴" className="absolute right-0 top-[calc(100%+8px)] z-20 flex min-w-[190px] flex-col gap-1 rounded-2xl border border-[#e4eae7] bg-white p-2 shadow-[0_16px_40px_rgba(23,43,55,0.12)]">
                  <Link href="/history" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[#33485a] hover:bg-[#f3f7f5]"><History aria-hidden="true" className="size-4" /> 질문 이력</Link>
                  {isAdmin && <Link href="/admin" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[#33485a] hover:bg-[#f3f7f5]"><ShieldCheck aria-hidden="true" className="size-4" /> 관리자 화면</Link>}
                  <button type="button" onClick={() => void signOut()} disabled={isSigningOut} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#7f4c4b] hover:bg-[#fff4f2] disabled:opacity-60"><LogOut aria-hidden="true" className="size-4" /> {isSigningOut ? '로그아웃 중…' : '로그아웃'}</button>
                </nav>
              </details>
            ) : (
              <Link href="/sign-in" className="inline-flex items-center gap-2 rounded-full border border-[#dce5e1] bg-white px-4 py-2.5 text-sm font-semibold text-[#31495a] transition hover:border-[#9ebbb2] hover:bg-[#f8fbf9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#137f78]">
                <UserRound aria-hidden="true" className="size-4" /> 로그인
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1160px] px-4 pb-14 pt-6 sm:px-8 sm:pt-12">
        <section className="mb-8 grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#dce9e5] bg-white px-3 py-1.5 text-[11px] font-bold tracking-[0.12em] text-[#55756e]">
              <Sparkles aria-hidden="true" className="size-3.5 text-[#0e8a7d]" />
              JEJU DATAHUB 608
            </div>
            <h1 className="max-w-[700px] text-[28px] font-extrabold leading-[1.2] tracking-[-0.05em] text-[#14273a] sm:text-[43px]">
              주말의 소비 차이를<br className="hidden sm:block" /> 한눈에 비교해요
            </h1>
            <p className="mt-4 max-w-[620px] text-[15px] leading-7 text-[#647786] sm:text-base">
              제주 구도심의 카드 결제 건수로 토요일과 일요일의 흐름을 살펴보세요.
              질문하거나 조건을 직접 골라 비교할 수 있어요.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-2xl border border-[#e3eae7] bg-white px-4 py-3 text-sm text-[#516676] shadow-[0_4px_18px_rgba(31,54,61,0.035)] md:self-end">
            <CalendarDays aria-hidden="true" className="size-4 text-[#0d8178]" />
            <span>공식 수집 기간 <strong className="ml-1 font-bold text-[#263d4f]">2016.09 — 2017.11</strong></span>
          </div>
        </section>

        <section aria-labelledby="query-title" className="rounded-[26px] border border-[#e5ebe8] bg-white p-5 shadow-[0_8px_30px_rgba(26,48,56,0.045)] sm:p-7">
          <div className="mb-5 flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#edf7f4] text-[#0a847a]"><MessageCircleQuestion aria-hidden="true" className="size-[18px]" /></span>
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-[#168279]">01 · 질문 입력</p>
              <h2 id="query-title" className="mt-1 text-lg font-bold tracking-[-0.03em]">어떤 비교가 궁금하세요?</h2>
            </div>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-5">
            <div className="rounded-2xl border border-[#dce6e2] bg-[#fbfcfb] p-3 transition focus-within:border-[#84b9ae] focus-within:ring-4 focus-within:ring-[#e8f4f0]">
              <label htmlFor="question" className="sr-only">비교할 내용을 질문으로 입력</label>
              <textarea
                id="question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={submitQuestionOnEnter}
                placeholder="예: 2017년 11월 제주시 구도심 내국인 비교"
                rows={2}
                maxLength={500}
                className="min-h-[58px] w-full resize-y border-0 bg-transparent px-2 py-2 text-[15px] leading-6 text-[#263d4f] outline-none placeholder:text-[#95a2aa] focus:ring-0"
              />

              {previousFilters && (
                <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-xl border border-[#d5e7e1] bg-[#f2f8f6] px-3 py-2 text-xs text-[#2e5950]">
                  <span className="font-bold text-[#107e74]">직전 조건 유지:</span>
                  <span className="font-semibold text-[#183a33]">
                    {previousFilters.districtType} 구도심 · {previousFilters.userType} · {monthLabel(previousFilters.startMonth)}{previousFilters.startMonth !== previousFilters.endMonth ? ` — ${monthLabel(previousFilters.endMonth)}` : ''}
                  </span>
                  <span className="text-[11px] text-[#5e7e77]">(후속 질문 “그럼 서귀포는?”, “그 차이는?” 질문 시 관광객·기간 자동 승계)</span>
                </div>
              )}

              <div className="flex flex-col gap-2 border-t border-[#edf0ee] pt-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="px-2 text-xs leading-5 text-[#83919a]">지역·관광객·월을 포함해 자연스럽게 질문해 보세요.</span>
                <button type="submit" disabled={isLoading} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#087f77] px-5 text-sm font-bold text-white transition hover:bg-[#076c66] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d8efea] disabled:cursor-wait disabled:opacity-70 sm:w-auto">
                  {isLoading ? <RefreshCw aria-hidden="true" className="size-4 animate-spin" /> : <ArrowRight aria-hidden="true" className="size-4" />}
                  {isLoading ? '비교 중…' : '비교 결과 보기'}
                </button>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#344c5e]"><span className="flex size-5 items-center justify-center rounded-full bg-[#f0f4f2] text-[11px] text-[#688079]">02</span> 직접 선택</div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className="flex flex-col gap-2 text-xs font-semibold text-[#687b87]">
                  <span className="inline-flex items-center gap-1.5"><MapPin aria-hidden="true" className="size-3.5 text-[#768a96]" /> 지역</span>
                  <select value={filters.districtType} onChange={(event) => updateFilter('districtType', event.target.value as Filters['districtType'])} className="h-12 w-full rounded-xl border border-[#e1e8e5] bg-white px-3 text-sm font-semibold text-[#283f50] outline-none transition focus:border-[#62a99e] focus:ring-4 focus:ring-[#e8f4f0]">
                    <option value="제주시">제주시 구도심</option>
                    <option value="서귀포시">서귀포시 구도심</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-xs font-semibold text-[#687b87]">
                  <span className="inline-flex items-center gap-1.5"><UserRound aria-hidden="true" className="size-3.5 text-[#768a96]" /> 관광객 유형</span>
                  <select value={filters.userType} onChange={(event) => updateFilter('userType', event.target.value as Filters['userType'])} className="h-12 w-full rounded-xl border border-[#e1e8e5] bg-white px-3 text-sm font-semibold text-[#283f50] outline-none transition focus:border-[#62a99e] focus:ring-4 focus:ring-[#e8f4f0]">
                    <option value="내국인">내국인</option>
                    <option value="중국인">중국인 관광객</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-xs font-semibold text-[#687b87]">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays aria-hidden="true" className="size-3.5 text-[#768a96]" /> 시작월</span>
                  <input type="month" min="2016-09" max="2017-11" value={filters.startMonth} onChange={(event) => updateFilter('startMonth', event.target.value)} className="h-12 w-full rounded-xl border border-[#e1e8e5] bg-white px-3 text-sm font-semibold text-[#283f50] outline-none transition focus:border-[#62a99e] focus:ring-4 focus:ring-[#e8f4f0]" />
                </label>
                <label className="flex flex-col gap-2 text-xs font-semibold text-[#687b87]">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays aria-hidden="true" className="size-3.5 text-[#768a96]" /> 종료월</span>
                  <input type="month" min="2016-09" max="2017-11" value={filters.endMonth} onChange={(event) => updateFilter('endMonth', event.target.value)} className="h-12 w-full rounded-xl border border-[#e1e8e5] bg-white px-3 text-sm font-semibold text-[#283f50] outline-none transition focus:border-[#62a99e] focus:ring-4 focus:ring-[#e8f4f0]" />
                </label>
              </div>
              <div className="mt-3 flex justify-end">
                <button type="button" onClick={() => void compare(filters, '')} disabled={isLoading} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#d8e8e2] bg-[#f6faf8] px-4 text-sm font-bold text-[#41645d] transition hover:border-[#a6c8bd] hover:bg-[#eff7f3] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#e8f4f0] disabled:cursor-wait disabled:opacity-60 sm:w-auto">
                  직접 선택으로 비교
                </button>
              </div>
            </div>
          </form>

          <div className="mt-5 flex flex-col gap-2.5 border-t border-[#edf0ee] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="shrink-0 text-xs font-semibold text-[#82909a]">빠른 예시 질문</span>
            <div className="flex flex-wrap items-center gap-2">
              {quickExamples.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => void runQuickQuery(item.question)}
                  disabled={isLoading}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-[#d8e8e2] bg-[#f6faf8] px-3.5 py-2 text-left text-xs font-semibold text-[#41645d] transition hover:border-[#a6c8bd] hover:bg-[#eff7f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#137f78] disabled:opacity-60"
                >
                  <Sparkles aria-hidden="true" className="size-3 text-[#0b8a7f]" />
                  <span>{item.label}</span>
                  <ArrowRight aria-hidden="true" className="size-3 transition group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="result-title" className="mt-6 scroll-mt-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#e7f2ef] text-[#0a847a]"><Check aria-hidden="true" className="size-4" /></span>
            <h2 id="result-title" className="text-lg font-bold tracking-[-0.03em]">03 · 비교 결과</h2>
          </div>

          {isLoading ? (
            <div aria-live="polite" className="flex min-h-[260px] flex-col items-center justify-center rounded-[26px] border border-[#e5ebe8] bg-white px-6 text-center shadow-[0_8px_30px_rgba(26,48,56,0.035)]">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[#eaf5f2] text-[#087f77]"><RefreshCw aria-hidden="true" className="size-5 animate-spin" /></span>
              <h3 className="mt-4 text-base font-bold">조건에 맞는 데이터를 모으고 있어요</h3>
              <p className="mt-2 text-sm text-[#778794]">요일별 유효 건수를 확인하는 중입니다.</p>
            </div>
          ) : error ? (
            <div role="alert" className={`rounded-[26px] border p-6 sm:p-8 ${error.kind === 'invalid' ? 'border-[#f1dfc4] bg-[#fffaf3]' : 'border-[#f0d9d7] bg-[#fff7f6]'}`}>
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${error.kind === 'invalid' ? 'bg-[#fff0d9] text-[#9b6a28]' : 'bg-[#fde9e6] text-[#ad5b56]'}`}><MessageCircleQuestion aria-hidden="true" className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold">{error.kind === 'invalid' ? '입력 조건을 확인해 주세요' : '결과를 불러오지 못했어요'}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-[#6e7880]">{error.message}</p>
                  <button type="button" onClick={() => void compare()} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-current/20 bg-white px-4 text-sm font-bold text-[#395665] transition hover:bg-[#f8faf9]"><RefreshCw aria-hidden="true" className="size-4" /> 같은 조건으로 다시 비교</button>
                </div>
              </div>
            </div>
          ) : result ? (
            <div className="rounded-[26px] border border-[#e5ebe8] bg-white p-5 shadow-[0_8px_30px_rgba(26,48,56,0.045)] sm:p-7">
              <div className="flex flex-col gap-4 border-b border-[#edf0ee] pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#73838f]">
                    <span>{result.filters.districtType} 구도심</span><span aria-hidden="true" className="text-[#b4bec4]">·</span><span>{result.filters.userType}</span><span aria-hidden="true" className="text-[#b4bec4]">·</span><span>{monthLabel(result.filters.startMonth)}{result.filters.startMonth !== result.filters.endMonth ? ` — ${monthLabel(result.filters.endMonth)}` : ''}</span>
                  </div>
                  <p className="mt-3 text-xs font-bold tracking-[0.08em] text-[#168279]">적용 조건</p>
                  <h3 className="mt-1 text-xl font-extrabold leading-snug tracking-[-0.04em] sm:text-2xl">{result.summary}</h3>
                </div>
                <SourceBadge dataset={result.dataset} />
              </div>

              {result.requestedPeriod && (
                <p className="mt-4 rounded-xl bg-[#fff8eb] px-4 py-3 text-sm leading-6 text-[#735424]">
                  요청 기간은 {monthLabel(result.requestedPeriod.startMonth)}부터 {monthLabel(result.requestedPeriod.endMonth)}까지예요.
                  공식 수집 기간과 겹치는 {monthLabel(result.filters.startMonth)}부터 {monthLabel(result.filters.endMonth)}까지 조회했어요.
                </p>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f0f8f5] p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3"><span className="inline-flex items-center gap-2 text-sm font-bold text-[#287e75]"><span className="size-2.5 rounded-full bg-[#11998e]" /> 토요일</span><span className="text-xs font-medium text-[#65847d]">선택 월 합계</span></div>
                  <p className="mt-3 text-[27px] font-extrabold tracking-[-0.05em] text-[#17483f] sm:text-[32px]">{number(result.saturdayTotal)}<span className="ml-1 text-sm font-bold tracking-normal">건</span></p>
                </div>
                <div className="rounded-2xl bg-[#eff4fb] p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3"><span className="inline-flex items-center gap-2 text-sm font-bold text-[#3c68a3]"><span className="size-2.5 rounded-full bg-[#4d7fca]" /> 일요일</span><span className="text-xs font-medium text-[#6e829c]">선택 월 합계</span></div>
                  <p className="mt-3 text-[27px] font-extrabold tracking-[-0.05em] text-[#213f68] sm:text-[32px]">{number(result.sundayTotal)}<span className="ml-1 text-sm font-bold tracking-normal">건</span></p>
                </div>
              </div>

              {result.status !== 'empty' && (
                <div className="mt-5 rounded-2xl border border-[#d6e7e2] bg-[#f4faf7] p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-[#e2f1ec] text-[#0a847a]">
                        <Bot aria-hidden="true" className="size-4" />
                      </span>
                      <div>
                        <h4 className="text-xs font-bold tracking-[0.08em] text-[#127e74]">GEMINI AI 상권 브리핑</h4>
                        <p className="text-xs text-[#526f68]">제주데이터허브 공공데이터 기반 소상공인 맞춤 조언</p>
                      </div>
                    </div>
                    {!aiInsight && (
                      <button
                        type="button"
                        onClick={() => void requestAiInsight()}
                        disabled={isGeneratingAi}
                        className="inline-flex min-h-9 items-center justify-center gap-1.5 self-start rounded-xl bg-[#0a847a] px-3.5 text-xs font-bold text-white transition hover:bg-[#086f67] disabled:opacity-60 sm:self-auto"
                      >
                        {isGeneratingAi ? <RefreshCw aria-hidden="true" className="size-3.5 animate-spin" /> : <Sparkles aria-hidden="true" className="size-3.5" />}
                        {isGeneratingAi ? 'AI 브리핑 생성 중…' : 'AI 상권 조언 받기'}
                      </button>
                    )}
                  </div>
                  {aiInsight && (
                    <div className="mt-3.5 rounded-xl border border-[#cbe3db] bg-white p-4 text-sm leading-6 text-[#294c44] shadow-sm">
                      <p className="font-medium">{aiInsight}</p>
                    </div>
                  )}
                </div>
              )}

              {result.status === 'empty' ? (
                <div className="mt-5 rounded-2xl border border-dashed border-[#d8e2de] bg-[#fafcfb] px-4 py-8 text-center">
                  <CalendarDays aria-hidden="true" className="mx-auto size-6 text-[#95a7a1]" />
                  <h4 className="mt-3 text-sm font-bold">비교할 수 있는 월이 없습니다</h4>
                  <p className="mt-1 text-sm leading-6 text-[#788792]">선택한 조건에서 토요일과 일요일을 모두 확인할 수 있는 월이 없어요. 지역·관광객 유형·월 범위를 조정해 주세요.</p>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-[#e7ece9] p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold">요일별 결제 건수</h4>
                      <p className="mt-1 text-xs text-[#83919a]">기준선 0 · 선택 범위의 유효 월 합계</p>
                    </div>
                    <span className="text-[11px] font-semibold text-[#82909a]">단위: 건</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[76px_minmax(0,1fr)_auto] sm:gap-3">
                      <span className="text-xs font-bold text-[#287e75]">토요일</span>
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="text-[10px] font-medium text-[#9aa7ad]">0</span>
                        <div
                          role="progressbar"
                          aria-label={`토요일 결제 건수 ${number(result.saturdayTotal)}건`}
                          aria-valuenow={result.saturdayTotal}
                          aria-valuemin={0}
                          aria-valuemax={resultBarMax}
                          className="h-3.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#edf2ef]"
                        >
                          <div
                            className="h-full rounded-full bg-[#11998e] transition-[width] duration-300"
                            style={{ width: `${Math.max(2, (result.saturdayTotal / resultBarMax) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <strong className="text-sm font-bold tabular-nums text-[#31594f]">{number(result.saturdayTotal)}</strong>
                    </div>
                    <div className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[76px_minmax(0,1fr)_auto] sm:gap-3">
                      <span className="text-xs font-bold text-[#3c68a3]">일요일</span>
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="text-[10px] font-medium text-[#9aa7ad]">0</span>
                        <div
                          role="progressbar"
                          aria-label={`일요일 결제 건수 ${number(result.sundayTotal)}건`}
                          aria-valuenow={result.sundayTotal}
                          aria-valuemin={0}
                          aria-valuemax={resultBarMax}
                          className="h-3.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#edf2f8]"
                        >
                          <div
                            className="h-full rounded-full bg-[#4d7fca] transition-[width] duration-300"
                            style={{ width: `${Math.max(2, (result.sundayTotal / resultBarMax) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <strong className="text-sm font-bold tabular-nums text-[#39577e]">{number(result.sundayTotal)}</strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                  <div><h4 className="text-sm font-bold">월별 비교</h4><p className="mt-1 text-xs text-[#83919a]">토요일 − 일요일</p></div>
                  {result.latestCompleteMonth && <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3f6f5] px-3 py-1.5 text-[11px] font-semibold text-[#60757d]"><Clock3 aria-hidden="true" className="size-3.5" /> 최신 비교 가능 {monthLabel(result.latestCompleteMonth)}</span>}
                </div>
                {result.rows.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-[#e7ece9]">
                    <table className="w-full min-w-[290px] border-collapse text-left text-sm">
                      <thead className="bg-[#f7f9f8] text-xs font-semibold text-[#71818c]">
                        <tr>
                          <th scope="col" className="px-3 py-3 sm:px-4">월</th>
                          <th scope="col" className="px-2.5 py-3 text-right sm:px-3">토요일</th>
                          <th scope="col" className="px-2.5 py-3 text-right sm:px-3">일요일</th>
                          <th scope="col" className="px-3 py-3 text-right sm:px-4">차이</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.map((row) => (
                          <tr key={row.month} className="border-t border-[#edf0ee] hover:bg-[#fafbfb]">
                            <th scope="row" className="whitespace-nowrap px-3 py-3.5 font-bold text-[#405568] sm:px-4">{monthLabel(row.month)}</th>
                            <td className="px-2.5 py-3.5 text-right font-semibold tabular-nums text-[#287e75] sm:px-3">{number(row.saturday)}</td>
                            <td className="px-2.5 py-3.5 text-right font-semibold tabular-nums text-[#3c68a3] sm:px-3">{number(row.sunday)}</td>
                            <td className={`px-3 py-3.5 text-right font-bold tabular-nums sm:px-4 ${row.difference > 0 ? 'text-[#168279]' : row.difference < 0 ? 'text-[#496fa5]' : 'text-[#71818c]'}`}>
                              {row.difference > 0 ? '+' : ''}{number(row.difference)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-[#dce5e1] bg-[#fafcfb] px-4 py-4 text-sm text-[#778792]">유효한 월별 행이 없습니다. 아래 제외 사유를 확인해 주세요.</p>
                )}
              </div>

              <details className="mt-5 rounded-2xl border border-[#e7ece9] bg-[#fbfcfb] p-4">
                <summary className="cursor-pointer text-sm font-bold text-[#425b6c] outline-none focus-visible:ring-2 focus-visible:ring-[#137f78]">계산 근거와 데이터 범위</summary>
                <div className="mt-4 flex flex-col gap-3 text-xs leading-6 text-[#6d7f89]">
                  <p>계산: 유효한 월마다 토요일과 일요일의 결제 건수를 각각 한 번씩 합산하고, 차이는 토요일 합계 − 일요일 합계로 계산했어요. 값 0도 유효한 관측값입니다.</p>
                  <p>공식 수집 기간은 {result.officialPeriod.start.replace('-', '.')}–{result.officialPeriod.end.replace('-', '.')}이고, 현재 데이터 버전의 실제 관측 기간은 {result.dataset.observedStart && result.dataset.observedEnd ? `${result.dataset.observedStart.replace('-', '.')}–${result.dataset.observedEnd.replace('-', '.')}` : '확인되지 않았어요'}예요. 파일에 없는 월과 토·일 중 하나가 누락되거나 중복·오류가 있는 월은 합계에서 제외했어요.</p>
                  {result.excludedMonths.length > 0 && <div><p className="font-bold text-[#556d78]">제외된 월</p><ul className="mt-1 flex flex-col gap-1">{result.excludedMonths.map((item) => <li key={item.month} className="flex flex-col gap-0.5 sm:flex-row sm:gap-2"><span className="shrink-0 font-semibold text-[#647986]">{monthLabel(item.month)}</span><span>{item.reason}</span></li>)}</ul></div>}
                  {result.dataset.warning && <p role="status" className="font-semibold text-[#a06b2e]">{result.dataset.warning}</p>}
                </div>
              </details>
            </div>
          ) : (
            <div className="rounded-[26px] border border-[#e5ebe8] bg-white p-6 shadow-[0_8px_30px_rgba(26,48,56,0.035)] sm:p-8">
              <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-[#eff7f4] text-[#168279]"><Sparkles aria-hidden="true" className="size-5" /></span>
                  <h3 className="mt-4 text-lg font-bold tracking-[-0.03em]">비교 결과가 여기에 표시돼요</h3>
                  <p className="mt-2 max-w-[560px] text-sm leading-6 text-[#778792]">질문을 입력하거나 지역·관광객 유형·기간을 선택한 뒤 비교를 시작해 보세요. 토·일 두 값이 모두 확인된 달만 결과에 포함됩니다.</p>
                </div>
                <button type="button" onClick={() => void runExample()} disabled={isLoading} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#087f77] px-5 text-sm font-bold text-white transition hover:bg-[#076c66] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d8efea] disabled:opacity-60">{isLoading ? <RefreshCw aria-hidden="true" className="size-4 animate-spin" /> : <ArrowRight aria-hidden="true" className="size-4" />} 2017년 4월 예시 결과 보기</button>
              </div>
              <div className="mt-6 grid gap-3 border-t border-[#edf0ee] pt-5 sm:grid-cols-3">
                <div className="flex items-start gap-2.5 text-xs leading-5 text-[#72828b]"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#edf7f4] text-[#168279]"><Check aria-hidden="true" className="size-3" /></span><span>카드 결제 건수 기준<br /><strong className="font-semibold text-[#526875]">거래 금액이 아닌 건수</strong></span></div>
                <div className="flex items-start gap-2.5 text-xs leading-5 text-[#72828b]"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#edf7f4] text-[#168279]"><Check aria-hidden="true" className="size-3" /></span><span>토요일·일요일 모두 있는 달만<br /><strong className="font-semibold text-[#526875]">같은 기준으로 비교</strong></span></div>
                <a href="https://jejudatahub.net/data/view/data/608" target="_blank" rel="noreferrer" className="flex items-start gap-2.5 text-xs leading-5 text-[#72828b] underline decoration-[#c7d7d1] underline-offset-4 hover:text-[#087f77]"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#edf7f4] text-[#168279]"><Database aria-hidden="true" className="size-3" /></span><span>제주데이터허브<br /><strong className="font-semibold">원본 데이터 608 보기</strong></span></a>
              </div>
            </div>
          )}
        </section>

        <footer className="mt-8 flex flex-col gap-3 border-t border-[#e1e8e5] pt-5 text-xs leading-5 text-[#87949c] sm:flex-row sm:items-center sm:justify-between">
          <p>제주 구도심 카드 결제 건수 통계 · 제주데이터허브 데이터 608</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {user && <Link href="/history" className="inline-flex items-center gap-1.5 font-semibold text-[#5c747a] hover:text-[#087f77]"><History aria-hidden="true" className="size-3.5" /> 내 질문 이력</Link>}
            {!user && <Link href="/sign-up" className="font-semibold text-[#5c747a] hover:text-[#087f77]">계정 만들기</Link>}
            <a href="https://jejudatahub.net/data/view/data/608" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-[#5c747a] hover:text-[#087f77]">출처 보기 <ArrowRight aria-hidden="true" className="size-3" /></a>
          </div>
        </footer>
      </main>
    </div>
  )
}
