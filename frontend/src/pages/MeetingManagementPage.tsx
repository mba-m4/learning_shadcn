import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Mic2 } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import { useMeetingStore } from '@/stores/meetingStore'

export default function MeetingManagementPage() {
  const navigate = useNavigate()
  const { meetings, uploadsByKey, fetchMeetings, fetchUploads, addUploads } = useMeetingStore()
  const [uploads, setUploads] = useState<string[]>(uploadsByKey.general?.map((item) => item.filename) ?? [])

  useEffect(() => {
    void fetchMeetings()
    void fetchUploads(null)
  }, [fetchMeetings, fetchUploads])

  useEffect(() => {
    setUploads(uploadsByKey.general?.map((item) => item.filename) ?? [])
  }, [uploadsByKey.general])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Meeting / Voice"
        subtitle="会議録と音声メモを管理します。"
      />
      <div className="rounded-xl border border-border/60 bg-white">
        <div className="border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            <Mic2 className="h-4 w-4" />
            Meetings
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground"
              onClick={() => toast.info('録音は未対応です。')}
            >
              録音開始
            </button>
            <label className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
              音声アップロード
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []).map((file) => file.name)
                  if (files.length > 0) {
                    void addUploads(files, null)
                  }
                  if (files.length > 0) {
                    toast.success(`${files.length} 件の音声を追加しました。`)
                  }
                  event.currentTarget.value = ''
                }}
              />
            </label>
            {uploads.length > 0 && (
              <span className="text-xs text-muted-foreground">
                追加: {uploads.slice(0, 2).join(', ')}
                {uploads.length > 2 ? ' ...' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="divide-y">
          {meetings.map((meeting) => (
            <button
              key={meeting.id}
              type="button"
              onClick={() => navigate(`/meetings/${meeting.id}`)}
              className="flex w-full flex-wrap items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{meeting.title}</p>
                <p className="text-xs text-muted-foreground">{meeting.date}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                リスク抽出 {meeting.extracted_risks.length} 件
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
