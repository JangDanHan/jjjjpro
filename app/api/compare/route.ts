import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { queryHistory } from '@/lib/db/schema'
import { aggregateObservations, interpretQuestion, validateFilters } from '@/lib/jeju/aggregate'
import { readDataset } from '@/lib/jeju/repository'
import type { Filters } from '@/lib/jeju/types'
import { hasSameOrigin } from '@/lib/security'

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      question?: unknown
      filters?: Partial<Filters>
      previousFilters?: Partial<Filters> | null
    }
    const question = typeof body.question === 'string' ? body.question.trim().slice(0, 500) : ''
    const selected = validateFilters(body.filters ?? {})
    const previous = body.previousFilters ? validateFilters(body.previousFilters) : null
    const { observations, metadata } = await readDataset()
    const interpreted = interpretQuestion(question, selected, previous)
    let filters = interpreted.filters
    let result = aggregateObservations(observations, filters)

    if (interpreted.intent === 'availability' && result.latestCompleteMonth) {
      filters = { ...filters, startMonth: result.latestCompleteMonth, endMonth: result.latestCompleteMonth }
      result = aggregateObservations(observations, filters)
      result = {
        ...result,
        summary: result.latestCompleteMonth
          ? `${result.latestCompleteMonth.replace('-', '년 ')}월까지 비교할 수 있어요.`
          : result.summary,
      }
    } else if (interpreted.intent === 'monthly' && result.rows.length > 0) {
      const sortedByDifference = [...result.rows].sort((left, right) => left.difference - right.difference)
      const least = sortedByDifference[0]
      const most = sortedByDifference[sortedByDifference.length - 1]
      const spread = most.difference - least.difference
      const formatDifference = (difference: number) => `${difference > 0 ? '+' : ''}${difference.toLocaleString('ko-KR')}건`
      result = {
        ...result,
        summary: result.rows.length === 1
          ? `${least.month.replace('-', '년 ')}월의 차이는 ${formatDifference(least.difference)}이에요. 비교 가능한 달이 한 달뿐이라 월별 유사성은 판단할 수 없어요.`
          : `가장 작은 차이는 ${least.month.replace('-', '년 ')}월 ${formatDifference(least.difference)}, 가장 큰 차이는 ${most.month.replace('-', '년 ')}월 ${formatDifference(most.difference)}예요. 월별 차이 범위는 ${spread.toLocaleString('ko-KR')}건입니다. 아래 표에서 달마다 확인해 보세요.`,
      }
    }

    const session = await auth.api.getSession({ headers: request.headers })
    if (session?.user && !hasSameOrigin(request)) {
      return NextResponse.json({ error: '요청 출처를 확인할 수 없어요.' }, { status: 403 })
    }
    if (session?.user && result.status === 'success') {
      await db.insert(queryHistory).values({
        id: randomUUID(),
        userId: session.user.id,
        question: question || '직접 선택 비교',
        districtType: filters.districtType,
        userType: filters.userType,
        startMonth: filters.startMonth,
        endMonth: filters.endMonth,
      })
    }

    return NextResponse.json({ ...result, intent: interpreted.intent, requestedPeriod: interpreted.requestedPeriod, dataset: metadata })
  } catch (error) {
    const message = error instanceof Error ? error.message : '비교 중 문제가 발생했어요.'
    const badRequest = /선택해 주세요|입력해 주세요|늦을 수|조회 기간은/.test(message)
    return NextResponse.json(
      { error: message },
      { status: badRequest ? 422 : 500 },
    )
  }
}
