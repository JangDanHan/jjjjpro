/**
 * Gemini API 클라이언트 유틸리티
 * 
 * 환경 변수 우선순위:
 * 1. GEMINI_API_KEY (권장 표준)
 * 2. GOOGLE_API_KEY
 * 3. GOOGLE_GENAI_API_KEY
 */

export function getGeminiApiKey(): string | null {
  const key =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY
  return key?.trim() || null
}

export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiApiKey())
}

/**
 * 제주 주말 소비 비교 결과를 기반으로 소상공인/상인회를 위한 AI 인사이트 및 브리핑 생성
 */
export async function generateConsumptionInsight(params: {
  districtType: string
  userType: string
  period: string
  saturdayTotal: number
  sundayTotal: number
  difference: number
  summary: string
}): Promise<string | null> {
  const apiKey = getGeminiApiKey()
  if (!apiKey) return null

  const prompt = `당신은 제주시 및 서귀포시 상권 분석 전문가입니다.
다음은 제주데이터허브 608번 공공데이터를 기반으로 집계된 주말(토/일) 카드 결제 건수 통계입니다:

- 분석 지역: ${params.districtType} 구도심
- 고객 유형: ${params.userType}
- 분석 기간: ${params.period}
- 토요일 총 결제 건수: ${params.saturdayTotal.toLocaleString('ko-KR')}건
- 일요일 총 결제 건수: ${params.sundayTotal.toLocaleString('ko-KR')}건
- 요일 차이(토요일 - 일요일): ${params.difference > 0 ? '+' : ''}${params.difference.toLocaleString('ko-KR')}건
- 집계 요약: ${params.summary}

소상공인 및 상인회 담당자가 상권 운영 및 주말 마케팅에 참고할 수 있도록, 2~3문장의 명확하고 실용적인 요약 인사이트를 한국어로 작성해 주세요.`

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 300,
        },
      }),
    })

    if (!response.ok) {
      console.warn(`[Gemini API] Request failed with status ${response.status}`)
      return null
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    return text?.trim() || null
  } catch (error) {
    console.warn('[Gemini API] Error generating insight:', error instanceof Error ? error.message : error)
    return null
  }
}
