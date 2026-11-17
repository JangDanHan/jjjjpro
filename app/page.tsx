import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { WeekendDashboard } from '@/components/weekend-dashboard'
import { auth } from '@/lib/auth'
import { isAdminEmail } from '@/lib/admin'
import { db } from '@/lib/db'
import { queryHistory } from '@/lib/db/schema'
import { aggregateObservations, validateFilters } from '@/lib/jeju/aggregate'
import { previewMetadata, previewObservations } from '@/lib/jeju/preview-data'
import type { Filters } from '@/lib/jeju/types'

const defaultFilters: Filters = {
  districtType: '제주시',
  userType: '내국인',
  startMonth: '2016-09',
  endMonth: '2017-11',
}

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  let session = null
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    // DB 미연결 또는 초기 로컬 환경에서는 비로그인 게스트 모드로 안전하게 동작
  }
  const user = session?.user
    ? { id: session.user.id, name: session.user.name, email: session.user.email }
    : null

  let initialFilters = defaultFilters
  let initialQuestion = ''
  let initialResult = null
  let initialError: string | null = null

  const replayId = typeof params.replay === 'string' ? params.replay : null
  if (replayId && user) {
    const [historyItem] = await db
      .select()
      .from(queryHistory)
      .where(and(eq(queryHistory.id, replayId), eq(queryHistory.userId, user.id)))
      .limit(1)

    if (historyItem) {
      initialFilters = validateFilters({
        districtType: historyItem.districtType as Filters['districtType'],
        userType: historyItem.userType as Filters['userType'],
        startMonth: historyItem.startMonth,
        endMonth: historyItem.endMonth,
      })
      initialQuestion = historyItem.question
      initialResult = {
        ...aggregateObservations(previewObservations, initialFilters),
        intent: 'compare' as const,
        dataset: previewMetadata,
      }
    } else {
      initialError = '이 질문 이력을 찾을 수 없어요.'
    }
  } else if (replayId) {
    initialError = '질문 이력을 다시 보려면 로그인해 주세요.'
  } else {
    initialResult = {
      ...aggregateObservations(previewObservations, initialFilters),
      intent: 'compare' as const,
      dataset: previewMetadata,
    }
  }

  return (
    <WeekendDashboard
      user={user}
      isAdmin={isAdminEmail(user?.email)}
      initialFilters={initialFilters}
      initialQuestion={initialQuestion}
      initialResult={initialResult}
      initialError={initialError}
    />
  )
}
