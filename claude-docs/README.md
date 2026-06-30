# Claude-docs

このディレクトリは、人間が壁打ち用にまとめたドキュメント [docs/](../docs/) とは別に、Claude Code の実装時に参照するドキュメントを管理するためのものである。

## 作成背景

Claude Code は実装前にドキュメントを推奨した上で実装を行うが、人間が壁打ちようにまとめたドキュメントは、プロジェクト固有の内容以外に、一般的な技術解説や調査内容等のノイズも含まれており、実装とは直接的に関係のない情報が Claude のコンテキストを圧迫してしまう可能性がある。

そこで、Claude Code の実装に必要なドキュメントだけをこのディレクトリにまとめることで、実装に必要な情報だけを Claude に提供し、効率的に実装を進めることができると考えた。

## ドキュメント作成のルール
 - [claude-document-rules.md](claude-document-rules.md) に従ってドキュメントを作成すること
    - このルールは [nishimura/claude-document-rules.md](https://gist.github.com/nishimura/41458a97a7e8d57fb8e99c136951186e) から引用している。