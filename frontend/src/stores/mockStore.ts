import { create } from 'zustand'
import {
  mockIncidents,
  mockManuals,
  mockMeetings,
  mockRisks,
  mockWorks,
  type MockIncident,
  type MockManual,
  type MockMeeting,
  type MockRisk,
  type MockRiskSeverity,
  type MockRiskStatus,
  type MockWork,
} from '@/mocks/mockData'

type WorkAsset = {
  photos: string[]
  audios: string[]
  notes: string[]
}

interface MockStore {
  works: MockWork[]
  risks: MockRisk[]
  meetings: MockMeeting[]
  incidents: MockIncident[]
  manuals: MockManual[]
  workAssets: Record<string, WorkAsset>
  meetingUploads: Record<string, string[]>
  meetingSyncState: Record<string, string>
  updateRiskStatus: (riskId: string, status: MockRiskStatus) => void
  updateRiskSeverity: (riskId: string, severity: MockRiskSeverity) => void
  addRiskAction: (riskId: string, action: string) => void
  updateIncidentStatus: (incidentId: string, status: 'open' | 'resolved') => void
  addIncidentAction: (incidentId: string, action: string) => void
  addMeetingUpload: (meetingId: string, files: string[]) => void
  setMeetingSyncState: (meetingId: string, state: string) => void
  addWorkPhoto: (workId: string, files: string[]) => void
  addWorkAudio: (workId: string, files: string[]) => void
  addWorkNote: (workId: string, note: string) => void
}

const ensureAsset = (assets: Record<string, WorkAsset>, workId: string) => {
  if (assets[workId]) {
    return assets[workId]
  }
  const next = { photos: [], audios: [], notes: [] }
  assets[workId] = next
  return next
}

export const useMockStore = create<MockStore>((set, get) => ({
  works: mockWorks,
  risks: mockRisks,
  meetings: mockMeetings,
  incidents: mockIncidents,
  manuals: mockManuals,
  workAssets: {},
  meetingUploads: {},
  meetingSyncState: {},
  updateRiskStatus: (riskId, status) => {
    set((state) => ({
      risks: state.risks.map((risk) =>
        risk.id === riskId ? { ...risk, status } : risk,
      ),
    }))
  },
  updateRiskSeverity: (riskId, severity) => {
    set((state) => ({
      risks: state.risks.map((risk) =>
        risk.id === riskId ? { ...risk, severity } : risk,
      ),
    }))
  },
  addRiskAction: (riskId, action) => {
    set((state) => ({
      risks: state.risks.map((risk) =>
        risk.id === riskId
          ? { ...risk, actions: [...risk.actions, action] }
          : risk,
      ),
    }))
  },
  updateIncidentStatus: (incidentId, status) => {
    set((state) => ({
      incidents: state.incidents.map((incident) =>
        incident.id === incidentId ? { ...incident, status } : incident,
      ),
    }))
  },
  addIncidentAction: (incidentId, action) => {
    set((state) => ({
      incidents: state.incidents.map((incident) =>
        incident.id === incidentId
          ? {
              ...incident,
              correctiveActions: [...incident.correctiveActions, action],
            }
          : incident,
      ),
    }))
  },
  addMeetingUpload: (meetingId, files) => {
    set((state) => ({
      meetingUploads: {
        ...state.meetingUploads,
        [meetingId]: [...(state.meetingUploads[meetingId] ?? []), ...files],
      },
    }))
  },
  setMeetingSyncState: (meetingId, state) => {
    set((current) => ({
      meetingSyncState: {
        ...current.meetingSyncState,
        [meetingId]: state,
      },
    }))
  },
  addWorkPhoto: (workId, files) => {
    const assets = { ...get().workAssets }
    const target = ensureAsset(assets, workId)
    target.photos = [...target.photos, ...files]
    set({ workAssets: assets })
  },
  addWorkAudio: (workId, files) => {
    const assets = { ...get().workAssets }
    const target = ensureAsset(assets, workId)
    target.audios = [...target.audios, ...files]
    set({ workAssets: assets })
  },
  addWorkNote: (workId, note) => {
    const assets = { ...get().workAssets }
    const target = ensureAsset(assets, workId)
    target.notes = [...target.notes, note]
    set({ workAssets: assets })
  },
}))
