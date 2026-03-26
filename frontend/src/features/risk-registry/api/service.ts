import type { RiskRecord } from '@/types/api'
import { request } from '@/shared/api/client'
import {
	riskRecordSchema,
	riskRecordsSchema,
} from '@/shared/api/schemas/support'

export const fetchRisks = () =>
	request<RiskRecord[]>('/risks', undefined, true, riskRecordsSchema)

export const fetchRisk = (riskId: number) =>
	request<RiskRecord>(`/risks/${riskId}`, undefined, true, riskRecordSchema)

export const updateRiskStatus = (riskId: number, status: RiskRecord['status']) =>
	request<RiskRecord>(
		`/risks/${riskId}/status`,
		{
			method: 'PATCH',
			body: { status },
		},
		true,
		riskRecordSchema,
	)

export const updateRiskSeverity = (
	riskId: number,
	severity: RiskRecord['severity'],
) =>
	request<RiskRecord>(
		`/risks/${riskId}/severity`,
		{
			method: 'PATCH',
			body: { severity },
		},
		true,
		riskRecordSchema,
	)

export const addRiskAction = (riskId: number, action: string) =>
	request<RiskRecord>(
		`/risks/${riskId}/actions`,
		{
			method: 'POST',
			body: { action },
		},
		true,
		riskRecordSchema,
	)