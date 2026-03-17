import axios from "axios"
import { API_PREFIX } from "@/api/paths"

export const api = axios.create({
  baseURL: API_PREFIX,
})
