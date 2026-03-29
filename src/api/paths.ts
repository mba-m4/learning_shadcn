export const API_PREFIX = "/api"

const DOCUMENTS_PATH = "/documents"
const PROJECTS_PATH = "/projects"

export const documentApiPaths = {
  list: DOCUMENTS_PATH,
  detail: (id: string) => `${DOCUMENTS_PATH}/${id}`,
}

export const documentMockPaths = {
  list: `${API_PREFIX}${DOCUMENTS_PATH}`,
  detail: `${API_PREFIX}${DOCUMENTS_PATH}/:id`,
}

export const projectApiPaths = {
  list: PROJECTS_PATH,
  detail: (id: string) => `${PROJECTS_PATH}/${id}`,
}

export const projectMockPaths = {
  list: `${API_PREFIX}${PROJECTS_PATH}`,
  detail: `${API_PREFIX}${PROJECTS_PATH}/:id`,
}
