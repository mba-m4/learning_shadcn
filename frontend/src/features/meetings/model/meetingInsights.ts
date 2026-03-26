import type { Meeting } from '@/types/api'

export interface MeetingInsightsViewModel {
  summary: string
  decisions: string[]
  actionItems: string[]
}

const splitTranscript = (transcript: string) =>
  transcript
    .split(/[。.!?\n]/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

const takeUnique = (items: string[], limit: number) => {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean))).slice(0, limit)
}

export const createMeetingInsightsViewModel = (
  meeting: Meeting,
): MeetingInsightsViewModel => {
  const transcriptSentences = splitTranscript(meeting.transcript)
  const riskTitles = meeting.extracted_risks.map((risk) => risk.title)
  const riskActions = meeting.extracted_risks.flatMap((risk) => risk.actions)

  const summary =
    transcriptSentences[0] ??
    (riskTitles.length > 0
      ? `${meeting.title}では ${riskTitles.slice(0, 2).join('、')} を中心に確認しています。`
      : `${meeting.title} の議事内容をもとに、関連リスクと対応事項を整理しています。`)

  const decisions = takeUnique(
    [
      ...riskTitles.map((title) => `${title} を重点確認事項として扱う`),
      transcriptSentences[1],
      meeting.sync_state !== '待機中' ? `抽出状態: ${meeting.sync_state}` : '',
    ],
    3,
  )

  const actionItems = takeUnique(
    [
      ...riskActions,
      ...meeting.extracted_risks.map((risk) => `${risk.title} の対応内容を確認する`),
      transcriptSentences[2],
    ],
    3,
  )

  return {
    summary,
    decisions:
      decisions.length > 0
        ? decisions
        : ['会議で挙がった懸念点を次回レビュー対象に追加する'],
    actionItems:
      actionItems.length > 0
        ? actionItems
        : ['抽出されたリスクの担当者と期限を確認する'],
  }
}