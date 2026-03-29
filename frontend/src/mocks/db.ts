import { faker } from '@faker-js/faker'
import { factory, primaryKey } from '@mswjs/data'
import type { RiskLevel } from '@/types/api'

const seedDate = '2026-03-26T09:00:00.000Z'

export const mockDb = factory({
  user: {
    id: primaryKey(Number),
    name: String,
    role: String,
    is_active: Boolean,
    contact: String,
  },
  workGroup: {
    id: primaryKey(Number),
    name: String,
  },
  work: {
    id: primaryKey(Number),
    title: String,
    description: String,
    group_id: Number,
    work_date: String,
    status: String,
  },
  workItem: {
    id: primaryKey(Number),
    work_id: Number,
    name: String,
    description: String,
  },
  aiRisk: {
    id: primaryKey(Number),
    work_item_id: Number,
    title: String,
    content: String,
    severity: String,
    risk_level: String,
    action: String,
    generated_at: String,
  },
  manualRisk: {
    id: primaryKey(Number),
    work_item_id: Number,
    title: String,
    content: String,
    severity: String,
    risk_level: String,
    action: String,
    created_at: String,
  },
  workComment: {
    id: primaryKey(Number),
    work_id: Number,
    user_id: Number,
    content: String,
    created_at: String,
  },
  incident: {
    id: primaryKey(Number),
    title: String,
    type: String,
    date: String,
    root_cause: String,
    corrective_actions_json: String,
    status: String,
    work_id: Number,
    work_title: String,
    assignee_id: Number,
    assignee_name: String,
    labels_json: String,
    created_at: String,
    updated_at: String,
  },
  incidentComment: {
    id: primaryKey(Number),
    incident_id: Number,
    user_id: Number,
    user_name: String,
    content: String,
    created_at: String,
    updated_at: String,
  },
  incidentActivity: {
    id: primaryKey(Number),
    incident_id: Number,
    user_id: Number,
    user_name: String,
    action_type: String,
    content: String,
    old_value: String,
    new_value: String,
    created_at: String,
  },
  acknowledgment: {
    id: primaryKey(Number),
    work_id: Number,
    user_id: Number,
    acknowledged_at: String,
    signature_base64: String,
    acknowledged_risk_ids_json: String,
    acknowledged_risks_json: String,
  },
  notification: {
    id: primaryKey(Number),
    title: String,
    content: String,
    type: String,
    created_at: String,
    is_read: Boolean,
    link: String,
    display_until: String,
    pinned: Boolean,
  },
  manual: {
    id: primaryKey(Number),
    title: String,
    category: String,
    updated_at: String,
    summary: String,
  },
  meeting: {
    id: primaryKey(Number),
    title: String,
    date: String,
    participants_json: String,
    transcript: String,
    sync_state: String,
  },
  meetingUpload: {
    id: primaryKey(Number),
    meeting_id: Number,
    filename: String,
    created_at: String,
  },
})

let hasSeeded = false

const pickRole = (index: number) => {
  if (index === 0) {
    return 'leader'
  }

  if (index % 4 === 0) {
    return 'safety_manager'
  }

  return 'worker'
}

const createWorkDate = (offset: number) => {
  const date = new Date(seedDate)
  date.setDate(date.getDate() - offset)
  return date.toISOString().split('T')[0]
}

export const seedMockDb = () => {
  if (hasSeeded) {
    return
  }

  faker.seed(20260326)

  const users = Array.from({ length: 12 }, (_, index) =>
    mockDb.user.create({
      id: index + 1,
      name: faker.person.fullName(),
      role: pickRole(index),
      is_active: true,
      contact: faker.internet.email(),
    }),
  )

  const groups = [
    '設備点検',
    '安全巡視',
    '定期メンテナンス',
    '足場確認',
  ].map((name, index) =>
    mockDb.workGroup.create({
      id: index + 1,
      name,
    }),
  )

  Array.from({ length: 24 }, (_, index) => {
    const group = groups[index % groups.length]
    const work = mockDb.work.create({
      id: index + 1,
      title: `${group.name} ${faker.location.buildingNumber()}-${index + 1}`,
      description: faker.lorem.sentence(),
      group_id: group.id,
      work_date: createWorkDate(index % 12),
      status: index % 3 === 0 ? 'draft' : 'confirmed',
    })

    Array.from({ length: 2 + (index % 3) }, (_, itemIndex) =>
      mockDb.workItem.create({
        id: index * 10 + itemIndex + 1,
        work_id: work.id,
        name: faker.helpers.arrayElement([
          '配管確認',
          'バルブ点検',
          '清掃確認',
          '安全掲示確認',
        ]),
        description: faker.lorem.sentence(),
      }),
    )
  })

  mockDb.workItem.getAll().forEach((item, index) => {
    mockDb.aiRisk.create({
      id: index + 101,
      work_item_id: item.id,
      content: faker.helpers.arrayElement([
        '高温設備への接触',
        '足元障害物による転倒',
        '圧力変動時の飛散',
      ]),
      action: faker.helpers.arrayElement([
        '保護具を着用する',
        '立入範囲を確認する',
        '声掛けしてから着手する',
      ]),
      generated_at: faker.date.recent({ days: 7 }).toISOString(),
    })

    if (index % 2 === 0) {
      mockDb.manualRisk.create({
        id: index + 1,
        work_item_id: item.id,
        content: faker.helpers.arrayElement([
          '手元確認不足による接触',
          '足場固定の緩み',
          '周囲との干渉',
        ]),
        action: faker.helpers.arrayElement([
          '作業前に二重確認',
          '補助者を配置',
          '区域を明示する',
        ]),
        created_at: faker.date.recent({ days: 7 }).toISOString(),
      })
    }
  })

  mockDb.work.getAll().slice(0, 12).forEach((work, index) => {
    mockDb.workComment.create({
      id: index + 1,
      work_id: work.id,
      user_id: users[index % users.length].id,
      content: faker.lorem.sentence(),
      created_at: faker.date.recent({ days: 10 }).toISOString(),
    })
  })

  Array.from({ length: 18 }, (_, index) => {
    const work = mockDb.work.getAll()[index % mockDb.work.getAll().length]
    const assignee = users[index % users.length]
    const createdAt = faker.date.recent({ days: 30 }).toISOString()

    const incident = mockDb.incident.create({
      id: index + 1,
      title: faker.helpers.arrayElement([
        '転倒リスク',
        '高温接触',
        '挟まれヒヤリ',
        '通路障害物',
      ]),
      type: index % 4 === 0 ? 'near_miss' : 'incident',
      date: work.work_date,
      root_cause: faker.lorem.sentence(),
      corrective_actions_json: JSON.stringify([
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      ]),
      status: index % 3 === 0 ? 'resolved' : 'open',
      work_id: work.id,
      work_title: work.title,
      assignee_id: assignee.id,
      assignee_name: assignee.name,
      labels_json: JSON.stringify(
        faker.helpers.arrayElements(['安全', '設備', '教育', '緊急'], 2),
      ),
      created_at: createdAt,
      updated_at: createdAt,
    })

    mockDb.incidentActivity.create({
      id: index + 1,
      incident_id: incident.id,
      user_id: 1,
      user_name: users[0].name,
      action_type: 'created',
      content: 'インシデントを作成しました',
      old_value: '',
      new_value: '',
      created_at: createdAt,
    })

    if (index % 2 === 0) {
      mockDb.incidentComment.create({
        id: index + 1,
        incident_id: incident.id,
        user_id: users[(index + 1) % users.length].id,
        user_name: users[(index + 1) % users.length].name,
        content: faker.lorem.sentence(),
        created_at: faker.date.recent({ days: 7 }).toISOString(),
        updated_at: '',
      })
    }
  })

  Array.from({ length: 10 }, (_, index) => {
    mockDb.notification.create({
      id: index + 1,
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraph(),
      type: faker.helpers.arrayElement(['info', 'warning', 'urgent', 'success']),
      created_at: faker.date.recent({ days: 14 }).toISOString(),
      is_read: index % 3 === 0,
      link: index % 2 === 0 ? '/incidents' : '',
      display_until: index % 4 === 0 ? '' : faker.date.soon({ days: 7 }).toISOString(),
      pinned: index % 5 === 0,
    })
  })

  Array.from({ length: 8 }, (_, index) => {
    mockDb.manual.create({
      id: index + 1,
      title: `${faker.helpers.arrayElement(['配管', '設備', '電気', '巡視'])}マニュアル ${index + 1}`,
      category: faker.helpers.arrayElement(['配管', '電気', '設備', '安全']),
      updated_at: faker.date.recent({ days: 30 }).toISOString(),
      summary: faker.lorem.sentences(2),
    })
  })

  Array.from({ length: 6 }, (_, index) => {
    mockDb.meeting.create({
      id: index + 1,
      title: `${faker.helpers.arrayElement(['安全会議', '引継会', 'KYミーティング'])} ${index + 1}`,
      date: createWorkDate(index),
      participants_json: JSON.stringify(
        faker.helpers.arrayElements(users.map((user) => user.name), 3),
      ),
      transcript: faker.lorem.paragraphs(2),
      sync_state: faker.helpers.arrayElement(['idle', 'completed', 'processing']),
    })
  })

  Array.from({ length: 10 }, (_, index) => {
    mockDb.meetingUpload.create({
      id: index + 1,
      meeting_id: index % 3 === 0 ? 0 : (index % 6) + 1,
      filename: `${faker.system.fileName()}.mp3`,
      created_at: faker.date.recent({ days: 10 }).toISOString(),
    })
  })

  hasSeeded = true
}

const parseJsonArray = (value: string) => {
  try {
    return JSON.parse(value) as string[]
  } catch {
    return []
  }
}

const parseNumberArray = (value: string) => {
  try {
    return JSON.parse(value) as number[]
  } catch {
    return []
  }
}

const mapIncident = (incident: ReturnType<typeof mockDb.incident.getAll>[number]) => ({
  ...incident,
  type: incident.type as 'incident' | 'near_miss',
  status: incident.status as 'open' | 'resolved',
  corrective_actions: parseJsonArray(incident.corrective_actions_json),
  labels: parseJsonArray(incident.labels_json),
  work_id: incident.work_id || null,
  work_title: incident.work_title || null,
  assignee_id: incident.assignee_id || null,
  assignee_name: incident.assignee_name || null,
})

export const mockDbReaders = {
  listUsers: () => mockDb.user.getAll(),
  getCurrentUser: () => mockDb.user.findFirst({ where: { id: { equals: 1 } } }),
  listWorkGroups: () => mockDb.workGroup.getAll(),
  listWorks: () => mockDb.work.getAll(),
  listWorkItems: (workId?: number) =>
    mockDb.workItem.getAll().filter((item) => (workId ? item.work_id === workId : true)),
  listAiRisks: (workItemId?: number) =>
    mockDb.aiRisk.getAll().filter((risk) => (workItemId ? risk.work_item_id === workItemId : true)).map((risk) => ({
      ...risk,
      title: risk.title || null,
      severity: (risk.severity || null) as RiskLevel | null,
      risk_level: (risk.risk_level || null) as RiskLevel | null,
      action: risk.action || null,
    })),
  listManualRisks: (workItemId?: number) =>
    mockDb.manualRisk.getAll().filter((risk) => (workItemId ? risk.work_item_id === workItemId : true)).map((risk) => ({
      ...risk,
      title: risk.title || null,
      severity: (risk.severity || null) as RiskLevel | null,
      risk_level: (risk.risk_level || null) as RiskLevel | null,
      action: risk.action || null,
    })),
  listWorkComments: (workId?: number) =>
    mockDb.workComment.getAll().filter((comment) => (workId ? comment.work_id === workId : true)),
  listWorkOverviews: (workDate?: string) =>
    mockDb.work.getAll()
      .filter((work) => (workDate ? work.work_date === workDate : true))
      .map((work) => ({
        work,
        items: mockDb.workItem.getAll().filter((item) => item.work_id === work.id).map((item) => ({
          item,
          risks: mockDb.aiRisk.getAll().filter((risk) => risk.work_item_id === item.id).map((risk) => ({
            ...risk,
            title: risk.title || null,
            severity: (risk.severity || null) as RiskLevel | null,
            risk_level: (risk.risk_level || null) as RiskLevel | null,
            action: risk.action || null,
          })),
        })),
      })),
  getWorkOverview: (workId: number) =>
    mockDbReaders.listWorkOverviews().find((entry) => entry.work.id === workId) ?? null,
  getRiskSummary: (workId: number) => {
    const workItemIds = mockDb.workItem.getAll().filter((item) => item.work_id === workId).map((item) => item.id)
    const totalCount = mockDb.aiRisk.getAll().filter((risk) => workItemIds.includes(risk.work_item_id)).length
      + mockDb.manualRisk.getAll().filter((risk) => workItemIds.includes(risk.work_item_id)).length
    const level: 'low' | 'medium' | 'high' = totalCount >= 5 ? 'high' : totalCount >= 3 ? 'medium' : 'low'
    return {
      work_id: workId,
      level,
      score: Math.min(100, totalCount * 18),
      reasons: totalCount > 0 ? ['AI/手入力リスクが登録されています'] : [],
      updated_at: new Date().toISOString(),
    }
  },
  listIncidents: () => mockDb.incident.getAll().map(mapIncident),
  getIncident: (incidentId: number) => {
    const incident = mockDb.incident.getAll().find((entry) => entry.id === incidentId)
    return incident ? mapIncident(incident) : null
  },
  listIncidentComments: (incidentId: number) =>
    mockDb.incidentComment.getAll().filter((comment) => comment.incident_id === incidentId).map((comment) => ({
      ...comment,
      updated_at: comment.updated_at || undefined,
    })),
  listIncidentActivities: (incidentId: number) =>
    mockDb.incidentActivity.getAll().filter((activity) => activity.incident_id === incidentId).map((activity) => ({
      ...activity,
      action_type: activity.action_type as
        | 'created'
        | 'comment'
        | 'status_change'
        | 'corrective_action'
        | 'assignment'
        | 'label_added'
        | 'label_removed',
      content: activity.content || undefined,
      old_value: activity.old_value || undefined,
      new_value: activity.new_value || undefined,
    })),
  listAcknowledgments: (workId?: number) =>
    mockDb.acknowledgment.getAll().filter((entry) => (workId ? entry.work_id === workId : true)).map((entry) => ({
      ...entry,
      signature_base64: entry.signature_base64 || null,
      acknowledged_risk_ids: parseNumberArray(entry.acknowledged_risk_ids_json),
      acknowledged_risks: JSON.parse(entry.acknowledged_risks_json || '[]') as Array<{
        id: number
        source: 'ai' | 'manual'
        content: string
        action?: string | null
        item_name?: string | null
      }>,
    })),
  listNotifications: () =>
    mockDb.notification.getAll().map((notification) => ({
      ...notification,
      link: notification.link || undefined,
      display_until: notification.display_until || null,
    })),
  listManuals: () => mockDb.manual.getAll(),
  listMeetings: () =>
    mockDb.meeting.getAll().map((meeting) => ({
      ...meeting,
      participants: parseJsonArray(meeting.participants_json),
      extracted_risks: [],
    })),
  listMeetingUploads: () =>
    mockDb.meetingUpload.getAll().map((upload) => ({
      ...upload,
      meeting_id: upload.meeting_id || null,
    })),
}

export const mockConfigCatalog = {
  incidentStatuses: ['open', 'resolved'],
  incidentTypes: ['incident', 'near_miss'],
  incidentLabels: ['安全', '設備', '教育', '緊急'],
  riskSeverities: ['low', 'medium', 'high'],
  riskStatuses: ['open', 'in_review', 'closed'],
  workStatuses: ['draft', 'confirmed'],
  notificationTypes: ['info', 'warning', 'urgent', 'success'],
} as const