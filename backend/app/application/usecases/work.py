from datetime import date, datetime

from app.domain.models import (
    ManualRisk,
    RiskAssessment,
    RiskSummary,
    Work,
    WorkDateStream,
    WorkDateCount,
    WorkDetail,
    WorkGroup,
    WorkItemWithRisks,
    WorkListItem,
    WorkListPage,
    WorkOverview,
)
from app.domain.repositories import WorkRepository


class CreateWorkGroupUseCase:
    def __init__(self, repo: WorkRepository):
        self._repo = repo

    def execute(self, name: str, role: str) -> WorkGroup:
        if role != "leader":
            raise PermissionError("Not allowed")
        return self._repo.create_work_group(name)


class ListWorkGroupsUseCase:
    def __init__(self, repo: WorkRepository):
        self._repo = repo

    def execute(self) -> list[WorkGroup]:
        return self._repo.list_work_groups()


class CreateWorkUseCase:
    def __init__(self, repo: WorkRepository):
        self._repo = repo

    def execute(
        self,
        title: str,
        description: str,
        group_id: int,
        work_date: date,
        status: str,
        role: str,
    ) -> Work:
        if role != "leader":
            raise PermissionError("Not allowed")
        return self._repo.create_work(title, description, group_id, work_date, status)


class AddWorkItemUseCase:
    def __init__(self, repo: WorkRepository):
        self._repo = repo

    def execute(self, work_id: int, name: str, description: str, role: str):
        if role != "leader":
            raise PermissionError("Not allowed")
        return self._repo.add_work_item(work_id, name, description)


class GenerateRiskAssessmentUseCase:
    def __init__(self, repo: WorkRepository):
        self._repo = repo

    def execute(self, work_item_id: int, role: str) -> str:
        if role != "leader":
            raise PermissionError("Not allowed")
        content = f"AI suggested risk for work item {work_item_id}. Review and confirm before work."  # placeholder
        risk = self._repo.create_risk_assessment(work_item_id, content)
        return risk.content


class CreateManualRiskUseCase:
    def __init__(self, repo: WorkRepository):
        self._repo = repo

    def execute(
        self,
        work_item_id: int,
        content: str,
        role: str,
        action: str | None = None,
    ) -> ManualRisk:
        if role == "safety_manager":
            raise PermissionError("Not allowed")
        return self._repo.create_manual_risk(work_item_id, content, action)


class ListManualRisksUseCase:
    def __init__(self, repo: WorkRepository):
        self._repo = repo

    def execute(self, work_item_id: int) -> list[ManualRisk]:
        return self._repo.list_manual_risks(work_item_id)


class UpdateManualRiskUseCase:
    def __init__(self, repo: WorkRepository):
        self._repo = repo

    def execute(
        self,
        risk_id: int,
        content: str | None,
        action: str | None,
        role: str,
    ) -> ManualRisk | None:
        if role == "safety_manager":
            raise PermissionError("Not allowed")
        return self._repo.update_manual_risk(risk_id, content, action)


class DeleteManualRiskUseCase:
    def __init__(self, repo: WorkRepository):
        self._repo = repo

    def execute(self, risk_id: int, role: str) -> bool:
        if role == "safety_manager":
            raise PermissionError("Not allowed")
        return self._repo.delete_manual_risk(risk_id)


class UpdateRiskAssessmentUseCase:
    def __init__(self, repo: WorkRepository):
        self._repo = repo

    def execute(
        self,
        risk_id: int,
        content: str | None,
        action: str | None,
        role: str,
    ) -> RiskAssessment | None:
        if role == "safety_manager":
            raise PermissionError("Not allowed")
        return self._repo.update_risk_assessment(risk_id, content, action)


class DeleteRiskAssessmentUseCase:
    def __init__(self, repo: WorkRepository):
        self._repo = repo

    def execute(self, risk_id: int, role: str) -> bool:
        if role == "safety_manager":
            raise PermissionError("Not allowed")
        return self._repo.delete_risk_assessment(risk_id)


class GetWorkRiskSummaryUseCase:
    def __init__(self, repo: WorkRepository):
        self._repo = repo

    def execute(self, work_id: int) -> RiskSummary:
        risk_entries: list[tuple[str, datetime]] = []
        total = 0

        for item in self._repo.list_work_items(work_id):
            ai_risks = self._repo.list_risk_assessments(item.id)
            manual_risks = self._repo.list_manual_risks(item.id)
            total += len(ai_risks) + len(manual_risks)

            for risk in ai_risks:
                risk_entries.append((risk.content, risk.generated_at))
            for risk in manual_risks:
                risk_entries.append((risk.content, risk.created_at))

        score = min(total * 20, 100)
        if score >= 70:
            level = "high"
        elif score >= 40:
            level = "medium"
        else:
            level = "low"

        updated_at = max((entry[1] for entry in risk_entries), default=None)
        reasons = [entry[0] for entry in sorted(risk_entries, key=lambda item: item[1], reverse=True)[:3]]
        if not reasons:
            reasons = None

        return RiskSummary(
            work_id=work_id,
            level=level,
            score=score,
            reasons=reasons,
            updated_at=updated_at,
        )


class GetDailyWorkOverviewUseCase:
    def __init__(self, repo: WorkRepository):
        self._repo = repo

    def execute(self, work_date: date) -> list[WorkOverview]:
        works = self._repo.list_works_by_date(work_date)
        overview: list[WorkOverview] = []
        for work in works:
            items = []
            for item in self._repo.list_work_items(work.id):
                risks = self._repo.list_risk_assessments(item.id)
                items.append(WorkItemWithRisks(item=item, risks=risks))
            overview.append(WorkOverview(work=work, items=items))
        return overview


class GetWorkListUseCase:
    def __init__(self, repo: WorkRepository):
        self._repo = repo

    def execute(
        self,
        start_date: date,
        end_date: date,
        limit: int,
        offset: int,
        group_id: int | None = None,
        keyword: str | None = None,
    ) -> WorkListPage:
        works = self._repo.list_works_by_date_range(start_date, end_date, limit, offset, group_id, keyword)
        total = self._repo.count_works_by_date_range(start_date, end_date, group_id, keyword)

        items: list[WorkListItem] = []
        for work in works:
            work_items = self._repo.list_work_items(work.id)
            risk_count = 0
            for item in work_items:
                risk_count += len(self._repo.list_risk_assessments(item.id))
                risk_count += len(self._repo.list_manual_risks(item.id))
            items.append(WorkListItem(work=work, items=work_items, risk_count=risk_count))

        return WorkListPage(items=items, total=total, limit=limit, offset=offset)


class GetWorkDateSummaryUseCase:
    def __init__(self, repo: WorkRepository):
        self._repo = repo

    def execute(self, start_date: date, end_date: date) -> list[WorkDateCount]:
        rows = self._repo.list_work_date_counts(start_date, end_date)
        return [WorkDateCount(work_date=row[0], count=row[1]) for row in rows]


class GetWorkDetailUseCase:
    def __init__(self, repo: WorkRepository):
        self._repo = repo

    def execute(self, work_id: int) -> WorkDetail | None:
        work = self._repo.get_work(work_id)
        if not work:
            return None
        items = []
        for item in self._repo.list_work_items(work.id):
            risks = self._repo.list_risk_assessments(item.id)
            items.append(WorkItemWithRisks(item=item, risks=risks))
        return WorkDetail(work=work, items=items)


class GetWorkDateStreamUseCase:
    def __init__(self, repo: WorkRepository):
        self._repo = repo

    def execute(self, start_date: date, end_date: date) -> list[WorkDateStream]:
        rows = self._repo.list_work_date_counts(start_date, end_date)
        streams: list[WorkDateStream] = []
        for work_date, _count in rows:
            works = self._repo.list_works_by_date(work_date)
            items: list[WorkListItem] = []
            for work in works:
                work_items = self._repo.list_work_items(work.id)
                risk_count = 0
                for item in work_items:
                    risk_count += len(self._repo.list_risk_assessments(item.id))
                    risk_count += len(self._repo.list_manual_risks(item.id))
                items.append(WorkListItem(work=work, items=work_items, risk_count=risk_count))
            streams.append(WorkDateStream(work_date=work_date, items=items))
        return streams
