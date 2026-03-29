import { http, HttpResponse } from 'msw'
import type {
  TokenResponse,
  User,
  WorkGroup,
  Work,
  WorkItem,
  RiskAssessment,
  ManualRisk,
  WorkComment,
  RiskSummary,
  WorkListPage,
  RiskRecord,
  Incident,
  IncidentComment,
  IncidentActivity,
  Manual,
  Meeting,
  MeetingUpload,
  WorkRiskAcknowledgment,
  MyWork,
  WorkAsset,
  Notification,
  WorkSceneAsset,
  WorkSceneAnnotation,
} from '@/types/api'
import { mockConfigCatalog, mockDb, mockDbReaders } from './db'
import sceneModelUrl from '@/assets/glbfile/Hitem3d-1774536756152.glb?url'

const mapMockUser = (user: {
  id: number
  name: string
  role: string
  is_active: boolean
  contact?: string
}): User => ({
  id: user.id,
  name: user.name,
  role: user.role as User['role'],
  is_active: user.is_active,
  contact: user.contact ?? null,
})

const mapMockNotification = (notification: {
  id: number
  title: string
  content: string
  type: string
  created_at: string
  is_read: boolean
  link?: string
  display_until?: string | null
  pinned: boolean
}): Notification => ({
  id: notification.id,
  title: notification.title,
  content: notification.content,
  type: notification.type as Notification['type'],
  created_at: notification.created_at,
  is_read: notification.is_read,
  link: notification.link || undefined,
  display_until: notification.display_until || null,
  pinned: notification.pinned,
})

const mapMockMeeting = (meeting: {
  id: number
  title: string
  date: string
  participants: string[]
  transcript: string
  sync_state: string
  extracted_risks: RiskRecord[]
}): Meeting => ({
  id: meeting.id,
  title: meeting.title,
  date: meeting.date,
  participants: meeting.participants,
  transcript: meeting.transcript,
  extracted_risks: meeting.extracted_risks,
  sync_state: meeting.sync_state,
})

const mapMockMeetingUpload = (upload: {
  id: number
  meeting_id?: number | null
  filename: string
  created_at: string
}): MeetingUpload => ({
  id: upload.id,
  meeting_id: upload.meeting_id ?? null,
  filename: upload.filename,
  created_at: upload.created_at,
})

// モック データ
const mockUser: User = {
  id: 1,
  name: 'Test User',
  role: 'leader',
  is_active: true,
  contact: 'test.user@example.com',
}

const mockGroups: WorkGroup[] = [
  { id: 1, name: '設備点検' },
  { id: 2, name: '安全巡視' },
  { id: 3, name: '定期メンテナンス' },
]

const mockWorks: Work[] = [
  {
    id: 1,
    title: '第1エリア配管点検',
    description: '高温配管の目視点検と安全確認',
    group_id: 1,
    work_date: new Date().toISOString().split('T')[0],
    status: 'confirmed',
  },
  {
    id: 2,
    title: '安全巡視（午前）',
    description: '工場全体の安全巡視',
    group_id: 2,
    work_date: new Date().toISOString().split('T')[0],
    status: 'draft',
  },
]

const mockWorkItems: WorkItem[] = [
  {
    id: 1,
    work_id: 1,
    name: 'バルブ確認',
    description: '圧力レギュレータの締結状態確認',
  },
  {
    id: 2,
    work_id: 1,
    name: 'ゲージ確認',
    description: '圧力ゲージの指示値確認',
  },
]

const mockRisks: ManualRisk[] = [
  {
    id: 1,
    work_item_id: 1,
    content: '高温配管への接触リスク',
    action: '耐熱手袋を着用する',
    created_at: new Date().toISOString(),
  },
]

const mockAiRisks: RiskAssessment[] = [
  {
    id: 101,
    work_item_id: 1,
    content: 'AI: 温度測定時の火傷リスク',
    action: '距離を確保して測定する',
    generated_at: new Date().toISOString(),
  },
]

const mockComments: WorkComment[] = [
  {
    id: 1,
    work_id: 1,
    user_id: 1,
    content: '本日は特に注意して確認してください。',
    created_at: new Date().toISOString(),
  },
]

const mockRiskRecords: RiskRecord[] = [
  {
    id: 1,
    title: '高温配管の接触リスク',
    severity: 'high',
    status: 'open',
    work_id: 1,
    work_title: '第1エリア配管点検',
    summary: '高温配管周辺での接触に注意が必要。',
    actions: ['耐熱手袋の着用', '立入禁止テープ設置'],
  },
  {
    id: 2,
    title: '足元の転倒リスク',
    severity: 'medium',
    status: 'in_review',
    work_id: 2,
    work_title: '安全巡視（午前）',
    summary: '通路のケーブルで転倒の可能性。',
    actions: ['ケーブルの固定', '通路の整理'],
  },
]

const mockIncidents: Incident[] = [
  {
    id: 1,
    title: '転倒事故',
    type: 'incident',
    date: new Date().toISOString().split('T')[0],
    root_cause: '床面の水漏れによる滑り',
    corrective_actions: ['床面清掃の徹底', '防滑マット設置'],
    status: 'resolved',
    work_id: 1,
    work_title: '第1エリア配管点検',
    assignee_id: 1,
    assignee_name: 'Test User',
    labels: ['緊急', '安全'],
    created_at: '2026-02-15T10:00:00Z',
    updated_at: '2026-02-18T15:30:00Z',
  },
  {
    id: 2,
    title: '火傷事故',
    type: 'incident',
    date: new Date().toISOString().split('T')[0],
    root_cause: '断熱材の劣化で露出部に接触',
    corrective_actions: ['断熱材の補修', '立入禁止表示'],
    status: 'open',
    work_id: 1,
    work_title: '第1エリア配管点検',
    assignee_id: null,
    assignee_name: null,
    labels: ['重要', '設備'],
    created_at: '2026-02-18T14:20:00Z',
    updated_at: '2026-02-18T14:20:00Z',
  },
  {
    id: 3,
    title: '配線への接触',
    type: 'near_miss',
    date: new Date().toISOString().split('T')[0],
    root_cause: '足元の配線が散乱していた',
    corrective_actions: ['配線の固定', '作業前の足元確認'],
    status: 'open',
    work_id: 2,
    work_title: '安全巡視（午前）',
    assignee_id: 1,
    assignee_name: 'Test User',
    labels: ['手順'],
    created_at: '2026-02-19T09:15:00Z',
    updated_at: '2026-02-19T09:15:00Z',
  },
]

const nextIncidentId = () =>
  mockIncidents.reduce((maxId, incident) => Math.max(maxId, incident.id), 0) + 1

const mockUsers: User[] = [
  {
    id: 1,
    name: 'Test User',
    role: 'leader',
    is_active: true,
    contact: 'test.user@example.com',
  },
  {
    id: 2,
    name: '田中太郎',
    role: 'worker',
    is_active: true,
    contact: 'tanaka.taro@example.com',
  },
  {
    id: 3,
    name: '佐藤花子',
    role: 'worker',
    is_active: true,
    contact: 'sato.hanako@example.com',
  },
]

const mockIncidentComments: Record<number, IncidentComment[]> = {
  1: [
    {
      id: 1,
      incident_id: 1,
      user_id: 1,
      user_name: 'Test User',
      content: '清掃完了を確認しました。防滑マットも設置済みです。',
      created_at: '2026-02-18T16:00:00Z',
    },
    {
      id: 2,
      incident_id: 1,
      user_id: 2,
      user_name: '田中太郎',
      content: '了解しました。定期的な清掃を継続します。',
      created_at: '2026-02-18T16:30:00Z',
    },
  ],
  2: [],
  3: [
    {
      id: 3,
      incident_id: 3,
      user_id: 1,
      user_name: 'Test User',
      content: '配線の固定作業を実施予定です。',
      created_at: '2026-02-19T10:00:00Z',
    },
  ],
}

const mockIncidentActivities: Record<number, IncidentActivity[]> = {
  1: [
    {
      id: 1,
      incident_id: 1,
      user_id: 1,
      user_name: 'Test User',
      action_type: 'created',
      content: 'インシデントを作成しました',
      created_at: '2026-02-15T10:00:00Z',
    },
    {
      id: 2,
      incident_id: 1,
      user_id: 1,
      user_name: 'Test User',
      action_type: 'label_added',
      content: 'ラベル「緊急」を追加しました',
      new_value: '緊急',
      created_at: '2026-02-15T10:05:00Z',
    },
    {
      id: 3,
      incident_id: 1,
      user_id: 1,
      user_name: 'Test User',
      action_type: 'assignment',
      content: '担当者を割り当てました',
      new_value: 'Test User',
      created_at: '2026-02-15T10:10:00Z',
    },
    {
      id: 4,
      incident_id: 1,
      user_id: 1,
      user_name: 'Test User',
      action_type: 'status_change',
      content: 'ステータスを変更しました',
      old_value: 'open',
      new_value: 'resolved',
      created_at: '2026-02-18T15:30:00Z',
    },
  ],
  2: [
    {
      id: 5,
      incident_id: 2,
      user_id: 1,
      user_name: 'Test User',
      action_type: 'created',
      content: 'インシデントを作成しました',
      created_at: '2026-02-18T14:20:00Z',
    },
    {
      id: 6,
      incident_id: 2,
      user_id: 1,
      user_name: 'Test User',
      action_type: 'label_added',
      content: 'ラベル「重要」を追加しました',
      new_value: '重要',
      created_at: '2026-02-18T14:21:00Z',
    },
  ],
  3: [
    {
      id: 7,
      incident_id: 3,
      user_id: 1,
      user_name: 'Test User',
      action_type: 'created',
      content: 'ヒヤリハットを作成しました',
      created_at: '2026-02-19T09:15:00Z',
    },
  ],
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    title: '【重要】システムメンテナンスのお知らせ',
    content: '2月25日（火）22:00～24:00の間、システムメンテナンスを実施いたします。この間、全機能がご利用いただけません。',
    type: 'warning',
    created_at: '2026-02-18T09:00:00Z',
    is_read: false,
    display_until: '2026-02-26T00:00:00Z',
    pinned: false,
  },
  {
    id: 2,
    title: '新機能リリース: インシデント管理システム',
    content: 'GitHub Issue風のインシデント管理機能がリリースされました。コメント、タイムライン、ラベル、担当者割り当てが可能です。',
    type: 'success',
    created_at: '2026-02-19T08:00:00Z',
    is_read: false,
    link: '/incidents',
    display_until: null,
    pinned: true,
  },
  {
    id: 3,
    title: '安全巡視の強化について',
    content: '今月より、安全巡視の頻度を週2回から週3回に増やします。各チームリーダーは巡視計画の見直しをお願いします。',
    type: 'info',
    created_at: '2026-02-17T10:30:00Z',
    is_read: true,
    display_until: '2026-02-24T00:00:00Z',
    pinned: false,
  },
  {
    id: 4,
    title: '【緊急】高温配管エリアの立入制限',
    content: '製造ラインAの高温配管周辺で保温材の劣化が確認されました。補修完了まで当該エリアへの立入を制限します。',
    type: 'urgent',
    created_at: '2026-02-15T14:20:00Z',
    is_read: true,
    display_until: '2026-02-22T00:00:00Z',
    pinned: false,
  },
]

const nextNotificationId = () =>
  mockNotifications.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1

const mockManuals: Manual[] = [
  {
    id: 1,
    title: '配管点検マニュアル',
    category: '配管',
    updated_at: new Date().toISOString(),
    summary: '配管点検時の基本手順と安全対策をまとめています。',
  },
  {
    id: 2,
    title: '電源操作手順',
    category: '電気',
    updated_at: new Date().toISOString(),
    summary: '電源操作の事前確認と注意事項を記載しています。',
  },
]

const mockMeetings: Meeting[] = [
  {
    id: 1,
    title: '安全会議',
    date: new Date().toISOString().split('T')[0],
    participants: ['Leader', 'Worker', 'Safety'],
    transcript: '本日のリスク対応について確認しました。',
    extracted_risks: mockRiskRecords,
    sync_state: 'idle',
  },
  {
    id: 2,
    title: '月次オリエンテーション',
    date: new Date().toISOString().split('T')[0],
    participants: ['Leader', 'All'],
    transcript: '安全ルールの再確認を行いました。',
    extracted_risks: [],
    sync_state: 'completed',
  },
]

const mockMeetingUploads: MeetingUpload[] = [
  {
    id: 1,
    meeting_id: 1,
    filename: 'safety_meeting_notes.pdf',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    meeting_id: null,
    filename: 'general_safety_policy.pdf',
    created_at: new Date().toISOString(),
  },
]

const mockAcknowledgments: Record<number, WorkRiskAcknowledgment[]> = {}
const mockRiskChangeAtByWorkId: Record<number, string> = {}

const mockMyWorks: MyWork[] = [
  {
    id: 1,
    title: '製造ラインA 定期点検',
    description: '月次の設備点検と安全確認を実施。',
    work_date: new Date().toISOString().split('T')[0],
    group: '設備点検',
    status: 'in_progress',
    risk_score: 78,
    items: [
      {
        id: 1,
        work_id: 1,
        title: '温度測定',
        status: 'completed',
        steps: ['計測機器を準備する', '各部の温度を記録する'],
        hazards: ['高温部のやけど'],
        tools: ['温度計', '温度計測ガイド'],
      },
    ],
    related_risks: mockRiskRecords,
    incidents: [],
  },
]

const mockWorkAssets: Record<number, WorkAsset> = {
  1: {
    photos: [],
    audios: [],
    notes: ['点検開始前に安全確認済み。'],
  },
}

const mockSceneItemPositions: Record<number, { x: number; y: number; z: number; size?: number }> = {
  1: { x: 0, y: -0.15, z: 0.2, size: 0.06 },
  2: { x: 0.25, y: 0.2, z: -0.15, size: 0.06 },
}

const mockSceneManualRiskPositions: Record<number, { x: number; y: number; z: number; size?: number }> = {
  1: { x: 0.25, y: -0.05, z: 0.2, size: 0.06 },
}

const mockSceneAiRiskPositions: Record<number, { x: number; y: number; z: number; size?: number }> = {
  101: { x: -0.2, y: 0, z: 0, size: 0.06 },
}

const resolveSceneItemPosition = (itemId: number) => {
  return mockSceneItemPositions[itemId] ?? null
}

const resolveSceneManualRiskPosition = (riskId: number) => {
  return mockSceneManualRiskPositions[riskId] ?? null
}

const resolveSceneAiRiskPosition = (riskId: number) => {
  return mockSceneAiRiskPositions[riskId] ?? null
}

const buildWorkScene = (workId: number): WorkSceneAsset | null => {
  const overview = mockDbReaders.getWorkOverview(workId)
  if (!overview) {
    return null
  }

  const annotations: WorkSceneAnnotation[] = overview.items.flatMap((entry) => {
    const itemPosition = resolveSceneItemPosition(entry.item.id)
    const manualRisks = mockDbReaders.listManualRisks(entry.item.id)
    const workAnnotation: WorkSceneAnnotation = {
      id: `work-item-${entry.item.id}`,
      item_id: entry.item.id,
      kind: 'work',
      title: entry.item.name,
      description: entry.item.description,
      position: itemPosition
        ? {
            x: itemPosition.x,
            y: itemPosition.y,
            z: itemPosition.z,
          }
        : null,
      size: itemPosition?.size ?? 0.06,
      steps: [
        `${entry.item.name} の対象設備に移動する`,
        `${entry.item.name} を実施し、値や状態を確認する`,
        '結果を記録し、異常があれば関係者に共有する',
      ],
    }

    const manualRiskAnnotations = manualRisks.map((risk) => {
      const riskPosition = itemPosition ? resolveSceneManualRiskPosition(risk.id) : null

      return {
        id: `manual-risk-${risk.id}`,
        item_id: entry.item.id,
        risk_id: risk.id,
        kind: 'risk' as const,
        title: risk.content,
        description: risk.action ?? `${entry.item.name} に紐づく手入力リスク`,
        position: riskPosition
          ? {
              x: riskPosition.x,
              y: riskPosition.y,
              z: riskPosition.z,
            }
          : null,
        size: riskPosition?.size ?? 0.08,
        severity: 'high' as const,
        source: 'manual' as const,
      }
    })

    const aiRiskAnnotations = entry.risks.map((risk) => {
      const riskPosition = itemPosition ? resolveSceneAiRiskPosition(risk.id) : null

      return {
        id: `ai-risk-${risk.id}`,
        item_id: entry.item.id,
        risk_id: risk.id,
        kind: 'risk' as const,
        title: risk.content,
        description: risk.action ?? `${entry.item.name} に紐づく AI リスク`,
        position: riskPosition
          ? {
              x: riskPosition.x,
              y: riskPosition.y,
              z: riskPosition.z,
            }
          : null,
        size: riskPosition?.size ?? 0.08,
        severity: 'high' as const,
        source: 'ai' as const,
      }
    })

    return [workAnnotation, ...manualRiskAnnotations, ...aiRiskAnnotations]
  })

  return {
    work_id: workId,
    model_name: '現場設備 3D モデル',
    model_url: sceneModelUrl,
    coordinate_system: 'model-origin',
    transform: {
      scale: 2,
      offset: { x: 0, y: 0, z: 0 },
    },
    camera: {
      position: { x: 3.2, y: 2.5, z: 4.4 },
      target: { x: 0, y: 0.45, z: 0 },
      fov: 30,
    },
    annotations,
  }
}

const mockWorkDateSummary = mockWorks.map((work) => ({
  work_date: work.work_date,
  count: 1,
}))

export const handlers = [
  // ===== 認証 =====
  http.post('*/auth/login', () => {
    return HttpResponse.json<TokenResponse>(
      {
        access_token: 'mock-token-' + Date.now(),
        token_type: 'bearer',
      },
      { status: 200 }
    )
  }),

  http.get('*/dashboard', () => {
    return HttpResponse.json({ ok: true }, { status: 200 })
  }),

  http.get('*/auth/me', () => {
    const currentUser = mockDbReaders.getCurrentUser()
    return HttpResponse.json<User>(currentUser ? mapMockUser(currentUser) : mockUser, { status: 200 })
  }),

  // ===== グループ =====
  http.get('*/works/groups', () => {
    const groups = mockDbReaders.listWorkGroups()
    return HttpResponse.json<WorkGroup[]>(groups.length > 0 ? groups : mockGroups, { status: 200 })
  }),

  // ===== 作業一覧 =====
  http.get('*/works/daily', ({ request }) => {
    const url = new URL(request.url)
    const workDate = url.searchParams.get('work_date') ?? undefined
    const items = mockDbReaders.listWorkOverviews(workDate)
    return HttpResponse.json(items.length > 0 ? items : mockWorks.map((work) => ({
      work,
      items: mockWorkItems
        .filter((item) => item.work_id === work.id)
        .map((item) => ({
          item,
          risks: mockAiRisks.filter((risk) => risk.work_item_id === item.id),
        })),
    })), { status: 200 })
  }),

  http.get('*/works/list', ({ request }) => {
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit')) || 20
    const offset = Number(url.searchParams.get('offset')) || 0
    const startDate = url.searchParams.get('start_date')
    const endDate = url.searchParams.get('end_date')
    const source = mockDbReaders.listWorkOverviews().filter(({ work }) => {
      if (startDate && work.work_date < startDate) return false
      if (endDate && work.work_date > endDate) return false
      return true
    })
    const pageItems = (source.length > 0 ? source : mockWorks.map((work) => ({
      work,
      items: mockWorkItems.filter((item) => item.work_id === work.id).map((item) => ({ item, risks: [] })),
    }))).slice(offset, offset + limit)

    return HttpResponse.json<WorkListPage>(
      {
        items: pageItems.map(({ work, items }) => ({
          work: work as Work,
          items: items.map((entry) => entry.item),
          risk_count:
            mockDbReaders.listManualRisks().filter((risk) =>
              items.some((entry) => entry.item.id === risk.work_item_id),
            ).length +
            mockDbReaders.listAiRisks().filter((risk) =>
              items.some((entry) => entry.item.id === risk.work_item_id),
            ).length,
        })),
        total: source.length > 0 ? source.length : mockWorks.length,
        limit,
        offset,
      },
      { status: 200 }
    )
  }),

  http.get('*/works/dates', () => {
    const workDateSummary = Object.values(
      mockDbReaders.listWorks().reduce<Record<string, { work_date: string; count: number }>>((accumulator, work) => {
        accumulator[work.work_date] = {
          work_date: work.work_date,
          count: (accumulator[work.work_date]?.count ?? 0) + 1,
        }
        return accumulator
      }, {}),
    )
    return HttpResponse.json(workDateSummary.length > 0 ? workDateSummary : mockWorkDateSummary, { status: 200 })
  }),

  http.get('*/works', ({ request }) => {
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit')) || 20
    const offset = Number(url.searchParams.get('offset')) || 0
    const startDate = url.searchParams.get('start_date')
    const endDate = url.searchParams.get('end_date')
    const source = mockDbReaders.listWorkOverviews().filter(({ work }) => {
      if (startDate && work.work_date < startDate) return false
      if (endDate && work.work_date > endDate) return false
      return true
    })
    const pageItems = (source.length > 0 ? source : mockWorks.map((work) => ({
      work,
      items: mockWorkItems.filter((item) => item.work_id === work.id).map((item) => ({ item, risks: [] })),
    }))).slice(offset, offset + limit)

    return HttpResponse.json<WorkListPage>(
      {
        items: pageItems.map(({ work, items }) => ({
          work: work as Work,
          items: items.map((entry) => entry.item),
          risk_count:
            mockDbReaders.listManualRisks().filter((risk) =>
              items.some((entry) => entry.item.id === risk.work_item_id),
            ).length +
            mockDbReaders.listAiRisks().filter((risk) =>
              items.some((entry) => entry.item.id === risk.work_item_id),
            ).length,
        })),
        total: source.length > 0 ? source.length : mockWorks.length,
        limit,
        offset,
      },
      { status: 200 }
    )
  }),

  http.get('*/works/:workId', ({ params }) => {
    const workId = Number(params.workId)
    const workOverview = mockDbReaders.getWorkOverview(workId)

    if (!workOverview) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return HttpResponse.json(workOverview, { status: 200 })
  }),

  http.get('*/works/:workId/scene', ({ params }) => {
    const workId = Number(params.workId)
    const scene = buildWorkScene(workId)

    if (!scene) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return HttpResponse.json(scene, { status: 200 })
  }),

  http.post('*/works', async ({ request }) => {
    const body = (await request.json()) as Partial<Work> & {
      items?: Array<{
        name?: string
        description?: string
        risks?: Array<{
          title?: string
          content?: string
          severity?: 'low' | 'medium' | 'high'
          risk_level?: 'low' | 'medium' | 'high'
          action?: string
        }>
      }>
    }
    const newWork = mockDb.work.create({
      id: mockDb.work.getAll().reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
      title: body.title || '',
      description: body.description || '',
      group_id: body.group_id || 1,
      work_date: body.work_date || new Date().toISOString().split('T')[0],
      status: body.status || 'draft',
    })

    body.items?.forEach((item) => {
      const newItem = mockDb.workItem.create({
        id: mockDb.workItem.getAll().reduce((maxId, entry) => Math.max(maxId, entry.id), 0) + 1,
        work_id: newWork.id,
        name: item.name || '',
        description: item.description || '',
      })

      item.risks?.forEach((risk) => {
        if (!(risk.title || risk.content || risk.severity || risk.risk_level || risk.action)) {
          return
        }

        mockDb.manualRisk.create({
          id: mockDb.manualRisk.getAll().reduce((maxId, entry) => Math.max(maxId, entry.id), 0) + 1,
          work_item_id: newItem.id,
          title: risk.title || '',
          content: risk.content || risk.title || '',
          severity: risk.severity || '',
          risk_level: risk.risk_level || '',
          action: risk.action || '',
          created_at: new Date().toISOString(),
        })
      })
    })

    return HttpResponse.json(newWork, { status: 201 })
  }),

  // ===== 作業項目 =====
  http.post('*/works/:workId/items', async ({ request, params }) => {
    const body = (await request.json()) as Partial<WorkItem>
    const newItem = mockDb.workItem.create({
      id: mockDb.workItem.getAll().reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
      work_id: Number(params.workId),
      name: body.name || '',
      description: body.description || '',
    })
    return HttpResponse.json(newItem, { status: 201 })
  }),

  // ===== 手入力リスク =====
  http.get('*/works/items/:itemId/manual-risks', ({ params }) => {
    const itemId = Number(params.itemId)
    const risks = mockRisks.filter((risk) => risk.work_item_id === itemId)
    return HttpResponse.json<ManualRisk[]>(risks, { status: 200 })
  }),

  http.post('*/works/items/:itemId/manual-risks', async ({ request, params }) => {
    const body = (await request.json()) as { content: string; action?: string | null }
    const nextId = mockRisks.reduce((maxId, risk) => Math.max(maxId, risk.id), 0) + 1
    const newRisk: ManualRisk = {
      id: nextId,
      work_item_id: Number(params.itemId),
      content: body.content,
      action: body.action ?? null,
      created_at: new Date().toISOString(),
    }
    mockRisks.push(newRisk)
    const workItem = mockWorkItems.find((item) => item.id === newRisk.work_item_id)
    if (workItem) {
      mockRiskChangeAtByWorkId[workItem.work_id] = new Date().toISOString()
    }
    return HttpResponse.json(newRisk, { status: 201 })
  }),

  http.get('*/works/items/:itemId/risks/manual', ({ params }) => {
    const itemId = Number(params.itemId)
    const risks = mockDbReaders.listManualRisks(itemId)
    return HttpResponse.json<ManualRisk[]>(risks, { status: 200 })
  }),

  http.post('*/works/items/:itemId/risks/manual', async ({ request, params }) => {
    const body = (await request.json()) as {
      title?: string | null
      content: string
      severity?: 'low' | 'medium' | 'high' | null
      risk_level?: 'low' | 'medium' | 'high' | null
      action?: string | null
    }
    const newRisk = mockDb.manualRisk.create({
      id: mockDb.manualRisk.getAll().reduce((maxId, risk) => Math.max(maxId, risk.id), 0) + 1,
      work_item_id: Number(params.itemId),
      title: body.title ?? '',
      content: body.content,
      severity: body.severity ?? '',
      risk_level: body.risk_level ?? '',
      action: body.action ?? '',
      created_at: new Date().toISOString(),
    })
    const workItem = mockDb.workItem.getAll().find((item) => item.id === newRisk.work_item_id)
    if (workItem) {
      mockRiskChangeAtByWorkId[workItem.work_id] = new Date().toISOString()
    }
    return HttpResponse.json(
      {
        ...newRisk,
        title: newRisk.title || null,
        severity: newRisk.severity || null,
        risk_level: newRisk.risk_level || null,
        action: newRisk.action || null,
      },
      { status: 201 },
    )
  }),

  http.patch('*/works/items/risks/manual/:riskId', async ({ request, params }) => {
    const body = (await request.json()) as {
      title?: string | null
      content?: string | null
      severity?: 'low' | 'medium' | 'high' | null
      risk_level?: 'low' | 'medium' | 'high' | null
      action?: string | null
    }
    const riskId = Number(params.riskId)
    const risk = mockDb.manualRisk.update({
      where: { id: { equals: riskId } },
      data: {
        ...(body.title !== undefined ? { title: body.title ?? '' } : {}),
        ...(body.content !== undefined ? { content: body.content ?? '' } : {}),
        ...(body.severity !== undefined ? { severity: body.severity ?? '' } : {}),
        ...(body.risk_level !== undefined ? { risk_level: body.risk_level ?? '' } : {}),
        ...(body.action !== undefined ? { action: body.action ?? '' } : {}),
      },
    })
    if (!risk) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const workItem = mockDb.workItem.getAll().find((item) => item.id === risk.work_item_id)
    if (workItem) {
      mockRiskChangeAtByWorkId[workItem.work_id] = new Date().toISOString()
    }
    return HttpResponse.json(
      {
        ...risk,
        title: risk.title || null,
        severity: risk.severity || null,
        risk_level: risk.risk_level || null,
        action: risk.action || null,
      },
      { status: 200 },
    )
  }),

  http.delete('*/works/items/risks/manual/:riskId', ({ params }) => {
    const riskId = Number(params.riskId)
    const risk = mockDb.manualRisk.getAll().find((item) => item.id === riskId)
    if (!risk) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    mockDb.manualRisk.delete({ where: { id: { equals: riskId } } })
    const workItem = mockDb.workItem.getAll().find((item) => item.id === risk.work_item_id)
    if (workItem) {
      mockRiskChangeAtByWorkId[workItem.work_id] = new Date().toISOString()
    }
    return HttpResponse.json({ deleted: true }, { status: 200 })
  }),

  // ===== AI リスク =====
  http.post('*/works/items/:itemId/risks/generate', ({ params }) => {
    const assessment = mockDb.aiRisk.create({
      id: mockDb.aiRisk.getAll().reduce((maxId, risk) => Math.max(maxId, risk.id), 99) + 1,
      work_item_id: Number(params.itemId),
      title: '',
      content: 'AI-generated risk assessment',
      severity: '',
      risk_level: '',
      action: '',
      generated_at: new Date().toISOString(),
    })
    const workItem = mockDb.workItem.getAll().find((item) => item.id === assessment.work_item_id)
    if (workItem) {
      mockRiskChangeAtByWorkId[workItem.work_id] = new Date().toISOString()
    }
    return HttpResponse.json(
      {
        ...assessment,
        title: assessment.title || null,
        severity: assessment.severity || null,
        risk_level: assessment.risk_level || null,
        action: assessment.action || null,
      },
      { status: 201 },
    )
  }),

  http.patch('*/works/items/risks/ai/:riskId', async ({ request, params }) => {
    const body = (await request.json()) as {
      title?: string | null
      content?: string | null
      severity?: 'low' | 'medium' | 'high' | null
      risk_level?: 'low' | 'medium' | 'high' | null
      action?: string | null
    }
    const riskId = Number(params.riskId)
    const risk = mockDb.aiRisk.update({
      where: { id: { equals: riskId } },
      data: {
        ...(body.title !== undefined ? { title: body.title ?? '' } : {}),
        ...(body.content !== undefined ? { content: body.content ?? '' } : {}),
        ...(body.severity !== undefined ? { severity: body.severity ?? '' } : {}),
        ...(body.risk_level !== undefined ? { risk_level: body.risk_level ?? '' } : {}),
        ...(body.action !== undefined ? { action: body.action ?? '' } : {}),
      },
    })
    if (!risk) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const workItem = mockDb.workItem.getAll().find((item) => item.id === risk.work_item_id)
    if (workItem) {
      mockRiskChangeAtByWorkId[workItem.work_id] = new Date().toISOString()
    }
    return HttpResponse.json(
      {
        ...risk,
        title: risk.title || null,
        severity: risk.severity || null,
        risk_level: risk.risk_level || null,
        action: risk.action || null,
      },
      { status: 200 },
    )
  }),

  http.delete('*/works/items/risks/ai/:riskId', ({ params }) => {
    const riskId = Number(params.riskId)
    const risk = mockDb.aiRisk.getAll().find((item) => item.id === riskId)
    if (!risk) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    mockDb.aiRisk.delete({ where: { id: { equals: riskId } } })
    const workItem = mockDb.workItem.getAll().find((item) => item.id === risk.work_item_id)
    if (workItem) {
      mockRiskChangeAtByWorkId[workItem.work_id] = new Date().toISOString()
    }
    return HttpResponse.json({ deleted: true }, { status: 200 })
  }),

  // ===== リスク判定 =====
  http.get('*/works/:workId/risk-summary', ({ params }) => {
    const summary: RiskSummary = mockDbReaders.getRiskSummary(Number(params.workId))
    return HttpResponse.json(summary, { status: 200 })
  }),

  // ===== リスク台帳 =====
  http.get('*/risks', () => {
    return HttpResponse.json<RiskRecord[]>(mockRiskRecords, { status: 200 })
  }),

  http.get('*/risks/:riskId', ({ params }) => {
    const riskId = Number(params.riskId)
    const risk = mockRiskRecords.find((item) => item.id === riskId)
    if (!risk) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(risk, { status: 200 })
  }),

  http.patch('*/risks/:riskId/status', async ({ request, params }) => {
    const body = (await request.json()) as { status: RiskRecord['status'] }
    const riskId = Number(params.riskId)
    const risk = mockRiskRecords.find((item) => item.id === riskId)
    if (!risk) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    risk.status = body.status
    return HttpResponse.json(risk, { status: 200 })
  }),

  http.patch('*/risks/:riskId/severity', async ({ request, params }) => {
    const body = (await request.json()) as { severity: RiskRecord['severity'] }
    const riskId = Number(params.riskId)
    const risk = mockRiskRecords.find((item) => item.id === riskId)
    if (!risk) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    risk.severity = body.severity
    return HttpResponse.json(risk, { status: 200 })
  }),

  http.post('*/risks/:riskId/actions', async ({ request, params }) => {
    const body = (await request.json()) as { action: string }
    const riskId = Number(params.riskId)
    const risk = mockRiskRecords.find((item) => item.id === riskId)
    if (!risk) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    risk.actions = [body.action, ...risk.actions]
    return HttpResponse.json(risk, { status: 200 })
  }),

  // ===== マイワーク =====
  http.get('*/my-works', ({ request }) => {
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit')) || 20
    const offset = Number(url.searchParams.get('offset')) || 0
    
    const items = mockMyWorks.slice(offset, offset + limit)
    return HttpResponse.json({
      items,
      total: mockMyWorks.length,
      limit,
      offset,
    }, { status: 200 })
  }),

  http.get('*/my-works/:workId', ({ params }) => {
    const workId = Number(params.workId)
    const work = mockMyWorks.find((item) => item.id === workId)
    if (!work) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(work, { status: 200 })
  }),

  http.get('*/my-works/:workId/assets', ({ params }) => {
    const workId = Number(params.workId)
    const assets = mockWorkAssets[workId] || { photos: [], audios: [], notes: [] }
    return HttpResponse.json(assets, { status: 200 })
  }),

  http.post('*/my-works/:workId/assets/photos', async ({ request, params }) => {
    const body = (await request.json()) as { files: string[] }
    const workId = Number(params.workId)
    const current = mockWorkAssets[workId] || { photos: [], audios: [], notes: [] }
    const assets = {
      ...current,
      photos: [...body.files, ...current.photos],
    }
    mockWorkAssets[workId] = assets
    return HttpResponse.json(assets, { status: 200 })
  }),

  http.post('*/my-works/:workId/assets/audios', async ({ request, params }) => {
    const body = (await request.json()) as { files: string[] }
    const workId = Number(params.workId)
    const current = mockWorkAssets[workId] || { photos: [], audios: [], notes: [] }
    const assets = {
      ...current,
      audios: [...body.files, ...current.audios],
    }
    mockWorkAssets[workId] = assets
    return HttpResponse.json(assets, { status: 200 })
  }),

  http.post('*/my-works/:workId/assets/notes', async ({ request, params }) => {
    const body = (await request.json()) as { note: string }
    const workId = Number(params.workId)
    const current = mockWorkAssets[workId] || { photos: [], audios: [], notes: [] }
    const assets = {
      ...current,
      notes: [body.note, ...current.notes],
    }
    mockWorkAssets[workId] = assets
    return HttpResponse.json(assets, { status: 200 })
  }),

  // ===== 事故 =====
  http.get('*/incidents', () => {
    const incidents = mockDbReaders.listIncidents()
    return HttpResponse.json<Incident[]>(incidents.length > 0 ? incidents : mockIncidents, { status: 200 })
  }),

  http.post('*/incidents', async ({ request }) => {
    const body = (await request.json()) as {
      title: string
      type: 'incident' | 'near_miss'
      date: string
      root_cause: string
      corrective_actions?: string[]
      status?: Incident['status']
      work_id?: number
      assignee_id?: number
      labels?: string[]
    }
    const now = new Date().toISOString()
    const incident = mockDb.incident.create({
      id: nextIncidentId(),
      title: body.title,
      type: body.type,
      date: body.date,
      root_cause: body.root_cause,
      corrective_actions_json: JSON.stringify(body.corrective_actions ?? []),
      status: body.status ?? 'open',
      work_id: body.work_id ?? 0,
      work_title: body.work_id ? mockDb.work.getAll().find((w) => w.id === body.work_id)?.title ?? '' : '',
      assignee_id: body.assignee_id ?? 0,
      assignee_name: body.assignee_id ? mockDb.user.getAll().find((u) => u.id === body.assignee_id)?.name ?? '' : '',
      labels_json: JSON.stringify(body.labels ?? []),
      created_at: now,
      updated_at: now,
    })
    mockDb.incidentActivity.create({
      id: mockDb.incidentActivity.getAll().reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
      incident_id: incident.id,
      user_id: mockUser.id,
      user_name: mockUser.name,
      action_type: 'created',
      content: `${body.type === 'incident' ? 'インシデント' : 'ヒヤリハット'}を作成しました`,
      old_value: '',
      new_value: '',
      created_at: now,
    })
    return HttpResponse.json(mockDbReaders.getIncident(incident.id), { status: 201 })
  }),

  http.get('*/incidents/:incidentId', ({ params }) => {
    const incidentId = Number(params.incidentId)
    const incident = mockDbReaders.getIncident(incidentId)
    if (!incident) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(incident, { status: 200 })
  }),

  http.patch('*/incidents/:incidentId/status', async ({ request, params }) => {
    const body = (await request.json()) as { status: Incident['status'] }
    const incidentId = Number(params.incidentId)
    const current = mockDbReaders.getIncident(incidentId)
    const incident = mockDb.incident.update({
      where: { id: { equals: incidentId } },
      data: {
        status: body.status,
        updated_at: new Date().toISOString(),
      },
    })
    if (!incident) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    mockDb.incidentActivity.create({
      id: mockDb.incidentActivity.getAll().reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
      incident_id: incidentId,
      user_id: mockUser.id,
      user_name: mockUser.name,
      action_type: 'status_change',
      content: 'ステータスを変更しました',
      old_value: current?.status ?? '',
      new_value: body.status,
      created_at: incident.updated_at,
    })
    return HttpResponse.json(mockDbReaders.getIncident(incidentId), { status: 200 })
  }),

  http.post('*/incidents/:incidentId/actions', async ({ request, params }) => {
    const body = (await request.json()) as { action: string }
    const incidentId = Number(params.incidentId)
    const current = mockDbReaders.getIncident(incidentId)
    const incident = mockDb.incident.update({
      where: { id: { equals: incidentId } },
      data: {
        corrective_actions_json: JSON.stringify([body.action, ...(current?.corrective_actions ?? [])]),
        updated_at: new Date().toISOString(),
      },
    })
    if (!incident) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(mockDbReaders.getIncident(incidentId), { status: 200 })
  }),

  // ===== インシデント コメント =====
  http.get('*/incidents/:incidentId/comments', ({ params }) => {
    const incidentId = Number(params.incidentId)
    const comments = mockDbReaders.listIncidentComments(incidentId)
    return HttpResponse.json<IncidentComment[]>(comments.length > 0 ? comments : (mockIncidentComments[incidentId] || []), { status: 200 })
  }),

  http.post('*/incidents/:incidentId/comments', async ({ request, params }) => {
    const body = (await request.json()) as { content: string }
    const incidentId = Number(params.incidentId)
    const incident = mockDb.incident.getAll().find((item) => item.id === incidentId)
    if (!incident) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const now = new Date().toISOString()
    const newComment = mockDb.incidentComment.create({
      id: mockDb.incidentComment.getAll().reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
      incident_id: incidentId,
      user_id: mockUser.id,
      user_name: mockUser.name,
      content: body.content,
      created_at: now,
      updated_at: '',
    })
    mockDb.incident.update({ where: { id: { equals: incidentId } }, data: { updated_at: now } })
    mockDb.incidentActivity.create({
      id: mockDb.incidentActivity.getAll().reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
      incident_id: incidentId,
      user_id: mockUser.id,
      user_name: mockUser.name,
      action_type: 'comment',
      content: body.content,
      old_value: '',
      new_value: '',
      created_at: now,
    })
    return HttpResponse.json({ ...newComment, updated_at: undefined }, { status: 201 })
  }),

  http.patch('*/incidents/:incidentId/comments/:commentId', async ({ request, params }) => {
    const body = (await request.json()) as { content: string }
    const commentId = Number(params.commentId)
    const comment = mockDb.incidentComment.update({
      where: { id: { equals: commentId } },
      data: { content: body.content, updated_at: new Date().toISOString() },
    })
    if (!comment) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json({ ...comment, updated_at: comment.updated_at || undefined }, { status: 200 })
  }),

  http.delete('*/incidents/:incidentId/comments/:commentId', ({ params }) => {
    const commentId = Number(params.commentId)
    const comment = mockDb.incidentComment.getAll().find((entry) => entry.id === commentId)
    if (!comment) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    mockDb.incidentComment.delete({ where: { id: { equals: commentId } } })
    return HttpResponse.json({ deleted: true }, { status: 200 })
  }),

  // ===== インシデント アクティビティ =====
  http.get('*/incidents/:incidentId/activities', ({ params }) => {
    const incidentId = Number(params.incidentId)
    const activities = mockDbReaders.listIncidentActivities(incidentId)
    return HttpResponse.json<IncidentActivity[]>(activities.length > 0 ? activities : (mockIncidentActivities[incidentId] || []), { status: 200 })
  }),

  // ===== インシデント 担当者 =====
  http.patch('*/incidents/:incidentId/assignment', async ({ request, params }) => {
    const body = (await request.json()) as { assignee_id: number | null }
    const incidentId = Number(params.incidentId)
    const current = mockDbReaders.getIncident(incidentId)
    const incident = mockDb.incident.update({
      where: { id: { equals: incidentId } },
      data: {
        assignee_id: body.assignee_id ?? 0,
        assignee_name: body.assignee_id
          ? mockDb.user.getAll().find((u) => u.id === body.assignee_id)?.name ?? ''
          : '',
        updated_at: new Date().toISOString(),
      },
    })
    if (!incident) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    mockDb.incidentActivity.create({
      id: mockDb.incidentActivity.getAll().reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
      incident_id: incidentId,
      user_id: mockUser.id,
      user_name: mockUser.name,
      action_type: 'assignment',
      content: body.assignee_id ? '担当者を割り当てました' : '担当者を解除しました',
      old_value: current?.assignee_name ?? '',
      new_value: incident.assignee_name || '',
      created_at: incident.updated_at,
    })
    return HttpResponse.json(mockDbReaders.getIncident(incidentId), { status: 200 })
  }),

  // ===== インシデント ラベル =====
  http.post('*/incidents/:incidentId/labels', async ({ request, params }) => {
    const body = (await request.json()) as { label: string }
    const incidentId = Number(params.incidentId)
    const current = mockDbReaders.getIncident(incidentId)
    const incident = mockDb.incident.update({
      where: { id: { equals: incidentId } },
      data: {
        labels_json: JSON.stringify([...(current?.labels ?? []), body.label]),
        updated_at: new Date().toISOString(),
      },
    })
    if (!incident) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (!(current?.labels ?? []).includes(body.label)) {
      mockDb.incidentActivity.create({
        id: mockDb.incidentActivity.getAll().reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
        incident_id: incidentId,
        user_id: mockUser.id,
        user_name: mockUser.name,
        action_type: 'label_added',
        content: `ラベル「${body.label}」を追加しました`,
        old_value: '',
        new_value: body.label,
        created_at: incident.updated_at,
      })
    }
    return HttpResponse.json(mockDbReaders.getIncident(incidentId), { status: 200 })
  }),

  http.delete('*/incidents/:incidentId/labels/:label', ({ params }) => {
    const incidentId = Number(params.incidentId)
    const label = decodeURIComponent(String(params.label))
    const current = mockDbReaders.getIncident(incidentId)
    const incident = mockDb.incident.update({
      where: { id: { equals: incidentId } },
      data: {
        labels_json: JSON.stringify((current?.labels ?? []).filter((entry) => entry !== label)),
        updated_at: new Date().toISOString(),
      },
    })
    if (!incident) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if ((current?.labels ?? []).includes(label)) {
      mockDb.incidentActivity.create({
        id: mockDb.incidentActivity.getAll().reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
        incident_id: incidentId,
        user_id: mockUser.id,
        user_name: mockUser.name,
        action_type: 'label_removed',
        content: `ラベル「${label}」を削除しました`,
        old_value: label,
        new_value: '',
        created_at: incident.updated_at,
      })
    }
    return HttpResponse.json(mockDbReaders.getIncident(incidentId), { status: 200 })
  }),

  // ===== ユーザー =====
  http.get('*/users', () => {
    const users = mockDbReaders.listUsers().map(mapMockUser)
    return HttpResponse.json<User[]>(users.length > 0 ? users : mockUsers, { status: 200 })
  }),

  // ===== 会議 =====
  http.get('*/meetings', () => {
    const meetings = mockDbReaders.listMeetings().map(mapMockMeeting)
    return HttpResponse.json<Meeting[]>(meetings.length > 0 ? meetings : mockMeetings, { status: 200 })
  }),

  http.get('*/meetings/uploads', ({ request }) => {
    const url = new URL(request.url)
    const meetingIdParam = url.searchParams.get('meeting_id')
    const meetingId = meetingIdParam ? Number(meetingIdParam) : null
    const uploads = mockDbReaders.listMeetingUploads().filter((item) =>
      meetingIdParam ? item.meeting_id === meetingId : item.meeting_id === null
    ).map(mapMockMeetingUpload)
    return HttpResponse.json<MeetingUpload[]>(uploads.length > 0 ? uploads : mockMeetingUploads, { status: 200 })
  }),

  http.post('*/meetings/uploads', async ({ request }) => {
    const body = (await request.json()) as { meeting_id?: number | null; files: string[] }
    const now = new Date().toISOString()
    const created = body.files.map((filename) => {
      const upload = mockDb.meetingUpload.create({
        id: mockDb.meetingUpload.getAll().reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
        meeting_id: body.meeting_id ?? undefined,
        filename,
        created_at: now,
      })
      return mapMockMeetingUpload({
        ...upload,
        meeting_id: upload.meeting_id || null,
      })
    })
    return HttpResponse.json(created, { status: 201 })
  }),

  http.get('*/meetings/:meetingId', ({ params }) => {
    const meetingId = Number(params.meetingId)
    const meeting = mockDbReaders.listMeetings().find((item) => item.id === meetingId)
    if (!meeting) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(mapMockMeeting(meeting), { status: 200 })
  }),

  http.patch('*/meetings/:meetingId/sync-state', async ({ request, params }) => {
    const body = (await request.json()) as { sync_state: string }
    const meetingId = Number(params.meetingId)
    const meeting = mockDb.meeting.update({
      where: { id: { equals: meetingId } },
      data: { sync_state: body.sync_state },
    })
    if (!meeting) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(mapMockMeeting({
      ...meeting,
      participants: JSON.parse(meeting.participants_json) as string[],
      extracted_risks: [],
    }), { status: 200 })
  }),

  // ===== 手順書 =====
  http.get('*/manuals', () => {
    const manuals = mockDbReaders.listManuals()
    return HttpResponse.json<Manual[]>(manuals.length > 0 ? manuals : mockManuals, { status: 200 })
  }),

  http.get('*/manuals/:manualId', ({ params }) => {
    const manualId = Number(params.manualId)
    const manual = mockDbReaders.listManuals().find((item) => item.id === manualId)
    if (!manual) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(manual, { status: 200 })
  }),

  // ===== コメント =====
  http.get('*/works/:workId/comments', ({ params }) => {
    const workId = Number(params.workId)
    const comments = mockDbReaders.listWorkComments(workId)
    return HttpResponse.json<WorkComment[]>(comments.length > 0 ? comments : mockComments.filter((comment) => comment.work_id === workId), { status: 200 })
  }),

  http.post('*/works/:workId/comments', async ({ request, params }) => {
    const body = (await request.json()) as { content: string }
    const newComment = mockDb.workComment.create({
      id: mockDb.workComment.getAll().reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
      work_id: Number(params.workId),
      user_id: mockUser.id,
      content: body.content,
      created_at: new Date().toISOString(),
    })
    return HttpResponse.json(newComment, { status: 201 })
  }),

  // ===== 安全確認（新規 Phase 1） =====
  http.post('*/works/:workId/acknowledge', async ({ request, params }) => {
    const body = (await request.json()) as {
      signature_base64?: string | null
      acknowledged_risk_ids: number[]
      acknowledged_risks?: Array<{
        id: number
        source: 'ai' | 'manual'
        content: string
        action?: string | null
        item_name?: string | null
      }>
    }
    const workId = Number(params.workId)
    const acknowledgment: WorkRiskAcknowledgment = {
      id: mockDb.acknowledgment.getAll().reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
      work_id: workId,
      user_id: mockUser.id,
      acknowledged_at: new Date().toISOString(),
      signature_base64: body.signature_base64 || null,
      acknowledged_risk_ids: body.acknowledged_risk_ids ?? [],
      acknowledged_risks: body.acknowledged_risks ?? [],
    }
    mockDb.acknowledgment.create({
      id: acknowledgment.id,
      work_id: acknowledgment.work_id,
      user_id: acknowledgment.user_id,
      acknowledged_at: acknowledgment.acknowledged_at,
      signature_base64: acknowledgment.signature_base64 ?? '',
      acknowledged_risk_ids_json: JSON.stringify(acknowledgment.acknowledged_risk_ids),
      acknowledged_risks_json: JSON.stringify(acknowledgment.acknowledged_risks),
    })
    mockRiskChangeAtByWorkId[workId] = mockRiskChangeAtByWorkId[workId] ??
      new Date(acknowledgment.acknowledged_at).toISOString()
    return HttpResponse.json(acknowledgment, { status: 201 })
  }),

  http.get('*/works/:workId/acknowledgment', ({ params }) => {
    const workId = Number(params.workId)
    const history = mockDbReaders.listAcknowledgments(workId)
    const acknowledgment = history[0]
    if (!acknowledgment) {
      const fallback = (mockAcknowledgments[workId] || [])[0]
      if (!fallback) {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 })
      }
      return HttpResponse.json(fallback, { status: 200 })
    }
    const riskChangedAt = mockRiskChangeAtByWorkId[workId]
    if (riskChangedAt && riskChangedAt > acknowledgment.acknowledged_at) {
      return HttpResponse.json({ error: 'Not acknowledged yet' }, { status: 404 })
    }
    return HttpResponse.json(acknowledgment, { status: 200 })
  }),

  http.get('*/works/:workId/acknowledgments/history', ({ params }) => {
    const workId = Number(params.workId)
    const history = mockDbReaders.listAcknowledgments(workId)
    return HttpResponse.json(history.length > 0 ? history : (mockAcknowledgments[workId] || []), { status: 200 })
  }),

  // ===== 監査ログ =====
  http.get('*/audit/logs', () => {
    return HttpResponse.json(
      [
        {
          id: 1,
          action: 'create_work',
          user_id: mockUser.id,
          work_id: 1,
          details: 'Created work with 2 items',
          timestamp: new Date().toISOString(),
        },
      ],
      { status: 200 }
    )
  }),

  // ===== 設定 =====
  http.get('*/config/catalog', () => {
    return HttpResponse.json(mockConfigCatalog, { status: 200 })
  }),

  // ===== 通知 =====
  http.get('*/notifications', ({ request }) => {
    const url = new URL(request.url)
    const unreadOnly = url.searchParams.get('unread_only') === 'true'
    const limit = Number(url.searchParams.get('limit')) || 10
    
    const source = mockDbReaders.listNotifications().map(mapMockNotification)
    let filtered = unreadOnly
      ? source.filter((n) => !n.is_read)
      : (source.length > 0 ? source : mockNotifications)
    filtered = filtered.sort(
      (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
    )
    filtered = filtered.slice(0, limit)
    
    return HttpResponse.json<Notification[]>(filtered, { status: 200 })
  }),

  http.get('*/notifications/:notificationId', ({ params }) => {
    const notificationId = Number(params.notificationId)
    const notification = mockDbReaders
      .listNotifications()
      .map(mapMockNotification)
      .find((item) => item.id === notificationId)
    if (!notification) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(notification, { status: 200 })
  }),

  http.post('*/notifications', async ({ request }) => {
    const body = (await request.json()) as {
      title: string
      content: string
      type: Notification['type']
      link?: string
      display_until?: string | null
      pinned?: boolean
    }
    const created = mockDb.notification.create({
      id: Math.max(nextNotificationId(), mockDb.notification.getAll().reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1),
      title: body.title,
      content: body.content,
      type: body.type,
      link: body.link ?? '',
      created_at: new Date().toISOString(),
      is_read: false,
      display_until: body.display_until ?? '',
      pinned: body.pinned ?? false,
    })
    return HttpResponse.json(mapMockNotification({
      ...created,
      link: created.link || undefined,
      display_until: created.display_until || undefined,
    }), { status: 201 })
  }),

  http.patch('*/notifications/:notificationId/read', ({ params }) => {
    const notificationId = Number(params.notificationId)
    const notification = mockDb.notification.update({
      where: { id: { equals: notificationId } },
      data: { is_read: true },
    })
    if (!notification) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(mapMockNotification({
      ...notification,
      link: notification.link || undefined,
      display_until: notification.display_until || undefined,
    }), { status: 200 })
  }),
]
