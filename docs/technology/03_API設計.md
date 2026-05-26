# API設計

## 1. 目的

本ドキュメントは、Flutter学習アプリのMVPで必要となるAPI設計方針を定義する。

MVPでは、教材閲覧、コード編集、サーバービルド、プレビュー、LLM質問、Admin教材管理、LLM教材生成を扱う。

APIは、学習者向け機能、管理者向け機能、ビルド実行、LLM連携の責務を分けて設計する。

## 2. 前提

MVP第一段階では、フロントエンド、バックエンド、データベース、ビルド実行環境をローカルDocker上で動作させる。

MVP第二段階では、GCP、AWSなどのクラウド上にデプロイし、ビルド要求ごとに一時的なワークスペースまたはコンテナを生成する。

MVPでは本格的なログイン機能は必須としない。ただし、API設計上は学習者向けAPIと管理者向けAPIを分離し、将来的に認証・認可を追加できるようにする。

## 3. API分類

### 3.1 学習者向けAPI

学習者向けAPIでは、公開済み教材の閲覧、教材詳細取得、ビルド要求、LLM質問を扱う。

主なAPIは次の通りである。

```text
GET  /api/courses
GET  /api/lessons
GET  /api/lessons/:lessonId
GET  /api/lessons/:lessonId/initial-project
POST /api/builds
GET  /api/builds/:buildId
GET  /api/builds/:buildId/logs
GET  /api/builds/:buildId/artifacts
POST /api/llm/questions
```

ビルド系エンドポイントの詳細は [3.3 ビルド実行API](#33-ビルド実行api) を参照。

### 3.2 管理者向けAPI

管理者向けAPIでは、教材の追加、編集、公開状態変更、一括操作、言語ラベル管理、LLM教材生成、LLM教材修正案生成を扱う。

主なAPIは次の通りである。

```text
GET    /api/admin/lessons
POST   /api/admin/lessons
GET    /api/admin/lessons/:lessonId
PUT    /api/admin/lessons/:lessonId
DELETE /api/admin/lessons/:lessonId
POST   /api/admin/lessons/bulk/publish
POST   /api/admin/lessons/bulk/draft
POST   /api/admin/lessons/bulk/delete
GET    /api/admin/language-labels
POST   /api/admin/language-labels
GET    /api/admin/roadmaps
GET    /api/admin/roadmaps/:roadmapId
PUT    /api/admin/roadmaps/:roadmapId
GET    /api/admin/roadmaps/:roadmapId/steps
PUT    /api/admin/roadmaps/:roadmapId/steps/:stepId
POST   /api/admin/llm/roadmaps
POST   /api/admin/llm/lessons
POST   /api/admin/llm/lesson-revisions
GET    /api/admin/llm/generations/:generationId
```

### 3.3 ビルド実行API

ビルド実行APIでは、ブラウザ上のプロジェクトファイル一式を受け取り、サーバー側でFlutter Webビルドを実行する。

MVP第一段階では、ローカルDocker上のビルド環境で処理する。

MVP第二段階では、クラウド上の一時ワークスペースまたはコンテナで処理する。

主なAPIは次の通りである。

```text
POST /api/builds                        # ビルド要求（学習者からも呼ばれる）
GET  /api/builds/:buildId               # ビルド状態取得
GET  /api/builds/:buildId/logs          # ビルドログ取得
GET  /api/builds/:buildId/artifacts     # ビルド成果物取得
```

### 3.4 LLM連携API

LLM連携APIでは、学習者向け質問、Admin向けロードマップ生成、教材生成、教材修正案生成を扱う。

主なAPIは次の通りである。Admin向けLLMエンドポイントは [3.2 管理者向けAPI](#32-管理者向けapi) と共通。

```text
POST /api/llm/questions                  # 学習者向けLLM質問
POST /api/admin/llm/roadmaps             # ロードマップ生成（Admin）
POST /api/admin/llm/lessons              # 教材生成（Admin）
POST /api/admin/llm/lesson-revisions     # 教材修正案生成（Admin）
```

## 4. 教材一覧API

### 4.0 コース一覧

```text
GET /api/courses
```

公開済みコース（`status: published`）の一覧を返す。返却項目はコースID、タイトル、概要、レベル。

### 4.1 学習者向け教材一覧

```text
GET /api/lessons
```

学習者向け教材一覧では、原則として`published`の教材のみを返す。

クエリパラメータ例は次の通りである。

```text
?language=Flutter
?level=beginner
?sort=language
```

返却項目は次の通りである。

- 教材ID
- 教材タイトル
- 概要
- 対象レベル
- プログラミング言語ラベル
- 公開状態

### 4.2 管理者向け教材一覧

```text
GET /api/admin/lessons
```

管理者向け教材一覧では、`draft`、`published`を含む全教材を返す。

クエリパラメータ例は次の通りである。

```text
?status=draft
?language=Dart
?sort=updatedAt
```

### 4.3 初期プロジェクト取得

```text
GET /api/lessons/:lessonId/initial-project
```

教材が定義する初期プロジェクトのファイル一式を返す。学習者がリセット操作（ファイル単位またはプロジェクト全体）を行う際に使用する。

レスポンス例は次の通りである。

```json
{
  "files": [
    { "path": "lib/main.dart", "content": "..." },
    { "path": "pubspec.yaml", "content": "..." }
  ]
}
```

## 5. 教材一括操作API

管理者は、複数教材を選択して公開、非公開、削除を一括実行できる。

```text
POST /api/admin/lessons/bulk/publish
POST /api/admin/lessons/bulk/draft
POST /api/admin/lessons/bulk/delete
```

リクエスト例は次の通りである。

```json
{
  "lessonIds": ["lesson_001", "lesson_002"]
}
```

削除は破壊的な操作であるため、UI側で確認を行う。将来的には物理削除ではなく論理削除またはアーカイブを検討する。

個別の教材ステータス変更（承認・非公開）は `PUT /api/admin/lessons/:lessonId` の `status` フィールドで行う。一括操作エンドポイントと機能は同じだが、個別ボタンからの操作は単件 PUT で扱い、複数選択時のみ bulk エンドポイントを使用する。

## 6. ビルドAPI

```text
POST /api/builds
```

リクエストには、教材ID、プロジェクトファイル一式、ビルド設定を含める。

```json
{
  "lessonId": "lesson_001",
  "files": [
    {
      "path": "lib/main.dart",
      "content": "..."
    }
  ],
  "buildConfig": {
    "target": "web"
  }
}
```

レスポンスには、ビルドID、ステータス、ログ参照先、プレビュー参照先を含める。

```json
{
  "buildId": "build_001",
  "status": "queued"
}
```

MVP第一段階では、同時ビルド数に上限を設け、上限を超えるリクエストは待機または拒否する。

## 7. LLM質問API

```text
POST /api/llm/questions
```

LLMへの問い合わせには、少なくとも次の情報を含める。

- 教材本文
- 学習目標
- 現在のコード
- ビルドログ
- エラーログ
- ユーザーの質問

リクエスト例は次の通りである。

```json
{
  "lessonId": "lesson_001",
  "question": "エラーの原因を教えてください",
  "context": {
    "currentCode": {
      "lib/main.dart": "..."
    },
    "buildLog": "...",
    "errorLog": "..."
  }
}
```

レスポンス例は次の通りである。

```json
{
  "answer": "エラーの原因は..."
}
```

秘密情報、APIキー、DB接続情報、ホストパスはリクエストに含めない。

## 8. LLM教材生成API

LLM教材生成では、個別教材を直接生成するのではなく、到達目標と成果物からロードマップを作成し、各ステップに対応する教材下書きを生成する。

```text
POST /api/admin/llm/roadmaps
POST /api/admin/llm/lessons
POST /api/admin/llm/lesson-revisions
```

生成結果は自動公開せず、必ず`draft`として保存する。

LLM生成は非同期で完了する場合があるため、生成結果は次のエンドポイントで取得する。

```text
GET /api/admin/llm/generations/:generationId
```

レスポンス例は次の通りである。

```json
{
  "generationId": "gen_001",
  "type": "roadmap_generation",
  "status": "completed",
  "output": { ... }
}
```

`status` が `pending` の間はポーリングまたはビルドAPIと同様のSSEで進捗を取得する。`completed` になったタイミングで `output` に生成結果が入る。

## 9. Admin Roadmap管理API

管理者は、LLMが生成したRoadmapを確認・編集し、各RoadmapStepにLessonを紐づけることができる。

```text
GET  /api/admin/roadmaps                              # Roadmap一覧（draft/published）
GET  /api/admin/roadmaps/:roadmapId                   # Roadmap詳細
PUT  /api/admin/roadmaps/:roadmapId                   # Roadmap編集（タイトル・目標・status等）
GET  /api/admin/roadmaps/:roadmapId/steps             # RoadmapStep一覧
PUT  /api/admin/roadmaps/:roadmapId/steps/:stepId     # RoadmapStep編集（lessonId紐づけ等）
```

Roadmapの公開状態変更も `PUT /api/admin/roadmaps/:roadmapId` の `status` フィールドで行う（`draft` → `published`）。

RoadmapStep の更新では、LLM生成直後は `lessonId` がNULLのため、管理者が後から対応するLessonを紐づける運用を想定する。

```json
{
  "lessonId": "lesson_001"
}
```

## 10. エラー方針

APIエラーは、クライアントが処理しやすい形式で返す。

```json
{
  "error": {
    "code": "BUILD_FAILED",
    "message": "Flutter Web build failed",
    "details": {}
  }
}
```

主なエラーコードは次の通りである。

| コード | 説明 |
|---|---|
| `BUILD_FAILED` | ビルド実行に失敗した |
| `BUILD_TIMEOUT` | ビルドがタイムアウトした |
| `BUILD_QUEUE_FULL` | ビルドキューが上限に達している |
| `INVALID_PROJECT` | アップロードされたプロジェクト構成が不正 |
| `FILE_TOO_LARGE` | アップロードファイルがサイズ上限を超えている |
| `LLM_ERROR` | LLMへの問い合わせに失敗した |
| `NOT_FOUND` | 指定されたリソースが存在しない |
| `FORBIDDEN` | Admin権限が必要な操作を学習者が試みた |

内部例外、秘密情報、ホスト環境のパスはレスポンスに含めない。

## 11. 今後の検討事項

- API認証方式
- Admin権限管理
- ビルドキュー
- WebSocketまたはServer-Sent Eventsによるビルドログ配信
- 成果物ストレージ
- GitHub連携API
