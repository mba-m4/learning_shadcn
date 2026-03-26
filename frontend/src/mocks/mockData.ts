export type MockRiskSeverity = 'low' | 'medium' | 'high'
export type MockRiskStatus = 'open' | 'in_review' | 'closed'

export interface MockCoordinates {
  x: number
  y: number
  width?: number
  height?: number
}

export interface MockWorkLocation {
  id: string
  name: string
  mapType: 'image' | '3d'
  mapFilePath: string
  coordinates: MockCoordinates
  description?: string
}

export interface MockWorkItem {
  id: string
  title: string
  status: 'pending' | 'in_progress' | 'completed'
  steps: string[]
  hazards: string[]
  tools: string[]
}

export interface MockWork {
  id: string
  title: string
  description: string
  date: string
  group: string
  status: 'pending' | 'in_progress' | 'completed'
  riskScore: number
  items: MockWorkItem[]
  relatedRisks: MockRisk[]
  incidents: string[]
  location?: MockWorkLocation
}

export interface MockRisk {
  id: string
  title: string
  severity: MockRiskSeverity
  status: MockRiskStatus
  workId: string
  workTitle: string
  summary: string
  actions: string[]
  locationCoordinates?: MockCoordinates
}

export interface MockMeeting {
  id: string
  title: string
  date: string
  participants: string[]
  transcript: string
  extractedRisks: MockRisk[]
}

export interface MockIncident {
  id: string
  title: string
  date: string
  rootCause: string
  correctiveActions: string[]
  status: 'open' | 'resolved'
}

export interface MockManual {
  id: string
  title: string
  category: string
  updatedAt: string
  summary: string
}

/**
 * ロケーション情報（工場内の場所）
 */
export const mockWorkLocations: MockWorkLocation[] = [
  {
    id: 'loc-line-a',
    name: '製造ラインA',
    mapType: 'image',
    mapFilePath: 'https://images.unsplash.com/photo-1581092163562-40de08070ea0?w=800&h=600&fit=crop',
    coordinates: { x: 300, y: 250, width: 150, height: 100 },
    description: '高温配管が複数通っており、火傷リスクが高い。',
  },
  {
    id: 'loc-receiving',
    name: '資材搬入口',
    mapType: 'image',
    mapFilePath: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=800&h=600&fit=crop',
    coordinates: { x: 150, y: 100, width: 120, height: 80 },
    description: 'フォークリフトとの動線交差が発生しやすい。',
  },
]

export const mockRisks: MockRisk[] = [
  {
    id: 'r1',
    title: '高温配管の火傷リスク',
    severity: 'high',
    status: 'open',
    workId: 'w1',
    workTitle: '製造ラインA 定期点検',
    summary: '保温材の劣化で露出箇所があり、接触事故の可能性。',
    actions: ['保温材の補修', '接近時は耐熱手袋を着用'],
    locationCoordinates: { x: 320, y: 270, width: 30, height: 30 },
  },
  {
    id: 'r2',
    title: 'フォークリフト動線衝突',
    severity: 'medium',
    status: 'in_review',
    workId: 'w2',
    workTitle: '資材搬入',
    summary: '作業導線と物流導線の交差が発生。',
    actions: ['誘導員配置', '停止線の再掲示'],
    locationCoordinates: { x: 200, y: 130, width: 25, height: 25 },
  },
  {
    id: 'r3',
    title: '電源遮断漏れ',
    severity: 'low',
    status: 'closed',
    workId: 'w1',
    workTitle: '製造ラインA 定期点検',
    summary: 'ロックアウト手順の確認漏れ。',
    actions: ['チェックリスト改訂'],
    locationCoordinates: { x: 280, y: 240, width: 20, height: 20 },
  },
]

export const mockWorks: MockWork[] = [
  {
    id: 'w1',
    title: '製造ラインA 定期点検',
    description: '月次の設備点検と安全確認を実施。',
    date: '2026-02-13',
    group: '設備点検',
    status: 'in_progress',
    riskScore: 78,
    incidents: ['2025-12 転倒事故'],
    location: mockWorkLocations[0], // 製造ラインA
    items: [
      {
        id: 'wi-1',
        title: '電気系統の点検',
        status: 'completed',
        steps: ['電源遮断', '配線確認', '絶縁測定'],
        hazards: ['感電', '火花'],
        tools: ['絶縁手袋', 'テスター'],
      },
      {
        id: 'wi-2',
        title: '機械部品の潤滑',
        status: 'in_progress',
        steps: ['停止確認', '潤滑油注入', '動作確認'],
        hazards: ['挟み込み'],
        tools: ['保護メガネ', 'グリスガン'],
      },
    ],
    relatedRisks: [mockRisks[0], mockRisks[2]],
  },
  {
    id: 'w2',
    title: '資材搬入',
    description: '新製品ライン立上げの資材搬入。',
    date: '2026-02-13',
    group: '物流',
    status: 'pending',
    riskScore: 54,
    incidents: [],
    location: mockWorkLocations[1], // 資材搬入口
    items: [
      {
        id: 'wi-3',
        title: '搬入導線確認',
        status: 'pending',
        steps: ['導線確認', '誘導員配置'],
        hazards: ['接触事故'],
        tools: ['誘導旗'],
      },
    ],
    relatedRisks: [mockRisks[1]],
  },
]

export const mockMeetings: MockMeeting[] = [
  {
    id: 'm1',
    title: '安全レビュー 2月週次',
    date: '2026-02-12',
    participants: ['田中', '佐藤', '鈴木'],
    transcript:
      '本週はラインAの保温材劣化が目立つ。補修の優先度を上げる。',
    extractedRisks: [mockRisks[0]],
  },
]

export const mockIncidents: MockIncident[] = [
  {
    id: 'i1',
    title: '作業通路での転倒',
    date: '2025-12-18',
    rootCause: '床面の油汚れと注意喚起不足。',
    correctiveActions: ['清掃頻度の増加', '注意標識の追加'],
    status: 'resolved',
  },
]

export const mockManuals: MockManual[] = [
  {
    id: 'k1',
    title: 'ロックアウト/タグアウト手順',
    category: '安全手順',
    updatedAt: '2026-01-20',
    summary: '電源遮断時の手順と確認項目。',
  },
  {
    id: 'k2',
    title: 'フォークリフト運転ルール',
    category: '物流',
    updatedAt: '2025-12-05',
    summary: '構内搬送の安全ルールと禁止事項。',
  },
]