import {
	keepPreviousData,
	mutationOptions,
	queryOptions,
	type UseQueryOptions,
} from '@tanstack/react-query'
import type {
	Comment,
	RiskLevel,
	ManualRisk,
	RiskSummary,
	WorkDateSummary,
	WorkDetailPageData,
	WorkGroup,
	WorkListResponse,
	WorkOverview,
	WorkSceneAsset,
	WorkRiskAcknowledgment,
} from '@/types/api'
import { queryClient } from '@/shared/api/queryClient'
import { queryKeys } from '@/shared/api/queryKeys'
import {
	addComment,
	createGroup,
	createManualRisk,
	createWork,
	deleteManualRisk,
	deleteRiskAssessment,
	fetchAcknowledgment,
	fetchAcknowledgmentHistory,
	fetchComments,
	fetchDailyOverview,
	fetchWorkDetailPage,
	fetchGroups,
	fetchManualRisks,
	fetchRiskSummary,
	fetchWorkDateSummary,
	fetchWorkDetail,
	fetchWorkList,
	fetchWorkScene,
	generateRisk,
	submitAcknowledgment,
	type SubmitAcknowledgmentPayload,
	updateManualRisk,
	updateRiskAssessment,
} from './service'

export type WorkGroupsQueryOptions<TData = WorkGroup[], TError = Error> = Omit<
	UseQueryOptions<WorkGroup[], TError, TData>,
	'queryKey' | 'queryFn'
>

export const createWorkGroupsQueryOptions = <
	TData = WorkGroup[],
	TError = Error,
>(queryConfig?: WorkGroupsQueryOptions<TData, TError>) =>
	queryOptions({
		...queryConfig,
		queryKey: queryKeys.works.groups(),
		queryFn: fetchGroups,
	})

export const createWorkGroupMutationOptions = () =>
	mutationOptions({
		mutationFn: ({ name }: { name: string }) => createGroup(name),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.groups() })
		},
	})

export const createWorkMutationOptions = () =>
	mutationOptions({
		mutationFn: ({
			title,
			description,
			group_id,
			work_date,
			status,
			items,
		}: {
			title: string
			description: string
			group_id: number
			work_date: string
			status: 'draft' | 'confirmed'
			items: Array<{
				name: string
				description: string
				risks?: Array<{
					title?: string
					content?: string
					severity?: RiskLevel
					risk_level?: RiskLevel
					action?: string
				}>
			}>
		}) =>
			createWork({
				title,
				description,
				group_id,
				work_date,
				status,
				items,
			}),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.all() })
		},
	})

export type WorkListParams = Parameters<typeof fetchWorkList>[0]

export type WorkListQueryOptions<TData = WorkListResponse, TError = Error> = Omit<
	UseQueryOptions<WorkListResponse, TError, TData>,
	'queryKey' | 'queryFn'
>

export const createWorkListQueryOptions = <
	TData = WorkListResponse,
	TError = Error,
>(
	params: WorkListParams,
	queryConfig?: WorkListQueryOptions<TData, TError>,
) =>
	queryOptions({
		placeholderData: keepPreviousData,
		...queryConfig,
		queryKey: queryKeys.works.list(params),
		queryFn: () => fetchWorkList(params),
	})

export type WorkDateSummaryParams = Parameters<typeof fetchWorkDateSummary>[0]

export type WorkDateSummaryQueryOptions<
	TData = WorkDateSummary[],
	TError = Error,
> = Omit<UseQueryOptions<WorkDateSummary[], TError, TData>, 'queryKey' | 'queryFn'>

export const createWorkDateSummaryQueryOptions = <
	TData = WorkDateSummary[],
	TError = Error,
>(
	params: WorkDateSummaryParams,
	queryConfig?: WorkDateSummaryQueryOptions<TData, TError>,
) =>
	queryOptions({
		placeholderData: keepPreviousData,
		...queryConfig,
		queryKey: queryKeys.works.dates(params),
		queryFn: () => fetchWorkDateSummary(params),
	})

export type WorkDailyOverviewQueryOptions<TData = WorkOverview[], TError = Error> = Omit<
	UseQueryOptions<WorkOverview[], TError, TData>,
	'queryKey' | 'queryFn'
>

export const createWorkDailyOverviewQueryOptions = <
	TData = WorkOverview[],
	TError = Error,
>(
	workDate: string,
	queryConfig?: WorkDailyOverviewQueryOptions<TData, TError>,
) =>
	queryOptions({
		...queryConfig,
		queryKey: queryKeys.works.daily(workDate),
		queryFn: () => fetchDailyOverview(workDate),
	})

export type WorkDetailQueryOptions<TData = WorkOverview, TError = Error> = Omit<
	UseQueryOptions<WorkOverview, TError, TData>,
	'queryKey' | 'queryFn'
>

export const createWorkDetailQueryOptions = <
	TData = WorkOverview,
	TError = Error,
>(workId: number, queryConfig?: WorkDetailQueryOptions<TData, TError>) =>
	queryOptions({
		...queryConfig,
		queryKey: queryKeys.works.detail(workId),
		queryFn: () => fetchWorkDetail(workId),
	})

export type WorkDetailPageQueryOptions<TData = WorkDetailPageData, TError = Error> = Omit<
	UseQueryOptions<WorkDetailPageData, TError, TData>,
	'queryKey' | 'queryFn'
>

export const createWorkDetailPageQueryOptions = <TData = WorkDetailPageData, TError = Error>(
	workId: number,
	queryConfig?: WorkDetailPageQueryOptions<TData, TError>,
) =>
	queryOptions({
		...queryConfig,
		queryKey: queryKeys.works.detailPage(workId),
		queryFn: () => fetchWorkDetailPage(workId),
	})

export type WorkSceneQueryOptions<TData = WorkSceneAsset, TError = Error> = Omit<
	UseQueryOptions<WorkSceneAsset, TError, TData>,
	'queryKey' | 'queryFn'
>

export const createWorkSceneQueryOptions = <TData = WorkSceneAsset, TError = Error>(
	workId: number,
	queryConfig?: WorkSceneQueryOptions<TData, TError>,
) =>
	queryOptions({
		...queryConfig,
		queryKey: queryKeys.works.scene(workId),
		queryFn: () => fetchWorkScene(workId),
	})

export type WorkCommentsQueryOptions<TData = Comment[], TError = Error> = Omit<
	UseQueryOptions<Comment[], TError, TData>,
	'queryKey' | 'queryFn'
>

export const createWorkCommentsQueryOptions = <TData = Comment[], TError = Error>(
	workId: number,
	queryConfig?: WorkCommentsQueryOptions<TData, TError>,
) =>
	queryOptions({
		...queryConfig,
		queryKey: queryKeys.works.comments(workId),
		queryFn: () => fetchComments(workId),
	})

export const createAddWorkCommentMutationOptions = (workId: number) =>
	mutationOptions({
		mutationFn: ({ content }: { content: string }) => addComment(workId, content),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.comments(workId) })
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.detailPage(workId) })
		},
	})

export type ManualRisksQueryOptions<TData = ManualRisk[], TError = Error> = Omit<
	UseQueryOptions<ManualRisk[], TError, TData>,
	'queryKey' | 'queryFn'
>

export const createManualRisksQueryOptions = <TData = ManualRisk[], TError = Error>(
	itemId: number,
	queryConfig?: ManualRisksQueryOptions<TData, TError>,
) =>
	queryOptions({
		...queryConfig,
		queryKey: queryKeys.works.manualRisks(itemId),
		queryFn: () => fetchManualRisks(itemId),
	})

export type RiskSummaryQueryOptions<TData = RiskSummary, TError = Error> = Omit<
	UseQueryOptions<RiskSummary, TError, TData>,
	'queryKey' | 'queryFn'
>

export const createRiskSummaryQueryOptions = <TData = RiskSummary, TError = Error>(
	workId: number,
	queryConfig?: RiskSummaryQueryOptions<TData, TError>,
) =>
	queryOptions({
		...queryConfig,
		queryKey: queryKeys.works.riskSummary(workId),
		queryFn: () => fetchRiskSummary(workId),
	})

export const createManualRiskMutationOptions = (itemId: number, workId?: number) =>
	mutationOptions({
		mutationFn: ({ content, action }: { content: string; action?: string | null }) =>
			createManualRisk(itemId, content, action),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.manualRisks(itemId) })
			if (workId) {
				await queryClient.invalidateQueries({ queryKey: queryKeys.works.riskSummary(workId) })
			}
		},
	})

export const createManualRiskForItemMutationOptions = (workId: number) =>
	mutationOptions({
		mutationFn: ({
			itemId,
			content,
			action,
		}: {
			itemId: number
			content: string
			action?: string | null
		}) => createManualRisk(itemId, content, action),
		onSuccess: async (_data, variables) => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.manualRisks(variables.itemId) })
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.acknowledgment(workId) })
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.scene(workId) })
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.detailPage(workId) })
		},
	})

export const createUpdateManualRiskMutationOptions = (itemId: number, workId?: number) =>
	mutationOptions({
		mutationFn: ({ riskId, payload }: { riskId: number; payload: { content?: string | null; action?: string | null } }) =>
			updateManualRisk(riskId, payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.manualRisks(itemId) })
			if (workId) {
				await queryClient.invalidateQueries({ queryKey: queryKeys.works.riskSummary(workId) })
			}
		},
	})

export const createUpdateManualRiskForItemMutationOptions = (workId: number) =>
	mutationOptions({
		mutationFn: ({
			riskId,
			payload,
		}: {
			itemId: number
			riskId: number
			payload: { content?: string | null; action?: string | null }
		}) => updateManualRisk(riskId, payload),
		onSuccess: async (_data, variables) => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.manualRisks(variables.itemId) })
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.acknowledgment(workId) })
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.scene(workId) })
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.detailPage(workId) })
		},
	})

export const createDeleteManualRiskMutationOptions = (itemId: number, workId?: number) =>
	mutationOptions({
		mutationFn: ({ riskId }: { riskId: number }) => deleteManualRisk(riskId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.manualRisks(itemId) })
			if (workId) {
				await queryClient.invalidateQueries({ queryKey: queryKeys.works.riskSummary(workId) })
			}
		},
	})

export const createDeleteManualRiskForItemMutationOptions = (workId: number) =>
	mutationOptions({
		mutationFn: ({ riskId }: { itemId: number; riskId: number }) => deleteManualRisk(riskId),
		onSuccess: async (_data, variables) => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.manualRisks(variables.itemId) })
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.acknowledgment(workId) })
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.scene(workId) })
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.detailPage(workId) })
		},
	})

export const createGenerateRiskMutationOptions = (itemId: number, workId?: number) =>
	mutationOptions({
		mutationFn: () => generateRisk(itemId),
		onSuccess: async () => {
			if (workId) {
				await queryClient.invalidateQueries({ queryKey: queryKeys.works.detail(workId) })
				await queryClient.invalidateQueries({ queryKey: queryKeys.works.acknowledgment(workId) })
			}
		},
	})

export const createGenerateRiskForItemMutationOptions = (workId: number) =>
	mutationOptions({
		mutationFn: ({ itemId }: { itemId: number }) => generateRisk(itemId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.detail(workId) })
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.acknowledgment(workId) })
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.scene(workId) })
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.detailPage(workId) })
		},
	})

export const createUpdateAiRiskMutationOptions = (workId?: number) =>
	mutationOptions({
		mutationFn: ({ riskId, payload }: { riskId: number; payload: { content?: string | null; action?: string | null } }) =>
			updateRiskAssessment(riskId, payload),
		onSuccess: async () => {
			if (workId) {
				await queryClient.invalidateQueries({ queryKey: queryKeys.works.detail(workId) })
				await queryClient.invalidateQueries({ queryKey: queryKeys.works.acknowledgment(workId) })
				await queryClient.invalidateQueries({ queryKey: queryKeys.works.scene(workId) })
				await queryClient.invalidateQueries({ queryKey: queryKeys.works.detailPage(workId) })
			}
		},
	})

export const createDeleteAiRiskMutationOptions = (workId?: number) =>
	mutationOptions({
		mutationFn: ({ riskId }: { riskId: number }) => deleteRiskAssessment(riskId),
		onSuccess: async () => {
			if (workId) {
				await queryClient.invalidateQueries({ queryKey: queryKeys.works.detail(workId) })
				await queryClient.invalidateQueries({ queryKey: queryKeys.works.acknowledgment(workId) })
				await queryClient.invalidateQueries({ queryKey: queryKeys.works.scene(workId) })
				await queryClient.invalidateQueries({ queryKey: queryKeys.works.detailPage(workId) })
			}
		},
	})

export type WorkAcknowledgmentQueryOptions<TData = WorkRiskAcknowledgment | null, TError = Error> = Omit<
	UseQueryOptions<WorkRiskAcknowledgment | null, TError, TData>,
	'queryKey' | 'queryFn'
>

export const createWorkAcknowledgmentQueryOptions = <TData = WorkRiskAcknowledgment | null, TError = Error>(
	workId: number,
	queryConfig?: WorkAcknowledgmentQueryOptions<TData, TError>,
) =>
	queryOptions({
		retry: false,
		...queryConfig,
		queryKey: queryKeys.works.acknowledgment(workId),
		queryFn: () => fetchAcknowledgment(workId),
	})

export type WorkAcknowledgmentHistoryQueryOptions<TData = WorkRiskAcknowledgment[], TError = Error> = Omit<
	UseQueryOptions<WorkRiskAcknowledgment[], TError, TData>,
	'queryKey' | 'queryFn'
>

export const createWorkAcknowledgmentHistoryQueryOptions = <TData = WorkRiskAcknowledgment[], TError = Error>(
	workId: number,
	queryConfig?: WorkAcknowledgmentHistoryQueryOptions<TData, TError>,
) =>
	queryOptions({
		...queryConfig,
		queryKey: queryKeys.works.acknowledgmentHistory(workId),
		queryFn: () => fetchAcknowledgmentHistory(workId),
	})

export const createSubmitAcknowledgmentMutationOptions = (workId: number) =>
	mutationOptions({
		mutationFn: (payload: SubmitAcknowledgmentPayload) => submitAcknowledgment(workId, payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.acknowledgment(workId) })
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.acknowledgmentHistory(workId) })
			await queryClient.invalidateQueries({ queryKey: queryKeys.works.detailPage(workId) })
		},
	})