import { faker } from '@faker-js/faker'
import { factory, primary } from '@mswjs/data'

const seedDate = '2026-03-26T09:00:00.000Z'

export const mockDb = factory({
  user: {
    id: primary(Number),
    name: String,
    role: String,
    is_active: Boolean,
    contact: String,
  },
  workGroup: {
    id: primary(Number),
    name: String,
  },
  work: {
    id: primary(Number),
    title: String,
    description: String,
    group_id: Number,
    work_date: String,
    status: String,
  },
  workItem: {
    id: primary(Number),
    work_id: Number,
    name: String,
    description: String,
  },
  incident: {
    id: primary(Number),
    title: String,
    type: String,
    date: String,
    root_cause: String,
    corrective_actions: Array,
    status: String,
    work_id: Number,
    work_title: String,
    assignee_id: Number,
    assignee_name: String,
    labels: Array,
    created_at: String,
    updated_at: String,
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

  Array.from({ length: 18 }, (_, index) => {
    const work = mockDb.work.getAll()[index % mockDb.work.getAll().length]
    const assignee = users[index % users.length]
    const createdAt = faker.date.recent({ days: 30 }).toISOString()

    mockDb.incident.create({
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
      corrective_actions: [faker.lorem.sentence(), faker.lorem.sentence()],
      status: index % 3 === 0 ? 'resolved' : 'open',
      work_id: work.id,
      work_title: work.title,
      assignee_id: assignee.id,
      assignee_name: assignee.name,
      labels: faker.helpers.arrayElements(['安全', '設備', '教育', '緊急'], 2),
      created_at: createdAt,
      updated_at: createdAt,
    })
  })

  hasSeeded = true
}

export const mockConfigCatalog = {
  incidentStatuses: ['open', 'resolved'],
  incidentTypes: ['incident', 'near_miss'],
  riskSeverities: ['low', 'medium', 'high'],
  riskStatuses: ['open', 'in_review', 'closed'],
  workStatuses: ['draft', 'confirmed'],
  notificationTypes: ['info', 'warning', 'urgent'],
} as const