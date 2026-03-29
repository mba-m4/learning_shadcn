import { setupWorker } from "msw/browser"
import { resetAppDb } from "@/mocks/appDb"
import { handlers } from "@/mocks/handlers"

resetAppDb()

export const worker = setupWorker(...handlers)
