import { fakerJA as faker } from "@faker-js/faker"
import { drop, factory, oneOf, primaryKey } from "@mswjs/data"
import {
  documentCategoryValues,
  documentSchema,
  documentStatusValues,
} from "@/schema/documents"
import {
  projectSchema,
  projectStatusValues,
  projectSummarySchema,
} from "@/schema/projects"
import type {
  Document,
  DocumentCategory,
  DocumentInput,
  DocumentSortOrder,
  DocumentStatus,
} from "@/types/documents"
import type { Project, ProjectStatus } from "@/types/projects"

const DOCUMENTS_SEED = 20260325
const SEEDED_PROJECT_COUNT = 5
const SEEDED_DOCUMENT_COUNT = 18
const SEED_START_AT = new Date("2025-11-01T00:00:00.000Z")
const SEED_END_AT = new Date("2026-03-25T12:00:00.000Z")

const appDb = factory({
  project: {
    id: primaryKey(() => faker.string.uuid()),
    name: String,
    code: String,
    status: String,
    summary: String,
    ownerName: String,
    ownerEmail: String,
    teamName: String,
    repositoryUrl: String,
    tags: Array<string>,
    createdAt: () => new Date(),
    updatedAt: () => new Date(),
  },
  document: {
    id: primaryKey(() => faker.string.uuid()),
    title: String,
    description: String,
    category: String,
    status: String,
    ownerName: String,
    ownerRole: String,
    ownerEmail: String,
    teamName: String,
    tags: Array<string>,
    project: oneOf("project"),
    createdAt: () => new Date(),
    updatedAt: () => new Date(),
  },
})

const buildTags = () =>
  Array.from(
    new Set(
      faker.helpers.multiple(
        () =>
          faker.helpers.arrayElement([
            faker.hacker.noun(),
            faker.hacker.verb(),
            faker.word.noun(),
            faker.word.adjective(),
          ]),
        { count: faker.number.int({ min: 2, max: 4 }) }
      )
    )
  )

const buildDates = () => {
  const createdAt = faker.date.between({
    from: SEED_START_AT,
    to: SEED_END_AT,
  })
  const updatedAt = faker.date.between({
    from: createdAt,
    to: SEED_END_AT,
  })

  return { createdAt, updatedAt }
}

const buildProjectStatus = (): ProjectStatus =>
  faker.helpers.arrayElement([...projectStatusValues])

const buildDocumentCategory = (): DocumentCategory =>
  faker.helpers.arrayElement([...documentCategoryValues])

const buildDocumentStatus = (): DocumentStatus =>
  faker.helpers.arrayElement([...documentStatusValues])

const buildProjectCode = () =>
  `${faker.string.alpha({ casing: "upper", length: 3 })}-${faker.number.int({ min: 100, max: 999 })}`

const buildProjectSeed = () => {
  const { createdAt, updatedAt } = buildDates()

  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    code: buildProjectCode(),
    status: buildProjectStatus(),
    summary: `${faker.company.catchPhrase()}\n\n${faker.lorem.paragraph()}`,
    ownerName: faker.person.fullName(),
    ownerEmail: faker.internet.email(),
    teamName: `${faker.person.jobArea()} Team`,
    repositoryUrl: faker.internet.url({ appendSlash: false }),
    tags: buildTags(),
    createdAt,
    updatedAt,
  }
}

const buildDocumentTitle = () =>
  faker.helpers
    .arrayElement([
      () => faker.company.buzzPhrase(),
      () => faker.company.catchPhrase(),
      () => faker.hacker.phrase(),
      () => `${faker.person.jobArea()} ${faker.word.noun()} playbook`,
    ])()

const buildDocumentDescription = () => {
  const lead = faker.company.catchPhrase()
  const summary = faker.lorem.sentences(faker.number.int({ min: 2, max: 3 }))
  const detail = faker.lorem.paragraphs(
    faker.number.int({ min: 1, max: 2 }),
    "\n\n"
  )

  return `${lead}\n\n${summary}\n\n${detail}`
}

const buildDocumentOwnerProfile = () => ({
  ownerName: faker.person.fullName(),
  ownerRole: faker.person.jobTitle(),
  ownerEmail: faker.internet.email(),
  teamName: faker.company.name(),
})

const toProjectSummary = (value: {
  id: string
  name: string
  code: string
  status: string
}) => projectSummarySchema.parse(value)

const requireProjectRelation = (
  project:
    | {
        id: string
        name: string
        code: string
        status: string
      }
    | undefined
) => {
  if (!project) {
    throw new Error("Document project relation is missing")
  }

  return project
}

const toProject = (value: {
  id: string
  name: string
  code: string
  status: string
  summary: string
  ownerName: string
  ownerEmail: string
  teamName: string
  repositoryUrl: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}): Project =>
  projectSchema.parse({
    ...value,
    documentCount: listDocuments({ projectId: value.id, keyword: null }).length,
  })

const toDocument = (value: {
  id: string
  title: string
  description: string
  category: string
  status: string
  ownerName: string
  ownerRole: string
  ownerEmail: string
  teamName: string
  tags: string[]
  project:
    | {
        id: string
        name: string
        code: string
        status: string
      }
    | undefined
  createdAt: Date
  updatedAt: Date
}): Document =>
  documentSchema.parse({
    ...value,
    project: toProjectSummary(requireProjectRelation(value.project)),
  })

const sortDocuments = (
  documents: Document[],
  sort: DocumentSortOrder = "newest"
) => {
  const nextDocuments = [...documents]

  if (sort === "title") {
    return nextDocuments.sort((left, right) =>
      left.title.localeCompare(right.title, "ja")
    )
  }

  return nextDocuments.sort((left, right) => {
    const delta = left.createdAt.getTime() - right.createdAt.getTime()
    return sort === "oldest" ? delta : -delta
  })
}

const normalizeKeyword = (keyword: string | null) => keyword?.trim().toLowerCase() ?? ""

const findProjectEntityById = (id: string) =>
  appDb.project.findFirst({
    where: {
      id: {
        equals: id,
      },
    },
  })

const createSeedProjects = () =>
  Array.from({ length: SEEDED_PROJECT_COUNT }, () =>
    appDb.project.create(buildProjectSeed())
  )

const createSeedDocuments = (projects: ReturnType<typeof createSeedProjects>) =>
  Array.from({ length: SEEDED_DOCUMENT_COUNT }, () => {
    const { createdAt, updatedAt } = buildDates()

    return appDb.document.create({
      id: faker.string.uuid(),
      title: buildDocumentTitle(),
      description: buildDocumentDescription(),
      category: buildDocumentCategory(),
      status: buildDocumentStatus(),
      tags: buildTags(),
      ...buildDocumentOwnerProfile(),
      project: faker.helpers.arrayElement(projects),
      createdAt,
      updatedAt,
    })
  })

export const resetAppDb = () => {
  drop(appDb)
  faker.seed(DOCUMENTS_SEED)

  const projects = createSeedProjects()
  createSeedDocuments(projects)
}

export const listProjects = () => appDb.project.getAll().map(toProject)

export const findProjectById = (id: string) => {
  const project = findProjectEntityById(id)

  return project ? toProject(project) : null
}

export const listDocuments = ({
  keyword,
  projectId,
  sort,
}: {
  keyword: string | null
  projectId?: string
  sort?: DocumentSortOrder
}) => {
  const normalizedKeyword = normalizeKeyword(keyword)
  const documents = appDb.document.getAll().map(toDocument)
  const filteredByProject = projectId
    ? documents.filter((document) => document.project.id === projectId)
    : documents
  const filteredDocuments = normalizedKeyword
    ? filteredByProject.filter((document) => {
        const title = document.title.toLowerCase()
        const description = document.description.toLowerCase()
        const ownerName = document.ownerName.toLowerCase()
        const ownerRole = document.ownerRole.toLowerCase()
        const ownerEmail = document.ownerEmail.toLowerCase()
        const teamName = document.teamName.toLowerCase()
        const category = document.category.toLowerCase()
        const status = document.status.toLowerCase()
        const projectName = document.project.name.toLowerCase()
        const projectCode = document.project.code.toLowerCase()
        const tags = document.tags.join(" ").toLowerCase()

        return (
          title.includes(normalizedKeyword) ||
          description.includes(normalizedKeyword) ||
          ownerName.includes(normalizedKeyword) ||
          ownerRole.includes(normalizedKeyword) ||
          ownerEmail.includes(normalizedKeyword) ||
          teamName.includes(normalizedKeyword) ||
          category.includes(normalizedKeyword) ||
          status.includes(normalizedKeyword) ||
          projectName.includes(normalizedKeyword) ||
          projectCode.includes(normalizedKeyword) ||
          tags.includes(normalizedKeyword)
        )
      })
    : filteredByProject

  return sortDocuments(filteredDocuments, sort)
}

export const findDocumentById = (id: string) => {
  const document = appDb.document.findFirst({
    where: {
      id: {
        equals: id,
      },
    },
  })

  return document ? toDocument(document) : null
}

export const createDocumentRecord = (payload: DocumentInput) => {
  const project = findProjectEntityById(payload.projectId)

  if (!project) {
    return null
  }

  const createdAt = new Date()

  return toDocument(
    appDb.document.create({
      title: payload.title,
      description: payload.description,
      category: payload.category,
      status: payload.status,
      project,
      ...buildDocumentOwnerProfile(),
      tags: buildTags(),
      createdAt,
      updatedAt: createdAt,
    })
  )
}

export const updateDocumentRecord = (id: string, payload: DocumentInput) => {
  const project = findProjectEntityById(payload.projectId)

  if (!project) {
    return null
  }

  const document = appDb.document.update({
    where: {
      id: {
        equals: id,
      },
    },
    data: {
      title: payload.title,
      description: payload.description,
      category: payload.category,
      status: payload.status,
      project,
      updatedAt: new Date(),
    },
  })

  return document ? toDocument(document) : null
}

export const deleteDocumentRecord = (id: string) => {
  const document = appDb.document.delete({
    where: {
      id: {
        equals: id,
      },
    },
  })

  return document ? toDocument(document) : null
}