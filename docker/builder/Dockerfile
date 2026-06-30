# Flutter SDK を含むビルド実行環境。
# バックエンドから HTTP 経由でビルド要求を受け付け、Flutter Web ビルドを実行する。
# Alpine は Flutter 非対応のため Ubuntu を使用する。

FROM ubuntu:22.04 AS base

# 使用する Flutter バージョン。安定版リリースに合わせて更新する。
ARG FLUTTER_VERSION=3.27.4

ENV DEBIAN_FRONTEND=noninteractive
ENV FLUTTER_HOME=/opt/flutter
ENV PATH="${FLUTTER_HOME}/bin:${PATH}"

# Flutter Web ビルドに必要なシステムパッケージ
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    unzip \
    xz-utils \
    zip \
 && rm -rf /var/lib/apt/lists/*

# ビルド実行用の非 root ユーザーを作成
RUN groupadd --gid 1001 builder \
 && useradd --uid 1001 --gid 1001 --create-home --shell /bin/sh builder

# Flutter SDK をインストールし、builder ユーザーに所有権を付与
RUN curl -fsSL \
    "https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_${FLUTTER_VERSION}-stable.tar.xz" \
    -o /tmp/flutter.tar.xz \
 && tar -xf /tmp/flutter.tar.xz -C /opt \
 && rm /tmp/flutter.tar.xz \
 && chown -R builder:builder "${FLUTTER_HOME}"

# ワークスペースと成果物ディレクトリを作成
# build_workspaces は /workspace に、build_artifacts は /artifacts にマウントされる
RUN mkdir -p /workspace /artifacts \
 && chown builder:builder /workspace /artifacts

USER builder

ENV PUB_CACHE=/home/builder/.pub-cache

# Flutter Web を有効化し、テレメトリを無効化してキャッシュをウォームアップ
RUN flutter config --enable-web --no-analytics \
 && flutter precache --web \
 && flutter --version

# ビルドリクエストを受け付ける HTTP サーバーのポート（実装は別途）
EXPOSE 5000

# ビルドリクエストを受け付ける HTTP サーバーは別途実装予定。
# 実装が完了するまでコンテナを維持するためのプレースホルダー。
CMD ["tail", "-f", "/dev/null"]
