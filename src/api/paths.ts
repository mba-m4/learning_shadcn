export const API_PREFIX = "/api"

const DOCUMENTS_PATH = "/documents"

export const documentApiPaths = {
  list: DOCUMENTS_PATH,
  detail: (id: string) => `${DOCUMENTS_PATH}/${id}`,
}

export const documentMockPaths = {
  list: `${API_PREFIX}${DOCUMENTS_PATH}`,
  detail: `${API_PREFIX}${DOCUMENTS_PATH}/:id`,
}
