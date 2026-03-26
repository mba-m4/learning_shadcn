import { Brain, FileText, Link2, Search, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MeetingUpload, WorkListItem } from '@/types/api'

interface Candidate extends WorkListItem {
  score: number
}

interface Props {
  agendaTags: string[]
  agendaInput: string
  aiCandidates: Candidate[]
  selectedWorkId: number | ''
  workList: WorkListItem[]
  relatedWorks: WorkListItem[]
  uploads: MeetingUpload[]
  materialLinks: string[]
  materialLink: string
  onAgendaInputChange(value: string): void
  onAddAgendaTag(): void
  onRemoveAgendaTag(tag: string): void
  onAdoptCandidate(workId: number): void
  onSelectWorkId(value: number | ''): void
  onAddSelectedWork(): void
  onOpenWork(workId: number): void
  onAddUploads(files: string[]): void
  onMaterialLinkChange(value: string): void
  onAddMaterialLink(): void
  onRemoveMaterialLink(link: string): void
}

export function MeetingWorkspaceSidebar({
  agendaTags,
  agendaInput,
  aiCandidates,
  selectedWorkId,
  workList,
  relatedWorks,
  uploads,
  materialLinks,
  materialLink,
  onAgendaInputChange,
  onAddAgendaTag,
  onRemoveAgendaTag,
  onAdoptCandidate,
  onSelectWorkId,
  onAddSelectedWork,
  onOpenWork,
  onAddUploads,
  onMaterialLinkChange,
  onAddMaterialLink,
  onRemoveMaterialLink,
}: Props) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border/60 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Agenda
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">議題タグ</h2>
          </div>
          <Tag className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {agendaTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
              <button
                type="button"
                className="text-muted-foreground hover:text-slate-900"
                onClick={() => onRemoveAgendaTag(tag)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Input
            value={agendaInput}
            onChange={(event) => onAgendaInputChange(event.target.value)}
            placeholder="議題を追加"
          />
          <Button size="sm" onClick={onAddAgendaTag}>
            追加
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-border/60 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Related Works
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">関連作業</h2>
          </div>
          <Link2 className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-border/60 bg-slate-50/50 p-3">
            <p className="text-xs font-semibold text-slate-700">AI候補</p>
            <div className="mt-2 space-y-2">
              {aiCandidates.map((candidate) => (
                <div key={candidate.work.id} className="flex items-center justify-between text-xs">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {candidate.work.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      スコア: {(candidate.score * 100).toFixed(0)}%
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAdoptCandidate(candidate.work.id)}
                  >
                    採用
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={selectedWorkId ? String(selectedWorkId) : ''}
              onValueChange={(value) => onSelectWorkId(value ? Number(value) : '')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="手動で作業を追加" />
              </SelectTrigger>
              <SelectContent>
                {workList.map((item) => (
                  <SelectItem key={item.work.id} value={String(item.work.id)}>
                    {item.work.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={onAddSelectedWork}>
              追加
            </Button>
          </div>
          <div className="space-y-2">
            {relatedWorks.length === 0 ? (
              <p className="text-xs text-muted-foreground">関連作業はまだありません。</p>
            ) : (
              relatedWorks.map((item) => (
                <div key={item.work.id} className="flex items-center justify-between text-xs">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.work.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.work.work_date}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onOpenWork(item.work.id)}
                  >
                    開く
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border/60 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Materials
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">会議資料</h2>
          </div>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-3 space-y-2 text-sm">
          {uploads.length === 0 ? (
            <p className="text-xs text-muted-foreground">音声・資料のアップロードはありません。</p>
          ) : (
            uploads.map((upload) => (
              <div key={upload.id} className="flex items-center justify-between">
                <span className="text-slate-900">{upload.filename}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(upload.created_at).toLocaleDateString('ja-JP')}
                </span>
              </div>
            ))
          )}
          <label className="mt-3 inline-flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-xs text-muted-foreground">
            ファイル追加
            <input
              type="file"
              className="hidden"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []).map((file) => file.name)
                if (files.length > 0) {
                  onAddUploads(files)
                }
                event.currentTarget.value = ''
              }}
            />
          </label>
        </div>
        <Separator className="my-4 bg-border/40" />
        <div className="space-y-2">
          {materialLinks.map((link) => (
            <div key={link} className="flex items-center justify-between text-xs">
              <span className="text-blue-700">{link}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemoveMaterialLink(link)}
              >
                削除
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Input
              value={materialLink}
              onChange={(event) => onMaterialLinkChange(event.target.value)}
              placeholder="資料リンクを追加"
            />
            <Button size="sm" onClick={onAddMaterialLink}>
              追加
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border/60 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              AI Workspace
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">AI提案レーン</h2>
          </div>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-border/60 p-3">
            <p className="text-sm font-semibold">AI提案</p>
            <div className="mt-2 space-y-2">
              {[
                {
                  title: '高温配管エリアの点検タスク追加',
                  confidence: 0.86,
                  reason: '議事録で3回言及・過去事故との関連性高',
                },
                {
                  title: '清掃頻度の定期監査を追加',
                  confidence: 0.74,
                  reason: '転倒事故の再発防止策として有効',
                },
              ].map((proposal) => (
                <div key={proposal.title} className="rounded-md border border-border/60 p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">
                      {proposal.title}
                    </p>
                    <span className="rounded-full border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                      {Math.round(proposal.confidence * 100)}%
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">理由: {proposal.reason}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      採用
                    </Button>
                    <Button size="sm" variant="ghost">
                      有用
                    </Button>
                    <Button size="sm" variant="ghost">
                      不要
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border/60 p-3">
            <p className="text-sm font-semibold">自動下書き</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="outline">
                インシデント下書き
              </Button>
              <Button size="sm" variant="outline">
                作業下書き
              </Button>
              <Button size="sm" variant="outline">
                サマリー生成
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 p-3">
            <p className="text-sm font-semibold">説明可能性</p>
            <p className="mt-2 text-xs text-muted-foreground">
              提案の根拠となる発言、過去のインシデント、関連作業の一致度を提示します。
            </p>
          </div>

          <div className="rounded-lg border border-border/60 p-3">
            <p className="text-sm font-semibold">横断検索</p>
            <div className="mt-2 flex items-center gap-2">
              <Input placeholder="会議・インシデント・作業を検索" />
              <Button size="sm" variant="outline">
                検索
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              検索結果はここに表示されます。
            </p>
          </div>

          <div className="rounded-lg border border-border/60 p-3">
            <p className="text-sm font-semibold">関連性グラフ</p>
            <div className="mt-2 flex items-center justify-center rounded-md border border-dashed border-border/60 p-4 text-xs text-muted-foreground">
              作業 ↔ 会議 ↔ インシデントの関係グラフ
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}