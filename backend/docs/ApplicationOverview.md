
---

# 📝 リスクチェックアプリ 最終要件定義

---

## 1. アプリ概要

* 工場作業前に **作業内容とリスクを確認・共有するWebアプリ**
* 前日までに作業・リスクを登録
* 当日は確認＋コメント追記
* 実施後も履歴として保持

---

## 2. 利用者・ロール

| ロール            | 権限・利用範囲       |
| -------------- | ------------- |
| worker         | 作業確認、コメント追加   |
| leader         | 作業・作業内容の登録、閲覧 |
| safety_manager | 履歴参照のみ        |

* 認証あり（ログイン必須）
* 権限は簡易（画面・操作分岐のみ）
* 高度なACLや外部認証はスコープ外

---

## 3. 機能要件

### 3-1. 作業管理

* 作業（Work）を前日までに作成
* 作業には複数の作業内容（WorkItem）
* 作業グループで分類（WorkGroup）
* 作業件名・作業内容・作業日・ステータスを保持
* 作業ステータス： draft / confirmed / done

### 3-2. リスク管理

* 人が検討したリスク＋AI補完リスクをDBに格納
* RiskAssessmentは不変（再生成時は新レコード）
* AIによる推奨リスクは表示のみ、編集不可

### 3-3. コメント

* 作業に紐づく時系列ログ
* 誰がコメントしたかを記録
* 最大文字数500文字
* 履歴として削除不可（必要に応じ編集不可）

### 3-4. 当日確認

* ユーザーが当日の作業を選択
* AI出力リスク表示
* コメント追加・履歴参照
* チャット風表示ではなく、時系列ログ

---

## 4. 非機能要件

* Webアプリ（FastAPI + React）
* クリーンアーキテクチャ意識
* SQLModel使用（DBモデル + Pydantic兼用可能）
* 認証機能必須（最小限で十分）
* DB制約：

  * FK制約、文字列長制限、ユニーク制約
  * 日付・時刻はタイムゾーンUTC
* 履歴保持：

  * RiskAssessmentとWorkCommentは削除不可
* スケーラビリティ：

  * 現状は小規模工場想定、将来拡張可能

---

## 5. ドメインエンティティ（概略）

| Entity         | 属性・制約                                                               |
| -------------- | ------------------------------------------------------------------- |
| WorkGroup      | id PK, name(50) unique                                              |
| Work           | id PK, title(100), description(500), group_id FK, work_date, status |
| WorkItem       | id PK, work_id FK, name(100), description(300)                      |
| RiskAssessment | id PK, work_item_id FK, content(1000), generated_at                 |
| WorkComment    | id PK, work_id FK, user_id FK, content(500), created_at             |
| User           | id PK, name(50), role(worker/leader/safety_manager), is_active      |
| AuthUser       | user_id PK FK, login_id(50) unique, password_hash(256)              |

---

## 6. アーキテクチャ関連要件

* **Clean Architecture準拠**

  * Presentation層：FastAPI + Pydantic
  * Application層：UseCase単位（Command/Query）
  * Domain層：Entity・集約のみ、フレームワーク非依存
  * Infrastructure層：SQLModel + DB + AI API
* Pydanticは Presentation層に閉じる
* UseCaseは純Pythonで受け渡し
* Repositoryパターンを導入し、DB操作をInfrastructureに集約

---

## 7. ユースケース例（Application層）

* CreateWork
* AddWorkItem
* GenerateRiskAssessment
* GetDailyWorkOverview
* AddWorkComment
* ListWorkComments
* Login (Auth)

---

## 8. DB制約・カラム詳細（SQLModel準拠）

* 文字列長制限、nullable、FK、ユニークを上記Entityに設定
* デフォルト値：status=draft、is_active=True、created_at=datetime.utcnow

---

## 9. 履歴・不変性

* RiskAssessmentは生成後更新不可
* WorkCommentは削除不可
* Work・WorkItemは更新可（ステータスや内容の変更）

---

💡 **ポイントまとめ**

* Domainは安全確認に集中
* 権限管理は最小限で借りる
* SQLModel使用でコード量を減らす
* 履歴保持を重視
* Clean Architectureは最初から完璧でなくても、境界を意識すれば後から導入可能
