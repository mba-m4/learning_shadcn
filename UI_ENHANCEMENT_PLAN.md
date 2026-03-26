# フロントエンド UI 強化機能追加提案

**作成日**: 2026年2月26日  
**対象**: フロントエンド UI の見た目・使い勝手改善  
**方針**: 既存機能の活用と新規 UI 機能で、見た目を大幅に強化

---

## 🎯 UI 強化の方向性

**現状**: 機能は実装されているが、UI として十分活用されていない  
**目標**: グラフ、チャート、色分け、通知など、ユーザーが「見て分かる」UI を実装

---

## 📋 UI 強化機能 - 優先リスト

### Level 1️⃣: **ダッシュボード拡張** ⭐⭐⭐ 最優先

#### 1. **未署名作業数の表示（警告カード）**

**現状**: ダッシュボードに「本日の作業数」は表示されているが、「未署名作業」は見えない

**改善内容**:
```tsx
// DashboardPage に追加
<div className="rounded-xl border border-red-200 bg-red-50 p-5">
  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-red-600">
    <AlertTriangle className="h-4 w-4" />
    Unsigned
  </div>
  <p className="mt-3 text-2xl font-semibold text-red-900">
    {unsignedWorks.length}
  </p>
  <p className="text-sm text-red-700">未署名の作業</p>
  {unsignedWorks.length > 0 && (
    <Button 
      size="sm" 
      className="mt-4 w-full bg-red-600 hover:bg-red-700"
      onClick={() => navigate(`/works/${unsignedWorks[0].id}`)}
    >
      確認が必要です
    </Button>
  )}
</div>
```

**期待効果**: リーダーが一目で「誰が署名を済ませていないか」が分かる

---

#### 2. **リスク統計グラフ（Weekly Trend）**

**現状**: リスク数は数字で表示されているのみ

**改善内容**:
```tsx
// DashboardPage に新セクション追加
<section className="rounded-xl border border-border/60 bg-white p-6">
  <h2 className="text-lg font-semibold text-slate-900">リスク推移（過去7日）</h2>
  <div className="mt-4 h-48 w-full bg-slate-100 rounded flex items-center justify-center">
    {/* 後ほど recharts で簡易グラフ （ площади、折れ線） */}
    <div className="text-center text-sm text-muted-foreground">
      <BarChart3 className="h-12 w-12 mb-2 mx-auto" />
      リスク発生傾向グラフ
    </div>
  </div>
</section>
```

**期待効果**: 「リスクが増えているのか減っているのか」が視覚的に分かる

---

#### 3. **班別「完了率」ランキング（是正措置ベース）**

**現状**: 班別「リスク検出率」でランキング（これは競争を促進して報告抑止につながる）

**改善内容**:
```tsx
// ランキングの内容を変更
<section className="rounded-xl border border-border/60 bg-white p-6">
  <h2 className="text-lg font-semibold text-slate-900">班別実績ランキング</h2>
  <div className="space-y-3 mt-4">
    {rankingData.map((group, idx) => (
      <div key={group.id} className="flex items-center gap-3 p-3 border rounded-lg">
        <div className="font-bold text-lg w-8 h-8 flex items-center justify-center bg-amber-200 rounded-full">
          #{idx + 1}
        </div>
        <div className="flex-1">
          <p className="font-semibold">{group.name}</p>
          <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
            <span>✓ 是正措置完了率: <span className="font-semibold text-green-600">{group.correctionRate}%</span></span>
            <span>📋 安全確認率: <span className="font-semibold text-blue-600">{group.safetyCheckRate}%</span></span>
          </div>
          {/* プログレスバー */}
          <div className="mt-2 flex gap-2">
            <div className="flex-1 h-2 bg-slate-200 rounded overflow-hidden">
              <div 
                className="h-full bg-green-500"
                style={{ width: `${group.correctionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>
```

**期待効果**: 「報告するとランクが上がる」という心理が働く（安全文化の醸成）

---

### Level 2️⃣: **リスク管理 UI 強化** ⭐⭐⭐

#### 4. **リスク一覧の色分け・バッジ強化**

**現状**: リスク一覧は黒いテーブルでシンプル

**改善内容**:
```tsx
// RiskRecord（リスク台帳）の表示をカード化 + 色分け

<div className="grid gap-3">
  {risks.map((risk) => {
    const severityColor = {
      high: 'bg-red-100 border-red-300 text-red-700',
      medium: 'bg-yellow-100 border-yellow-300 text-yellow-700',
      low: 'bg-green-100 border-green-300 text-green-700',
    }[risk.severity]

    const statusIcon = {
      open: <AlertTriangle className="h-4 w-4" />,
      in_review: <Clock className="h-4 w-4" />,
      closed: <CheckCircle2 className="h-4 w-4" />,
    }[risk.status]

    return (
      <button
        key={risk.id}
        onClick={() => navigate(`/risk/${risk.id}`)}
        className={`text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${severityColor}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold">{risk.title}</h3>
            <p className="text-sm mt-1">{risk.work_title && `作業: ${risk.work_title}`}</p>
            <p className="text-xs mt-2 opacity-75">{risk.summary}</p>
          </div>
          <div className="ml-2 flex flex-col items-end gap-2">
            <Badge variant={risk.severity === 'high' ? 'destructive' : 'secondary'}>
              {risk.severity === 'high' ? '高' : risk.severity === 'medium' ? '中' : '低'}
            </Badge>
            <div className="text-muted-foreground">
              {statusIcon}
            </div>
          </div>
        </div>
        
        {/* 是正措置表示 */}
        {risk.actions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-current border-opacity-20">
            <p className="text-xs font-semibold mb-1">是正措置:</p>
            <div className="flex flex-wrap gap-1">
              {risk.actions.map((action, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {action}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </button>
    )
  })}
</div>
```

**期待効果**: 「どのリスクが重大か」が色で即座に分かる

---

#### 5. **リスク詳細ページの「履歴タイムライン」表示**

**現状**: リスク詳細ページにステータス変更の履歴がない

**改善内容**:
```tsx
// RiskDetailPage に追加
<section className="rounded-xl border border-border/60 bg-white p-6">
  <h2 className="text-lg font-semibold text-slate-900">変更履歴</h2>
  <div className="mt-4 space-y-3 pl-4 border-l-2 border-slate-300">
    {auditLogs.map((log) => (
      <div key={log.id} className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 -ml-5 border-2 border-white" />
          <p className="font-semibold text-sm">{log.action}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {log.changed_by_name} - {format(new Date(log.changed_at), 'YYYY-MM-DD HH:mm')}
        </p>
        {log.old_value && (
          <p className="text-xs text-slate-600 mt-1">
            {log.changed_field}: <span className="line-through">{log.old_value}</span> → <span className="font-semibold">{log.new_value}</span>
          </p>
        )}
      </div>
    ))}
  </div>
</section>
```

**期待効果**: 「このリスクいつ報告されたの？誰が対応をした？」が時系列で分かる

---

### Level 3️⃣: **安全確認フロー UI** ⭐⭐⭐

#### 6. **署名パッド付き「安全確認ダイアログ」実装**

**現状**: WorkDetailPage に安全確認フロー（RiskAcknowledgmentDialog）の実装は計画されているが、フロントエンドコンポーネントが未実装

**改善内容**:
```tsx
// components/work/RiskAcknowledgmentDialog.tsx
// ↑ 実装ドキュメントのコード参照

import SignaturePad from 'react-signature-canvas'

export default function RiskAcknowledgmentDialog({ work, onComplete }: Props) {
  const sigCanvasRef = useRef<any>(null)
  const { acknowledgeRisk, acknowledgedRisks, submitAcknowledgment } = useSafetyStore()
  
  const allRisks = work.items.flatMap(item => [
    ...item.risks,
    ...manualRisksByItemId[item.id] ?? []
  ])
  
  const allAcknowledged = allRisks.every(r => acknowledgedRisks.has(r.id))

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            本日のリスク確認フロー
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* ステップ表示 */}
          <div className="flex gap-4">
            {[
              { num: 1, label: 'リスク確認' },
              { num: 2, label: '署名' },
              { num: 3, label: '完了' },
            ].map((step) => (
              <div key={step.num} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  step.num <= (allAcknowledged ? 2 : 1)
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-200'
                }`}>
                  {step.num}
                </div>
                <span className="text-sm">{step.label}</span>
              </div>
            ))}
          </div>

          {/* リスク確認チェックボックス */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">⚠️ 以下のリスクを確認してください</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto rounded border border-slate-200 p-3 bg-slate-50">
              {allRisks.map((risk) => (
                <label key={risk.id} className="flex items-start gap-2 p-2 hover:bg-white rounded">
                  <Checkbox
                    checked={acknowledgedRisks.has(risk.id)}
                    onCheckedChange={() => acknowledgeRisk(risk.id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-sm">{risk.content}</p>
                    {risk.action && (
                      <p className="text-xs text-muted-foreground">対策: {risk.action}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
            {allAcknowledged && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                全てのリスクを確認しました
              </p>
            )}
          </div>

          {/* 署名パッド */}
          {allAcknowledged && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">署名</h3>
              <div className="border-2 border-slate-300 rounded bg-white overflow-hidden">
                <SignaturePad
                  ref={sigCanvasRef}
                  canvasProps={{
                    className: 'w-full h-32',
                  }}
                  velocityFilterWeight={0.7}
                  minWidth={0.5}
                  maxWidth={2.5}
                  throttle={16}
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => sigCanvasRef.current?.clear()}
                className="w-full"
              >
                署名をクリア
              </Button>
            </div>
          )}

          {/* 法的確認メッセージ */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p className="text-xs text-amber-900 font-semibold mb-1">⚠️ 重要な確認</p>
            <ul className="text-xs text-amber-800 space-y-0.5">
              <li>✓ 上記のリスクを理解し、必要な対策を実施することを誓約します</li>
              <li>✓ この署名は法的効力を有します</li>
              <li>✓ 未署名では作業を開始することができません</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => submitAcknowledgment(work.work.id)}
            disabled={!allAcknowledged || !sigCanvasRef.current?.isEmpty?.()}
            className="w-full"
            size="lg"
          >
            ✓ 確認完了、作業開始
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**期待効果**: 
- デジタル署名で法的証跡を保全
- ユーザーが「確認している」という心理的安心感
- コンプライアンス対策

---

### Level 4️⃣: **検索・フィルター結果の可視化** ⭐⭐

#### 7. **作業一覧フィルター結果をタグ表示**

**現状**: 作業search結果は「20件該当」と数字のみ

**改善内容**:
```tsx
// WorksExplorerPage に追加

<section className="rounded-xl border border-border/60 bg-white p-6">
  {/* 適用中のフィルター */}
  {(listStartDate || listEndDate || selectedGroup || searchQuery) && (
    <div className="mb-4 p-3 bg-blue-50 rounded-lg flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-blue-700">フィルター中:</span>
      {listStartDate && (
        <Badge variant="outline" className="gap-1 flex items-center">
          📅 {listStartDate}
          <button onClick={() => setListStartDate(null)} className="ml-1">×</button>
        </Badge>
      )}
      {selectedGroup && (
        <Badge variant="outline" className="gap-1 flex items-center">
          🏷️ {selectedGroup}
          <button onClick={() => setSelectedGroup(null)} className="ml-1">×</button>
        </Badge>
      )}
      {searchQuery && (
        <Badge variant="outline" className="gap-1 flex items-center">
          🔍 {searchQuery}
          <button onClick={() => setSearchQuery('')} className="ml-1">×</button>
        </Badge>
      )}
      <Button size="sm" variant="ghost" onClick={resetFilters} className="ml-auto">
        フィルターをリセット
      </Button>
    </div>
  )}

  {/* 検索結果サマリー */}
  <div className="flex items-center gap-3 mb-4">
    <p className="font-semibold text-sm">検索結果: <span className="text-lg text-blue-600">{workListTotal}</span> 件</p>
    <select className="text-xs border rounded px-2 py-1">
      <option>作成日が新しい順</option>
      <option>リスク数が多い順</option>
      <option>ステータス(draft → confirmed)</option>
    </select>
  </div>

  {/* 結果一覧（カード表示） */}
  {workList.length > 0 ? (
    <div className="grid gap-3">
      {workList.map((work) => (
        <button
          key={work.work.id}
          onClick={() => navigate(`/works/${work.work.id}`)}
          className="text-left p-4 border border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">{work.work.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{work.work.description}</p>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <Badge variant="secondary">{work.work.work_date}</Badge>
                <Badge variant="outline">{groupMap.get(work.work.group_id)}</Badge>
              </div>
            </div>
            <div className="ml-4 text-right">
              <div className="text-2xl font-bold text-slate-900">{work.items.length}</div>
              <p className="text-xs text-muted-foreground">項目</p>
              <div className="mt-2 text-2xl font-bold text-red-600">{work.risk_count}</div>
              <p className="text-xs text-muted-foreground">リスク</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  ) : (
    <div className="text-center py-12">
      <Search className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
      <p className="text-muted-foreground">条件に合致する作業がありません</p>
    </div>
  )}
</section>
```

**期待効果**: 「どんなフィルター条件で検索しているのか」が見える

---

#### 8. **リスク台帳のフィルター集計（ドーナツチャート）**

**現状**: リスク管理ページでフィルター後、何件該当しているか数字だけ

**改善内容**:
```tsx
// RiskManagementPage に追加

<div className="grid grid-cols-2 gap-4 mb-6">
  {/* 重要度別 */}
  <div className="rounded-xl border border-border/60 bg-white p-4">
    <h3 className="font-semibold text-sm mb-3">重要度別</h3>
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>高</span>
        </div>
        <span className="font-bold text-red-600">{highCount}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>中</span>
        </div>
        <span className="font-bold text-yellow-600">{mediumCount}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>低</span>
        </div>
        <span className="font-bold text-green-600">{lowCount}</span>
      </div>
    </div>
  </div>

  {/* ステータス別 */}
  <div className="rounded-xl border border-border/60 bg-white p-4">
    <h3 className="font-semibold text-sm mb-3">ステータス別</h3>
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3 w-3 text-red-500" />
          <span>Open</span>
        </div>
        <span className="font-bold">{openCount}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3 text-yellow-500" />
          <span>In Review</span>
        </div>
        <span className="font-bold">{inReviewCount}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          <span>Closed</span>
        </div>
        <span className="font-bold">{closedCount}</span>
      </div>
    </div>
  </div>
</div>
```

**期待効果**: リスク分析が一目で可能

---

### Level 5️⃣: **通知・警告 UI** ⭐⭐

#### 9. **ダッシュボード「アラートバナー」**

**現状**: 重要な警告情報がない

**改善内容**:
```tsx
// DashboardPage 最上部に追加

{/* アラートセクション */}
{alerts.length > 0 && (
  <div className="space-y-2">
    {alerts.map((alert) => (
      <div
        key={alert.id}
        className={`p-4 rounded-lg border-l-4 flex items-start justify-between ${
          alert.level === 'critical'
            ? 'border-l-red-600 bg-red-50'
            : alert.level === 'warning'
            ? 'border-l-yellow-600 bg-yellow-50'
            : 'border-l-blue-600 bg-blue-50'
        }`}
      >
        <div className="flex-1">
          <p className={`font-semibold text-sm ${
            alert.level === 'critical' ? 'text-red-900' : 
            alert.level === 'warning' ? 'text-yellow-900' : 
            'text-blue-900'
          }`}>
            {alert.title}
          </p>
          <p className={`text-xs mt-1 ${
            alert.level === 'critical' ? 'text-red-700' : 
            alert.level === 'warning' ? 'text-yellow-700' : 
            'text-blue-700'
          }`}>
            {alert.message}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(alert.action_url)}
          className="ml-4"
        >
          確認
        </Button>
      </div>
    ))}
  </div>
)}

// アラートの例
const alerts = [
  {
    id: 1,
    level: 'critical',
    title: '🚨 緊急対応が必要です',
    message: '高リスク「火傷リスク」が未対応のまま 8 時間経過',
    action_url: '/risk/1'
  },
  {
    id: 2,
    level: 'warning',
    title: '⚠️ 本日の作業 3 件がまだ署名されていません',
    message: 'リーダーの確認が必要です',
    action_url: '/dashboard'
  },
  {
    id: 3,
    level: 'info',
    title: 'ℹ️ 先月のリスク報告数が 20% 増加しました',
    message: '安全報告文化が定着しています',
    action_url: '/risk'
  }
]
```

**期待効果**: 
- 重要な事象を見落とさない
- リアクティブな安全管理

---

## 📐 実装の優先順序

### Phase 1: **ダッシュボード周辺** (3-5日)
1. 未署名作業数カード（警告色）
2. リスク推移グラフ（簡易版）
3. 班別完了率ランキング

### Phase 2: **リスク UI 強化** (3-5日)
4. リスク一覧のカード化・色分け
5. リスク詳細の履歴タイムライン

### Phase 3: **安全確認フロー** (2-3日)
6. 署名パッド付きダイアログ

### Phase 4: **検索・フィルター** (2-3日)
7. 作業検索結果のタグ表示
8. リスク集計カード

### Phase 5: **通知・警告** (2-3日)
9. ダッシュボード アラートバナー

---

## 🛠️ 技術的な注意点

### グラフライブラリの選定

**現状**: sample に `recharts` がすでに使用されている

```bash
npm list recharts
# recharts@2.x は package.json に存在しない可能性
```

**対応**: 必要に応じて recharts をインストール
```bash
npm install recharts
```

**使用例**:
```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const data = [
  { date: '2/20', risks: 3 },
  { date: '2/21', risks: 5 },
  { date: '2/22', risks: 4 },
  { date: '2/23', risks: 7 },
  { date: '2/24', risks: 6 },
  { date: '2/25', risks: 8 },
  { date: '2/26', risks: 4 }
]

<BarChart width={500} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="risks" fill="#ef4444" />
</BarChart>
```

---

## 📊 新規ストア・Hook の追加

### `useDashboardMetrics()` - ダッシュボード集計用

```typescript
// lib/hooks/useDashboardMetrics.ts

export function useDashboardMetrics() {
  const { dailyWorks, workDetail, allRisks } = useWorkContext()
  const { acknowledgments } = useSafetyStore()
  
  const unsignedWorks = dailyWorks.filter(w => !acknowledgments[w.work.id])
  const risksByLevel = {
    high: allRisks.filter(r => r.severity === 'high').length,
    medium: allRisks.filter(r => r.severity === 'medium').length,
    low: allRisks.filter(r => r.severity === 'low').length,
  }
  
  const groupMetrics = groupBy(allRisks, r => r.work_title).map(([group, risks]) => ({
    name: group,
    correctionRate: risks.filter(r => r.actions.length > 0).length / risks.length * 100,
    safetyCheckRate: risks.filter(r => r.status !== 'open').length / risks.length * 100,
  }))
  
  return {
    unsignedWorks,
    risksByLevel,
    groupMetrics,
    alerts: generateAlerts(unsignedWorks, risksByLevel),
  }
}

function generateAlerts(unsigned: any[], risks: any[]) {
  const alerts = []
  
  if (unsigned.length > 0) {
    alerts.push({
      level: 'critical',
      title: `${unsigned.length} 件の作業がまだ署名されていません`,
      action_url: `/works/${unsigned[0].work.id}`,
    })
  }
  
  if (risks.high > 5) {
    alerts.push({
      level: 'warning',
      title: `高リスクが ${risks.high} 件あります`,
      action_url: '/risk',
    })
  }
  
  return alerts
}
```

---

## ✅ チェックリスト

### ダッシュボード拡張
- [ ] 未署名作業数カードを追加
- [ ] リスク推移グラフ（recharts）を追加
- [ ] 班別ランキングを「完了率」に変更
- [ ] アラートバナーを実装

### リスク UI 強化
- [ ] リスク一覧をカード形式に変更
- [ ] 重要度別の色分け（赤/黄/緑）を統一
- [ ] リスク詳細にタイムライン表示を追加

### 安全確認フロー
- [ ] RiskAcknowledgmentDialog を実装
- [ ] SignaturePad キャンバスを追加
- [ ] useSafetyStore hook を実装

### 検索・フィルター
- [ ] フィルター条件をタグで表示
- [ ] リスク集計カード（重要度別・ステータス別）を追加
- [ ] 検索結果を「ソート」機能付きで表示

---

## 🎨 UI デザイン統一

### カラースキーム
```
リスク重要度:
- High: #ef4444 (red-500)
- Medium: #eab308 (yellow-500)
- Low: #22c55e (green-500)

ステータス:
- Open: #ef4444 (赤)
- In Review: #f59e0b (橙)
- Closed: #10b981 (緑)

アクション:
- Primary: #3b82f6 (blue-500)
- Danger: #ef4444 (red-500)
- Success: #10b981 (green-500)
- Warning: #eab308 (yellow-500)
```

### コンポーネント再利用
- `<RiskBadge severity="high" />` - リスク重要度バッジ
- `<StatusIcon status="open" />` - ステータスアイコン
- `<MetricCard label="..." value={...} />` - KPI カード
- `<TimelineItem action="..." timestamp={...} />` - 履歴タイムラインアイテム

---

**これで UI 強化の全体像が見えるようになります！**
