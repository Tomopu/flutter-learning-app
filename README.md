# flutter-learning-app

Flutterを実践的に学習するためのWebベース学習プラットフォームです。

教材の閲覧、コード編集、実行結果の確認、ビルドログの確認、LLMへの質問を1つのWebアプリ上で行える環境を目指します。

- [プロダクト概要](docs/product/プロダクト概要.md)
- [docs 目次](docs/README.md)
- [開発計画](docs/project/01_開発計画.md)

## 想定ディレクトリ構成

```text
.
├── README.md
├── docs/
│   ├── product/
│   │   ├── 01_プロダクト概要.md
│   │   ├── 02_MVPスコープ.md
│   │   └── 03_ロードマップ.md
│   ├── requirements/
│   │   ├── 01_機能要件.md
│   │   ├── 02_非機能要件.md
│   │   └── 03_ユーザーストーリー.md
│   ├── research/
│   │   ├── 01_Progate型学習環境の調査.md
│   │   ├── 02_Flutterオンライン実行方式.md
│   │   └── 03_AI教材生成の調査.md
│   ├── technology/
│   │   ├── 01_技術選定.md
│   │   ├── 02_フロントエンド.md
│   │   ├── 03_バックエンド.md
│   │   ├── 04_実行環境.md
│   │   └── 05_LLM連携.md
│   ├── architecture/
│   │   ├── 01_システムアーキテクチャ.md
│   │   ├── 02_教材管理アーキテクチャ.md
│   │   ├── 03_実行環境アーキテクチャ.md
│   │   ├── 04_Admin承認フロー.md
│   │   └── 05_多言語対応方針.md
│   ├── design/
│   │   ├── 01_画面一覧.md
│   │   ├── 02_画面設計.md
│   │   └── 03_UI方針.md
│   └── project/
│       ├── 01_開発計画.md
│       ├── 02_マイルストーン.md
│       └── 03_GitHubプロジェクト管理.md
├── contents/
│   └── flutter/
│       └── practical-flutter/
│           └── lesson-001/
│               ├── lesson.md
│               ├── metadata.json
│               ├── initial_code.dart
│               └── solution.dart
├── apps/
│   ├── web/
│   └── api/
└── packages/
```

## 現在の優先事項

1. プロダクト概要とMVPスコープの確定
2. Flutterコードの実行・ビルド方式の技術検証
3. 最初の教材1本を対象にした学習体験のプロトタイプ作成

## ライセンス

未定
