# design

このディレクトリでは、要求仕様を実装可能な形に落とし込む設計書を管理します。

`03_design/` は「どう実現するか」を扱います。要求そのものは [01_requirements/](../01_requirements/) に、プロジェクト全体の規約や方針は [02_standards/](../02_standards/) に置きます。

## 構成

- [01_architecture/](01_architecture/): システム全体の基本設計、責務分割、構成、主要データフロー
- [02_ui/](02_ui/): 画面一覧、画面設計、UI方針
- [03_api/](03_api/): API分類、エンドポイント、リクエスト、レスポンス、エラー方針
- [04_data/](04_data/): データモデル、DB設計、エンティティ、削除方針
- [05_backend/](05_backend/): バックエンド内部構造、レイヤー設計、処理フロー
- [06_frontend/](06_frontend/): フロントエンド内部構造、状態管理、画面実装方針
- [07_build-runtime/](07_build-runtime/): Flutter Webビルド実行環境、ワークスペース、成果物管理
- [08_llm/](08_llm/): LLM連携、プロンプト、コンテキスト、生成物検証

## 設計書の位置づけ

- `architecture` は基本設計に近い文書として、システム全体の構成と境界を扱う。
- `ui`、`api`、`data`、`backend`、`frontend`、`build-runtime`、`llm` は詳細設計に近い文書として、実装に必要な構造や振る舞いを扱う。
- 将来的に必要になった場合は、`test`、`deployment`、`observability` などを追加する。
