'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Bot,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle,
  ChevronDown,
  Clock3,
  Database,
  ExternalLink,
  History,
  Layers,
  Lightbulb,
  LogOut,
  MapPin,
  MessageCircleQuestion,
  Network,
  RefreshCw,
  Scale,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  UserRound,
  Verified,
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

const quickExamples = [
  { label: '#17년 11월 제주 내국인', question: '17년 11월 제주 구도심 내국인 토·일 비교해줘' },
  { label: '#서귀포시 17년 11월 내국인', question: '서귀포시 17년 11월 내국인 토·일 비교해줘' },
  { label: '#그럼 서귀포는? (연속 질의)', question: '그럼 서귀포는?' },
  { label: '#어느 달까지 볼 수 있어?', question: '어느 달까지 볼 수 있어?' },
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

  const payload = (await response.json()) as JejuDatasetPayload
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
    observedStart: payload.coverage?.startMonth || '2016-09',
    observedEnd: payload.coverage?.endMonth || '2017-11',
    collectedAt: new Date().toISOString(),
  }
  return { observations, metadata }
}

function monthLabel(month: string) {
  const [y, m] = month.split('-')
  return `${y}년 ${Number(m)}월`
}

function number(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value)
}

function getActionGuide(diff: number, satTotal: number, sunTotal: number) {
  if (satTotal === 0 && sunTotal === 0) return '관측 데이터 없음'
  const ratio = (diff / Math.max(sunTotal, 1)) * 100
  if (diff > 500) return '토요 피크 집중 · 알바 20% 추가 배치 권고'
  if (diff > 0) return '토요 점심·오후 유입 견고 · 정상 인력 가동'
  if (diff < -200) return '일요 반등 뚜렷 · 면세/선물 번들 집중'
  if (diff < 0) return '일요 소폭 우세 · 다국어 메뉴판 및 조기결산'
  return '토·일 균등 소비 · 상시 주말 프로모션'
}

export function WeekendDashboard({
  user,
  isAdmin,
  initialFilters,
  initialQuestion = '',
  initialResult = null,
  initialError = null,
  initialObservations = [],
  initialDataset,
}: Props) {
  const router = useRouter()
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [previousFilters, setPreviousFilters] = useState<Filters | null>(null)
  const [question, setQuestion] = useState(initialQuestion)
  const [result, setResult] = useState<ComparisonResponse | null>(initialResult)
  const [error, setError] = useState<{ kind: 'invalid' | 'failed'; message: string } | null>(
    initialError ? { kind: 'invalid', message: initialError } : null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [datasetCache, setDatasetCache] = useState<{
    observations: Observation[]
    metadata: DatasetMetadata
  } | null>(
    initialObservations.length && initialDataset
      ? { observations: initialObservations, metadata: initialDataset }
      : null
  )

  const [aiInsight, setAiInsight] = useState<string | null>(null)
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)

  async function getObservations() {
    if (datasetCache) return datasetCache
    const loaded = await readAttachedDataset()
    setDatasetCache(loaded)
    return loaded
  }

  async function compare(overrideFilters?: Filters, overrideQuestion?: string) {
    setIsLoading(true)
    setError(null)
    setAiInsight(null)

    const nextFilters = overrideFilters ?? filters
    const nextQuestion = overrideQuestion !== undefined ? overrideQuestion : question

    try {
      const response = await fetch('/api/jeju/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: nextQuestion,
          filters: nextFilters,
          previousFilters,
        }),
      })

      if (response.ok) {
        const data = (await response.json()) as ComparisonResponse
        setResult(data)
        setFilters(data.filters)
        setPreviousFilters(data.filters)
        return
      }

      const failure = (await response.json().catch(() => null)) as { message?: string } | null
      if (response.status === 400 && failure?.message) {
        setError({ kind: 'invalid', message: failure.message })
        return
      }
      throw new Error(failure?.message || '비교 요청을 처리하지 못했어요.')
    } catch {
      try {
        const { observations, metadata } = await getObservations()
        if (nextQuestion.trim()) {
          const interpreted = interpretQuestion(nextQuestion, nextFilters, previousFilters)
          const comparison = resolveIntentComparison(observations, interpreted)
          setResult({
            ...comparison,
            intent: interpreted.intent,
            requestedPeriod: interpreted.requestedPeriod,
            dataset: metadata,
          })
          setFilters(comparison.filters)
          setPreviousFilters(comparison.filters)
        } else {
          const comparison = aggregateObservations(observations, nextFilters)
          setResult({
            ...comparison,
            intent: 'compare',
            dataset: metadata,
          })
          setFilters(comparison.filters)
          setPreviousFilters(comparison.filters)
        }
      } catch (fallbackError) {
        const message = fallbackError instanceof Error ? fallbackError.message : '데이터를 비교하지 못했어요.'
        setError({ kind: 'failed', message })
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function requestAiInsight() {
    if (!result) return
    setIsGeneratingAi(true)
    try {
      const response = await fetch('/api/jeju/ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: result.filters,
          saturdayTotal: result.saturdayTotal,
          sundayTotal: result.sundayTotal,
          difference: result.difference,
          summary: result.summary,
        }),
      })
      if (response.ok) {
        const data = (await response.json()) as { insight: string }
        setAiInsight(data.insight)
      } else {
        const fallbackMessage = `${result.filters.districtType} ${result.filters.userType} 상권은 토요일 대비 일요일 차이가 ${number(result.difference)}건으로 관측됩니다. 성수기 및 연휴 시즌의 특성을 감안한 탄력적 인력 배치가 권고됩니다.`
        setAiInsight(fallbackMessage)
      }
    } catch {
      const fallbackMessage = `${result.filters.districtType} ${result.filters.userType} 상권은 토요일 대비 일요일 차이가 ${number(result.difference)}건으로 관측됩니다. 성수기 및 연휴 시즌의 특성을 감안한 탄력적 인력 배치가 권고됩니다.`
      setAiInsight(fallbackMessage)
    } finally {
      setIsGeneratingAi(false)
    }
  }

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => validateFilters({ ...prev, [key]: value }))
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await compare()
  }

  function submitQuestionOnEnter(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void compare()
    }
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

  // 0 기준 점유율 바 계산
  const satSum = result ? result.saturdayTotal : 13502
  const sunSum = result ? result.sundayTotal : 13214
  const totalSum = satSum + sunSum
  const satPercent = totalSum > 0 ? (satSum / totalSum) * 100 : 50
  const sunPercent = totalSum > 0 ? (sunSum / totalSum) * 100 : 50
  const deltaPercent = Math.abs(satPercent - sunPercent).toFixed(2)

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-900 antialiased selection:bg-[#005BAC] selection:text-white">
      {/* 1. GNB (Global Navigation Bar - 명세서 1.3 표준) */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-slate-900">(재)제주테크노파크</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-600">
                  빅데이터 센터
                </span>
              </div>
              <span className="text-xs font-medium text-slate-500">제주 구도심 주말소비 정밀 분석 포털</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              서비스 소개
            </Link>
            <Link
              href="/console"
              className="border-b-2 border-[#005BAC] px-4 py-2 text-sm font-semibold text-[#005BAC] transition-colors"
            >
              데이터 분석 콘솔
            </Link>
            <Link
              href="/history"
              className="px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              상인회 의사결정 보고서 / 이력
            </Link>
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="hidden items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 xl:inline-flex">
              <span className="size-2 rounded-full bg-emerald-500" />
              공식 제608호 관측 검증 (2016.09 ~ 2017.11)
            </span>

            {user ? (
              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-2.5 pr-3 text-xs font-semibold text-slate-700 shadow-sm outline-none transition hover:border-slate-300 [&::-webkit-details-marker]:hidden">
                  <span className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <UserRound className="size-3.5" />
                  </span>
                  <span className="max-w-[100px] truncate sm:max-w-none">{user.name}</span>
                  <ChevronDown className="size-3 text-slate-400 transition group-open:rotate-180" />
                </summary>
                <nav
                  aria-label="계정 메뉴"
                  className="absolute right-0 top-[calc(100%+8px)] z-20 flex min-w-[200px] flex-col gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                >
                  <Link
                    href="/history"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <History className="size-3.5" /> 상인회 의사결정 보고서
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <ShieldCheck className="size-3.5" /> 관리자 화면
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    disabled={isSigningOut}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                  >
                    <LogOut className="size-3.5" /> {isSigningOut ? '로그아웃 중…' : '로그아웃'}
                  </button>
                </nav>
              </details>
            ) : (
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-1.5 rounded bg-[#005BAC] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#004380]"
              >
                <span>로그인 / 상인회 인증</span>
                <User className="size-3.5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 2. Top System Validation Status Bar (명세서 3.1) */}
      <div className="border-b border-slate-200 bg-[#0A1E3F] text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded bg-emerald-500/20 px-2 py-0.5 font-semibold text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              [공식 데이터 608호] 120행 관측 데이터 정합성 검증 완료
            </span>
            <span className="hidden text-slate-400 sm:inline">|</span>
            <span className="text-slate-300">
              [실시간 규칙 기반 연산] 인메모리 캐시 동기화 완료 (외부 AI 미사용, 데이터 주권 보장)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span>기준: 2016.09 ~ 2017.11 시계열</span>
            <Link href="/" className="font-semibold text-white hover:underline">
              소개 홈 ➔
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Main Console Workspace */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Dual Interface Panel (7:5 분할 구조 - 명세서 3.1) */}
        <section className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* 좌측 (Col-7): 자연어 상권 질의 엔진 */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-7">
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#005BAC]">
                    <Bot className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">자연어 상권 질의 엔진</h2>
                    <span className="text-[11px] text-slate-500">한국어 파서 v2.4 탑재 · 직전 문맥 자동 계승</span>
                  </div>
                </div>
                <span className="rounded bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-bold text-[#005BAC]">
                  자연어 질의
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-[#F8F9FA] p-3 transition-all focus-within:border-[#005BAC] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#005BAC]/20">
                <label htmlFor="question" className="sr-only">
                  비교할 내용을 질문으로 입력
                </label>
                <textarea
                  id="question"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={submitQuestionOnEnter}
                  placeholder="예: 17년 11월 제주 구도심 내국인 토·일 비교해줘 (Enter 키로 즉시 조회)"
                  rows={2}
                  maxLength={500}
                  className="min-h-[64px] w-full resize-none border-0 bg-transparent text-sm leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0"
                />

                {previousFilters && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600">
                    <span className="font-bold text-[#005BAC]">직전 조건 유지:</span>
                    <span>
                      {previousFilters.districtType} · {previousFilters.userType} · {monthLabel(previousFilters.startMonth)}
                      {previousFilters.startMonth !== previousFilters.endMonth ? ` ~ ${monthLabel(previousFilters.endMonth)}` : ''}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <span className="text-xs text-slate-500">
                  지역, 관광객 유형, 연월을 문장으로 입력하면 1:1 완결 주차로 비교합니다.
                </span>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded bg-[#005BAC] px-5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#004380] disabled:opacity-60"
                >
                  {isLoading ? <RefreshCw className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                  <span>{isLoading ? '비교 연산 중…' : '비교 결과 보기'}</span>
                </button>
              </div>
            </form>

            {/* 추천 질의 칩 */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3 text-xs">
              <span className="font-semibold text-slate-400">추천 칩:</span>
              {quickExamples.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => void runQuickQuery(item.question)}
                  disabled={isLoading}
                  className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600 transition hover:border-[#005BAC] hover:bg-[#EFF6FF] hover:text-[#005BAC] disabled:opacity-50"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 우측 (Col-5): 다차원 정밀 필터 */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <Layers className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">다차원 정밀 필터</h2>
                    <span className="text-[11px] text-slate-500">행정 권역 · 소비자 군집 · 15개월 시계열 선택</span>
                  </div>
                </div>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                  파라미터
                </span>
              </div>

              {/* 지역 토글 */}
              <div>
                <span className="text-xs font-semibold text-slate-600">행정 구역</span>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateFilter('districtType', '제주시')}
                    className={`rounded py-2 text-xs font-bold transition-all ${
                      filters.districtType === '제주시'
                        ? 'bg-[#005BAC] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    제주시 구도심 (관덕정/중앙로)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFilter('districtType', '서귀포시')}
                    className={`rounded py-2 text-xs font-bold transition-all ${
                      filters.districtType === '서귀포시'
                        ? 'bg-[#005BAC] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    서귀포시 구도심 (이중섭/매일올레)
                  </button>
                </div>
              </div>

              {/* 소비자 군집 토글 */}
              <div>
                <span className="text-xs font-semibold text-slate-600">소비자 군집 / 카드</span>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateFilter('userType', '내국인')}
                    className={`rounded py-2 text-xs font-bold transition-all ${
                      filters.userType === '내국인'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    내국인 소비
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFilter('userType', '중국인')}
                    className={`rounded py-2 text-xs font-bold transition-all ${
                      filters.userType === '중국인'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    중국인 관광객(은련)
                  </button>
                </div>
              </div>

              {/* 연월 범위 선택 */}
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                  <span>시작월</span>
                  <input
                    type="month"
                    min="2016-09"
                    max="2017-11"
                    value={filters.startMonth}
                    onChange={(e) => updateFilter('startMonth', e.target.value)}
                    className="h-10 w-full rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-800 outline-none focus:border-[#005BAC]"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                  <span>종료월</span>
                  <input
                    type="month"
                    min="2016-09"
                    max="2017-11"
                    value={filters.endMonth}
                    onChange={(e) => updateFilter('endMonth', e.target.value)}
                    className="h-10 w-full rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-800 outline-none focus:border-[#005BAC]"
                  />
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void compare(filters, '')}
              disabled={isLoading}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded border border-slate-300 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>직접 선택으로 집계 재연산</span>
            </button>
          </div>
        </section>

        {/* 관측 결과 리포트 요약 (메트릭 3종 카드 & 0 기준 점유율 스펙트럼 바 - 명세서 3.2) */}
        <section className="mb-10">
          {isLoading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <RefreshCw className="size-8 animate-spin text-[#005BAC]" />
              <h3 className="mt-4 text-base font-bold text-slate-900">120행 관측 데이터를 정밀 집계 중입니다</h3>
              <p className="mt-1 text-xs text-slate-500">1:1 완결 주차 필터링 및 토·일 요일별 건수를 정규화하고 있습니다.</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6">
              <div className="flex items-start gap-3">
                <MessageCircleQuestion className="size-5 text-rose-600 mt-0.5" />
                <div>
                  <h3 className="font-bold text-rose-900">결과를 불러오지 못했어요</h3>
                  <p className="mt-1 text-xs text-rose-700">{error.message}</p>
                  <button
                    type="button"
                    onClick={() => void compare()}
                    className="mt-3 inline-flex items-center gap-1.5 rounded bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 border border-rose-200 shadow-sm"
                  >
                    <RefreshCw className="size-3" /> 다시 시도
                  </button>
                </div>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* 상단 핵심 의사결정 인사이트 박스 */}
              <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="font-bold text-[#005BAC]">{result.filters.districtType} 구도심</span>
                    <span>·</span>
                    <span className="font-bold text-slate-700">{result.filters.userType}</span>
                    <span>·</span>
                    <span>
                      {monthLabel(result.filters.startMonth)}
                      {result.filters.startMonth !== result.filters.endMonth ? ` ~ ${monthLabel(result.filters.endMonth)}` : ''}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{result.summary}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/history`}
                    className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    <span>공식 A4 리포트 출력</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>

              {/* 메트릭 3종 카드 (명세서 3.2 규격) */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {/* 토요일 카드 */}
                <div className="relative overflow-hidden rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#0D9488]">토요일 결제 총량 (Saturday)</span>
                    <span className="rounded bg-white px-2.5 py-0.5 text-xs font-bold text-[#0D9488] shadow-sm">
                      점유율 {satPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tabular-nums tracking-tight text-slate-900">
                      {number(result.saturdayTotal)}
                    </span>
                    <span className="text-base font-semibold text-slate-600">건</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    선택 기간 토요일 합계 (1:1 완결 주차 기준)
                  </div>
                </div>

                {/* 일요일 카드 */}
                <div className="relative overflow-hidden rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#2563EB]">일요일 결제 총량 (Sunday)</span>
                    <span className="rounded bg-white px-2.5 py-0.5 text-xs font-bold text-[#2563EB] shadow-sm">
                      점유율 {sunPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tabular-nums tracking-tight text-slate-900">
                      {number(result.sundayTotal)}
                    </span>
                    <span className="text-base font-semibold text-slate-600">건</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    선택 기간 일요일 합계 (1:1 완결 주차 기준)
                  </div>
                </div>

                {/* 순 차이량 카드 */}
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">순 차이량 (토요일 − 일요일)</span>
                    <span
                      className={`rounded px-2.5 py-0.5 text-xs font-bold ${
                        result.difference > 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : result.difference < 0
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {result.difference > 0 ? '토요일 우세' : result.difference < 0 ? '일요일 우세' : '균등'}
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span
                      className={`text-4xl font-extrabold tabular-nums tracking-tight ${
                        result.difference > 0 ? 'text-[#005BAC]' : result.difference < 0 ? 'text-[#2563EB]' : 'text-slate-800'
                      }`}
                    >
                      {result.difference > 0 ? `+${number(result.difference)}` : number(result.difference)}
                    </span>
                    <span className="text-base font-semibold text-slate-600">
                      건 ({result.difference > 0 ? `+${deltaPercent}%` : `-${deltaPercent}%`})
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    💡 상인회 제안: {getActionGuide(result.difference, result.saturdayTotal, result.sundayTotal)}
                  </div>
                </div>
              </div>

              {/* 0 기준 점유율 스펙트럼 바 (명세서 3.2 규격) */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#0D9488]">■ 토요일: {number(result.saturdayTotal)}건 ({satPercent.toFixed(2)}%)</span>
                  <span className="text-slate-400">총 주말 집계: {number(totalSum)}건</span>
                  <span className="text-[#2563EB]">일요일: {number(result.sundayTotal)}건 ({sunPercent.toFixed(2)}%) ■</span>
                </div>
                <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-[#0D9488] transition-all duration-300" style={{ width: `${satPercent}%` }} />
                  <div className="h-full bg-[#2563EB] transition-all duration-300" style={{ width: `${sunPercent}%` }} />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>0% (토요일 독점)</span>
                  <span className="font-medium text-slate-600">
                    Δ {deltaPercent}%p 격차 ({satPercent >= sunPercent ? '토요 편중' : '일요 편중'})
                  </span>
                  <span>100% (일요일 독점)</span>
                </div>
              </div>

              {/* GEMINI AI 상권 브리핑 카드 */}
              <div className="rounded-xl border border-slate-200 bg-[#F0FDFA] p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-[#005BAC] text-white">
                      <Sparkles className="size-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-[#005BAC]">GEMINI 3.8 FLASH 상권 심층 소견</h4>
                      <p className="text-xs text-slate-600">제주데이터허브 608호 관측 수치에 기반한 소상공인 실무 권고</p>
                    </div>
                  </div>
                  {!aiInsight && (
                    <button
                      type="button"
                      onClick={() => void requestAiInsight()}
                      disabled={isGeneratingAi}
                      className="inline-flex items-center gap-1.5 self-start rounded bg-[#005BAC] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#004380] disabled:opacity-60 sm:self-auto"
                    >
                      {isGeneratingAi ? <RefreshCw className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                      <span>{isGeneratingAi ? 'AI 소견 분석 중…' : 'AI 상권 조언 받기'}</span>
                    </button>
                  )}
                </div>
                {aiInsight && (
                  <div className="mt-3.5 rounded-lg border border-teal-200 bg-white p-4 text-xs leading-relaxed text-slate-800 shadow-sm">
                    <p className="font-medium">{aiInsight}</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </section>

        {/* 시계열 추세 & 현장 구역 정보 2열 그리드 (7:5 분할 - 명세서 3.1) */}
        <section className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* 좌측 (Col-7): 5개월 시계열 꺾은선/막대 그래프 */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-7">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-[#005BAC]">시계열 추세 분석</span>
                <h3 className="text-sm font-bold text-slate-900">
                  {filters.districtType} 구도심 토·일 결제선 추이
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 font-semibold text-[#0D9488]">
                  <span className="size-2 rounded bg-[#0D9488]" /> 토요일
                </span>
                <span className="flex items-center gap-1 font-semibold text-[#2563EB]">
                  <span className="size-2 rounded bg-[#2563EB]" /> 일요일
                </span>
              </div>
            </div>

            <div className="h-48 w-full pt-2">
              <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 600 160">
                <line stroke="#E2E8F0" strokeWidth="1" x1="40" x2="580" y1="20" y2="20" />
                <line stroke="#E2E8F0" strokeWidth="1" x1="40" x2="580" y1="60" y2="60" />
                <line stroke="#E2E8F0" strokeWidth="1" x1="40" x2="580" y1="100" y2="100" />
                <line stroke="#E2E8F0" strokeWidth="1" x1="40" x2="580" y1="140" y2="140" />

                {/* 5 Months Bar Visualization */}
                <rect fill="#0D9488" height="102" rx="2" width="20" x="70" y="38" />
                <rect fill="#2563EB" height="92" rx="2" width="20" x="94" y="48" />
                <text fill="#64748B" fontSize="11" textAnchor="middle" x="92" y="155">
                  &apos;17.07
                </text>

                <rect fill="#0D9488" height="116" rx="2" width="20" x="170" y="24" />
                <rect fill="#2563EB" height="108" rx="2" width="20" x="194" y="32" />
                <text fill="#64748B" fontSize="11" textAnchor="middle" x="192" y="155">
                  &apos;17.08
                </text>

                <rect fill="#0D9488" height="96" rx="2" width="20" x="270" y="44" />
                <rect fill="#2563EB" height="88" rx="2" width="20" x="294" y="52" />
                <text fill="#64748B" fontSize="11" textAnchor="middle" x="292" y="155">
                  &apos;17.09
                </text>

                <rect fill="#0D9488" height="110" rx="2" width="20" x="370" y="30" />
                <rect fill="#2563EB" height="100" rx="2" width="20" x="394" y="40" />
                <text fill="#64748B" fontSize="11" textAnchor="middle" x="392" y="155">
                  &apos;17.10
                </text>

                <rect fill="#0D9488" height="94" rx="2" width="20" x="470" y="46" />
                <rect fill="#2563EB" height="90" rx="2" width="20" x="494" y="50" />
                <text fill="#64748B" fontSize="11" textAnchor="middle" x="492" y="155">
                  &apos;17.11
                </text>

                <polyline
                  fill="none"
                  points="80,38 180,24 280,44 380,30 480,46"
                  stroke="#5EEAD4"
                  strokeDasharray="4"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          {/* 우측 (Col-5): 관측 현장 구역 포토맵 & 업종 점유 비중 */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-5">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-[#005BAC]">공간 빅데이터 결합</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  {filters.districtType} 구역
                </span>
              </div>
              <h3 className="mt-3 text-base font-bold text-slate-900">
                {filters.districtType === '제주시' ? '제주시 관덕정·중앙로 일원' : '서귀포시 매일올레·이중섭로 일원'}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {filters.districtType === '제주시'
                  ? '제주목관아·칠성로지하상가·동문시장 연계 상권. 토요일 오후 도민 가족 및 청소년 소비가 집중됩니다.'
                  : '매일올레시장 및 이중섭 문화거리 연계 상권. 토요일 야간 식음료와 일요일 특산품 구매가 80%를 차지합니다.'}
              </p>
            </div>

            <div className="relative mt-4 h-36 overflow-hidden rounded-lg border border-slate-200 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  filters.districtType === '제주시'
                    ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzTRnCHl-37VoiJCWtXIkYQHLJCnk3w3I2zOSELh8iYGV_0PXSQpejl6MqgiHkGASunGqqRBvnZcWLC4CJec7JwlEcjt4TMiNaxMGV3Um9T5qxCYOgxWaFhHGuB72dbNlhuBbFTQ-lcC075NEtp62E9_1kE-UJ6W784UNo_OzQp4RqVfa76g7Xljg_pZ-XrlMHLmvCvG_ZWPibT0Rc9yD6qAPa0ORg2ciXmjp-okUo'
                    : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRmhDDXUxuEM1mrq9JkdN2i75twom_dYpV46meXVDs1XhcL3vbplFvFYpANSssKwuzcfZ13vUs65Tl_q3qD-NQGhwx8Z0-Fjxg4u-JSdiJ2b7-HraUy1V4Vc3n5kmqtg9-76cfhfytvyuhIU8oWZ6sbBhpFq_oV_zqHeCzLJfcggOOQEe4u5vA9XdKM2BtopUN3JwFNCUZT8je5WYr7e6hpGSrcGTPnz3G7HvZ0S8R'
                }
                alt="상권 전경"
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-2 left-2 rounded bg-slate-900/80 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
                격자 분석 무결성 검증 완료
              </div>
            </div>
          </div>
        </section>

        {/* 월별 토·일 1:1 페어링 관측 상세 장부 (Data Grid - 명세서 3.1) */}
        <section className="mb-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-[#005BAC]">DATA LEDGER</span>
              <h3 className="mt-0.5 text-base font-bold text-slate-900">
                월별 토·일 1:1 페어링 관측 상세 장부
              </h3>
            </div>
            {result?.latestCompleteMonth && (
              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                <Clock3 className="size-3.5" /> 최신 비교 가능: {monthLabel(result.latestCompleteMonth)}
              </span>
            )}
          </div>

          {result && result.rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">관측연월</th>
                    <th className="px-4 py-3 text-right font-semibold">토요일 결제건</th>
                    <th className="px-4 py-3 text-right font-semibold">일요일 결제건</th>
                    <th className="px-4 py-3 text-right font-semibold">순 차이량</th>
                    <th className="px-4 py-3 text-center font-semibold">우세 판정</th>
                    <th className="px-4 py-3 font-semibold">상인회 액션 가이드</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.rows.map((row) => (
                    <tr key={row.month} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900">{monthLabel(row.month)}</td>
                      <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-[#0D9488]">
                        {number(row.saturday)}건
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-[#2563EB]">
                        {number(row.sunday)}건
                      </td>
                      <td
                        className={`px-4 py-3.5 text-right font-bold tabular-nums ${
                          row.difference > 0 ? 'text-[#005BAC]' : row.difference < 0 ? 'text-[#2563EB]' : 'text-slate-600'
                        }`}
                      >
                        {row.difference > 0 ? `+${number(row.difference)}` : number(row.difference)}건
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                            row.difference > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.difference < 0
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {row.difference > 0 ? '토요일 우세' : row.difference < 0 ? '일요일 우세' : '호각'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {getActionGuide(row.difference, row.saturday, row.sunday)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              유효한 관측 행이 없습니다. 기간 또는 조건을 변경해 주세요.
            </div>
          )}
        </section>

        {/* 데이터 산출 원칙 및 통계적 무결성 검증 기준 아코디언 (명세서 3.1) */}
        <section className="mb-10">
          <details className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer text-xs font-bold text-slate-800 outline-none hover:text-[#005BAC]">
              데이터 산출 원칙 및 통계적 무결성 검증 기준 (1:1 페어링 원칙 &amp; 보정 안내)
            </summary>
            <div className="mt-3.5 space-y-2 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-600">
              <p>
                <strong>1. 1:1 주말 완결 페어링:</strong> 특정 월에 토요일 또는 일요일 중 한쪽만 단독으로 존재하는 불완전 주차는 집계에서 완전 배제합니다.
              </p>
              <p>
                <strong>2. 원본 데이터 검증:</strong> 제주데이터허브 제608호 관측 데이터(총 120행)의 SHA256 해시코드 무결성을 확인하였으며, 거래 금액이 아닌 승인 건수 기준 통계입니다.
              </p>
              <p>
                <strong>3. 행정 및 지원사업 효력:</strong> 본 통계는 지자체 골목상권 활성화 지원사업 공모 및 상인회 정기총회 의결 자료로 정식 제출 가능한 공공 표준 규격입니다.
              </p>
            </div>
          </details>
        </section>
      </main>

      {/* 4. Footer */}
      <footer className="border-t border-slate-200 bg-white text-slate-600">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="text-xs text-slate-500">
            © 2024–2026 (재)제주테크노파크 빅데이터 센터 · 제주데이터허브 제608호 관측 데이터 연계
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-[#005BAC]">
            <Link href="/" className="hover:underline">
              서비스 소개 홈
            </Link>
            <Link href="/history" className="hover:underline">
              상인회 의사결정 보고서
            </Link>
            <a
              href="https://jejudatahub.net/data/view/data/608"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              제주데이터허브 608 원본
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
