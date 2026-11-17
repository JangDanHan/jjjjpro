'use client'

import { useState, type ChangeEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Clock3, Database, FileCheck2, RefreshCw, ShieldCheck, Upload, XCircle } from 'lucide-react'

type Snapshot = {
  active: null | {
    version: string
    source: string
    rowCount: number
    observedStart: string | null
    observedEnd: string | null
    checksum: string | null
    appliedAt: Date | string | null
  }
  latestRefresh: null | {
    status: string
    startedAt: Date | string
    finishedAt: Date | string | null
    failureReason: string | null
    rowsReceived: number | null
  }
}

type ImportSummary = {
  totalRows: number
  validRowCount: number
  invalidRows: Array<{ rowNumber: number; reason: string }>
  duplicateRows: Array<{ rowNumber: number; reason: string }>
  observedStart: string | null
  observedEnd: string | null
  observedMonthCount: number
  completeMonths: Array<{ districtType: string; userType: string; months: string[] }>
  fullOfficialCoverage: boolean
  canApply: boolean
}

type Props = { initialSnapshot: Snapshot | null; initialError?: string | null }

function formatDate(value: Date | string | null | undefined) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function AdminPanel({ initialSnapshot, initialError = null }: Props) {
  const [snapshot, setSnapshot] = useState(initialSnapshot)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [message, setMessage] = useState(initialError)
  const [refreshState, setRefreshState] = useState<'success' | 'failed' | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [importValidation, setImportValidation] = useState<ImportSummary | null>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [importState, setImportState] = useState<'success' | 'failed' | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isApplyingImport, setIsApplyingImport] = useState(false)

  async function refresh() {
    setIsRefreshing(true)
    setMessage(null)
    setRefreshState(null)
    try {
      const response = await fetch('/api/admin', { method: 'POST' })
      const payload = await response.json()
      setSnapshot({ active: payload.active ?? null, latestRefresh: payload.latestRefresh ?? null })
      if (!response.ok || !payload.refresh?.ok) {
        setRefreshState('failed')
        setMessage(payload.refresh?.reason ?? payload.error ?? '갱신하지 못했어요. 기존 데이터는 유지됩니다.')
      } else {
        setRefreshState('success')
        setMessage(`${payload.refresh.rowsReceived.toLocaleString('ko-KR')}개 행을 새 버전 ${payload.refresh.version}으로 적용했어요.`)
      }
    } catch {
      setRefreshState('failed')
      setMessage('서버와 연결하지 못했어요. 기존 데이터는 유지됩니다.')
    } finally {
      setIsRefreshing(false)
    }
  }

  async function chooseImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setImportValidation(null)
    setImportMessage(null)
    setImportState(null)
    setFileContent(null)
    setFileName('')
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setImportMessage('파일은 10MB 이하만 가져올 수 있어요.')
      setImportState('failed')
      event.target.value = ''
      return
    }
    try {
      setFileContent(await file.text())
      setFileName(file.name)
    } catch {
      setImportMessage('파일을 읽지 못했어요. CSV 또는 JSON 파일인지 확인해 주세요.')
      setImportState('failed')
    }
  }

  async function validateImport() {
    if (fileContent === null) return
    setIsValidating(true)
    setImportMessage(null)
    setImportState(null)
    try {
      const response = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode: 'preview', content: fileContent }),
      })
      const payload = await response.json()
      if (!response.ok || !payload.validation) throw new Error(payload.error ?? '파일을 검증하지 못했어요.')
      setImportValidation(payload.validation)
      setImportMessage(payload.validation.canApply
        ? '검증을 마쳤어요. 아직 DB에는 아무것도 적용하지 않았습니다.'
        : '검증 오류 또는 중복 행이 있어 적용할 수 없어요. 기존 데이터는 유지됩니다.')
      setImportState(payload.validation.canApply ? null : 'failed')
    } catch (error) {
      setImportValidation(null)
      setImportMessage(error instanceof Error ? error.message : '파일을 검증하지 못했어요.')
      setImportState('failed')
    } finally {
      setIsValidating(false)
    }
  }

  async function applyImport() {
    if (fileContent === null || !importValidation?.canApply) return
    setIsApplyingImport(true)
    setImportMessage(null)
    setImportState(null)
    try {
      const response = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode: 'apply', content: fileContent }),
      })
      const payload = await response.json()
      if (!response.ok || !payload.import?.ok) throw new Error(payload.import?.reason ?? payload.error ?? '파일을 적용하지 못했어요.')
      setImportState('success')
      setImportMessage(`${payload.import.rowsReceived.toLocaleString('ko-KR')}개 유효 행을 적용했어요. 적용 후 비교 데이터는 기존 월을 보존해 병합했습니다.`)
      try {
        const snapshotResponse = await fetch('/api/admin')
        if (snapshotResponse.ok) setSnapshot(await snapshotResponse.json())
      } catch {
        // Keep the successful apply state if only the follow-up snapshot read fails.
      }
    } catch (error) {
      setImportState('failed')
      setImportMessage(error instanceof Error ? error.message : '파일을 적용하지 못했어요. 기존 데이터는 유지됩니다.')
    } finally {
      setIsApplyingImport(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f6f5] px-5 py-8 text-[#14273a] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-[900px]">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#5e747e] transition hover:text-[#087f77]"><ArrowLeft aria-hidden="true" className="size-4" /> 비교 화면으로 돌아가기</Link>
        <div className="mt-7 flex flex-col gap-5 rounded-[24px] border border-[#e5ebe8] bg-white p-5 shadow-[0_8px_30px_rgba(26,48,56,0.04)] sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#eaf5f2] text-[#087f77]"><ShieldCheck aria-hidden="true" className="size-5" /></span>
            <div><p className="text-xs font-bold tracking-[0.12em] text-[#168279]">DATA OPERATIONS</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">데이터 관리자</h1><p className="mt-2 text-sm leading-6 text-[#778792]">제주데이터허브 608 데이터 버전과 동기화 상태를 확인합니다.</p></div>
          </div>
          <button type="button" onClick={() => void refresh()} disabled={isRefreshing} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#087f77] px-5 text-sm font-bold text-white transition hover:bg-[#076c66] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d8efea] disabled:cursor-wait disabled:opacity-65">
            <RefreshCw aria-hidden="true" className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} /> {isRefreshing ? '전체 페이지 수집 중…' : '전체 데이터 새로고침'}
          </button>
        </div>

        {message && <div role={refreshState === 'failed' ? 'alert' : 'status'} className={`mt-4 flex items-start gap-2.5 rounded-2xl border p-4 text-sm leading-6 ${refreshState === 'failed' ? 'border-[#f0d9d7] bg-[#fff7f6] text-[#9f514d]' : 'border-[#cde4d8] bg-[#f1faf5] text-[#38715c]'}`}>{refreshState === 'failed' ? <XCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />}<span>{message}</span></div>}

        <section aria-labelledby="import-title" className="mt-5 rounded-[24px] border border-[#e5ebe8] bg-white p-5 shadow-[0_8px_30px_rgba(26,48,56,0.035)] sm:p-7">
          <div className="mb-2 flex items-center gap-2"><Upload aria-hidden="true" className="size-4 text-[#168279]" /><h2 id="import-title" className="font-bold">집계 원자료 수동 가져오기</h2></div>
          <p className="mb-5 text-sm leading-6 text-[#778792]">CSV 또는 JSON(평평한 배열, data 배열, responses 응답 배열)을 검증한 뒤 적용합니다. 파일은 최대 10MB예요.</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label htmlFor="dataset-import-file" className="mb-2 block text-xs font-semibold text-[#819099]">608번 원자료 파일</label>
              <input id="dataset-import-file" type="file" accept=".csv,.json,text/csv,application/json" onChange={(event) => void chooseImportFile(event)} className="block min-h-12 w-full rounded-xl border border-[#dfe7e3] bg-[#fbfcfc] px-3 py-2 text-sm text-[#344c5e] file:mr-3 file:rounded-lg file:border-0 file:bg-[#eaf5f2] file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#087f77] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d8efea]" />
              <p className="mt-1.5 truncate text-xs text-[#819099]">{fileName || '선택한 파일은 검증 전까지 서버에 전송되지 않아요.'}</p>
            </div>
            <button type="button" onClick={() => void validateImport()} disabled={fileContent === null || isValidating || isApplyingImport} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#cddbd5] bg-white px-4 text-sm font-bold text-[#24675f] transition hover:bg-[#f4faf8] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d8efea] disabled:cursor-not-allowed disabled:opacity-50">
              <FileCheck2 aria-hidden="true" className="size-4" />{isValidating ? '파일 검증 중…' : '적용 전 검증'}
            </button>
          </div>

          {importMessage && <div role={importState === 'failed' ? 'alert' : 'status'} className={`mt-4 flex items-start gap-2.5 rounded-2xl border p-4 text-sm leading-6 ${importState === 'failed' ? 'border-[#f0d9d7] bg-[#fff7f6] text-[#9f514d]' : 'border-[#cde4d8] bg-[#f1faf5] text-[#38715c]'}`}>{importState === 'failed' ? <XCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />}<span>{importMessage}</span></div>}

          {importValidation && <div className="mt-5 border-t border-[#edf1ef] pt-5">
            <h3 className="font-bold text-[#344c5e]">검증 미리보기</h3>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-[#f7f9f8] p-3"><dt className="text-xs font-semibold text-[#819099]">전체 행</dt><dd className="mt-1 text-sm font-bold">{importValidation.totalRows.toLocaleString('ko-KR')}행</dd></div>
              <div className="rounded-xl bg-[#f7f9f8] p-3"><dt className="text-xs font-semibold text-[#819099]">유효·고유 행</dt><dd className="mt-1 text-sm font-bold">{importValidation.validRowCount.toLocaleString('ko-KR')}행</dd></div>
              <div className="rounded-xl bg-[#f7f9f8] p-3"><dt className="text-xs font-semibold text-[#819099]">오류 행</dt><dd className="mt-1 text-sm font-bold">{importValidation.invalidRows.length.toLocaleString('ko-KR')}행</dd></div>
              <div className="rounded-xl bg-[#f7f9f8] p-3"><dt className="text-xs font-semibold text-[#819099]">중복 행</dt><dd className="mt-1 text-sm font-bold">{importValidation.duplicateRows.length.toLocaleString('ko-KR')}행</dd></div>
            </dl>
            <p className="mt-4 text-sm leading-6 text-[#526a76]">파일 관측 기간: <strong>{importValidation.observedStart ?? '—'} — {importValidation.observedEnd ?? '—'}</strong> · 관측 월 {importValidation.observedMonthCount}개</p>
            <p className={`mt-2 rounded-xl p-3 text-sm leading-6 ${importValidation.fullOfficialCoverage ? 'bg-[#f1faf5] text-[#38715c]' : 'bg-[#fff8ed] text-[#8a6632]'}`}>
              {importValidation.fullOfficialCoverage
                ? '전체 공식 기간의 지역·관광객·토·일 관측을 모두 포함합니다.'
                : '전체 공식 기간의 관측을 완전히 포함하지 않은 파일입니다. 전체 기간 갱신으로 표시하지 않으며, 적용 시 다른 월의 기존 관측 데이터는 보존하고 같은 관측 키만 갱신합니다.'}
            </p>
            <div className="mt-4">
              <h4 className="text-xs font-bold text-[#526a76]">토요일·일요일이 모두 있는 월</h4>
              {importValidation.completeMonths.length ? <ul className="mt-2 flex flex-col gap-2 text-sm text-[#526a76]">
                {importValidation.completeMonths.map((group) => <li key={`${group.districtType}-${group.userType}`}><span className="font-semibold">{group.districtType} · {group.userType}</span>: {group.months.join(', ')}</li>)}
              </ul> : <p className="mt-2 text-sm text-[#819099]">두 요일이 모두 있는 조합·월이 없어요.</p>}
            </div>
            {(importValidation.invalidRows.length > 0 || importValidation.duplicateRows.length > 0) && <div className="mt-4 rounded-xl border border-[#f0d9d7] bg-[#fffaf9] p-4 text-sm text-[#8e514d]">
              <h4 className="font-bold">수정이 필요한 행</h4>
              <ul className="mt-2 flex flex-col gap-1.5">
                {[...importValidation.invalidRows, ...importValidation.duplicateRows].slice(0, 12).map((issue, index) => <li key={`${issue.rowNumber}-${index}`}>행 {issue.rowNumber}: {issue.reason}</li>)}
              </ul>
              {[...importValidation.invalidRows, ...importValidation.duplicateRows].length > 12 && <p className="mt-2 text-xs">나머지 행 오류는 파일에서 확인해 주세요.</p>}
            </div>}
            <button type="button" onClick={() => void applyImport()} disabled={!importValidation.canApply || isApplyingImport || isValidating} className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#087f77] px-5 text-sm font-bold text-white transition hover:bg-[#076c66] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d8efea] disabled:cursor-not-allowed disabled:opacity-50">
              <Upload aria-hidden="true" className="size-4" />{isApplyingImport ? '기존 데이터와 병합 중…' : '검증된 행 적용'}
            </button>
          </div>}
        </section>

        <section aria-labelledby="snapshot-title" className="mt-5 rounded-[24px] border border-[#e5ebe8] bg-white p-5 shadow-[0_8px_30px_rgba(26,48,56,0.035)] sm:p-7">
          <div className="mb-5 flex items-center gap-2"><Database aria-hidden="true" className="size-4 text-[#168279]" /><h2 id="snapshot-title" className="font-bold">현재 적용 데이터</h2></div>
          {snapshot?.active ? (
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <div><dt className="text-xs font-semibold text-[#819099]">활성 버전</dt><dd className="mt-1.5 break-all text-sm font-bold text-[#344c5e]">{snapshot.active.version}</dd></div>
              <div><dt className="text-xs font-semibold text-[#819099]">관측 행 수</dt><dd className="mt-1.5 text-sm font-bold text-[#344c5e]">{snapshot.active.rowCount.toLocaleString('ko-KR')}건</dd></div>
              <div><dt className="text-xs font-semibold text-[#819099]">실제 관측 기간</dt><dd className="mt-1.5 text-sm font-bold text-[#344c5e]">{snapshot.active.observedStart ?? '—'} — {snapshot.active.observedEnd ?? '—'}</dd></div>
              <div><dt className="text-xs font-semibold text-[#819099]">적용 시각</dt><dd className="mt-1.5 text-sm font-bold text-[#344c5e]">{formatDate(snapshot.active.appliedAt)}</dd></div>
              <div className="sm:col-span-2"><dt className="text-xs font-semibold text-[#819099]">체크섬 (SHA-256)</dt><dd className="mt-1.5 break-all font-mono text-xs text-[#60727d]">{snapshot.active.checksum ?? '초기 미리보기 데이터'}</dd></div>
            </dl>
          ) : <p className="text-sm leading-6 text-[#778792]">활성 DB 버전이 없어요. 비교 화면은 내장 미리보기 데이터를 사용합니다.</p>}
        </section>

        <section aria-labelledby="refresh-title" className="mt-4 rounded-[24px] border border-[#e5ebe8] bg-white p-5 shadow-[0_8px_30px_rgba(26,48,56,0.035)] sm:p-7">
          <div className="mb-5 flex items-center gap-2"><Clock3 aria-hidden="true" className="size-4 text-[#168279]" /><h2 id="refresh-title" className="font-bold">최근 갱신 기록</h2></div>
          {snapshot?.latestRefresh ? (
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <div><dt className="text-xs font-semibold text-[#819099]">결과</dt><dd className={`mt-1.5 text-sm font-bold ${snapshot.latestRefresh.status === 'success' ? 'text-[#38715c]' : snapshot.latestRefresh.status === 'failed' ? 'text-[#9f514d]' : 'text-[#8a7037]'}`}>{snapshot.latestRefresh.status === 'success' ? '성공' : snapshot.latestRefresh.status === 'failed' ? '실패' : '진행 중'}</dd></div>
              <div><dt className="text-xs font-semibold text-[#819099]">수집 시작</dt><dd className="mt-1.5 text-sm font-bold text-[#344c5e]">{formatDate(snapshot.latestRefresh.startedAt)}</dd></div>
              <div><dt className="text-xs font-semibold text-[#819099]">수집 행</dt><dd className="mt-1.5 text-sm font-bold text-[#344c5e]">{snapshot.latestRefresh.rowsReceived?.toLocaleString('ko-KR') ?? '—'}</dd></div>
              {snapshot.latestRefresh.failureReason && <div className="sm:col-span-2"><dt className="text-xs font-semibold text-[#819099]">실패 사유</dt><dd className="mt-1.5 text-sm leading-6 text-[#9f514d]">{snapshot.latestRefresh.failureReason}</dd></div>}
            </dl>
          ) : <p className="text-sm leading-6 text-[#778792]">아직 갱신 이력이 없습니다.</p>}
        </section>

        <aside className="mt-4 rounded-2xl border border-[#e7eae7] bg-[#fafcfb] p-4 text-xs leading-6 text-[#72828b]">
          새 버전은 모든 페이지 수집과 필수 필드 검증에 성공한 뒤 한 번에 활성화됩니다. 실패하면 기존 버전은 그대로 유지돼요. 자동 갱신은 매주 월요일 UTC 09:00에 실행됩니다.
        </aside>
      </div>
    </main>
  )
}
