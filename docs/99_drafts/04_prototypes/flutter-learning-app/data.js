// Sample data for the Flutter learning app prototype.
// Exposes COURSES, LESSONS, FILE_TREE, SAMPLE_CHAT to window.

const COURSES = [
  { id: "flutter-basics", name: "Flutter 基礎", lang: "Flutter", lessons: 12 },
  { id: "dart-language", name: "Dart 言語入門", lang: "Dart", lessons: 8 },
];

const LESSONS = [
  {
    id: 1, num: "001", lang: "Flutter", diff: "beginner",
    title: "Hello World",
    desc: "最初のFlutterアプリを動かす。runAppとMaterialAppの基本構造を学ぶ。",
    state: "published", updated: "2026-05-25",
    goal: "Flutterアプリの骨組みを理解し、画面に文字を表示できるようになる。",
    body: `# Hello World

最初のFlutterアプリを動かしてみましょう。すべてのFlutterアプリは \`runApp()\` という関数から始まります。

## ステップ

このレッスンでは以下を学びます。

- \`MaterialApp\` で画面の枠組みを作る
- \`Scaffold\` で標準的なレイアウトを用意する
- \`Text\` ウィジェットで文字を表示する

## やってみよう

右のエディタを見てください。すでにテンプレートコードが用意されています。
\`Text\` の中身を **"こんにちは、世界！"** に書き換えて、画面上部の **ビルド** ボタンを押してみましょう。

> **ヒント**: ビルドにはおよそ2〜3秒かかります。完了するとプレビューに反映されます。

エラーが出たら、左の **LLM** タブから気軽に質問できます。`,
    code: `import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Hello World',
      home: Scaffold(
        appBar: AppBar(
          title: const Text('My First App'),
        ),
        body: const Center(
          child: Text(
            'Hello, World!',
            style: TextStyle(fontSize: 24),
          ),
        ),
      ),
    );
  }
}
`,
    answer: `import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: const Text('Hello')),
        body: const Center(child: Text('こんにちは、世界！', style: TextStyle(fontSize: 24))),
      ),
    );
  }
}
`,
    codeFiles: [
      {
        name: "lib/main.dart",
        content: `import 'package:flutter/material.dart';
import 'home_page.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: 'Hello World',
      home: HomePage(),
    );
  }
}
`,
      },
      {
        name: "lib/home_page.dart",
        content: `import 'package:flutter/material.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My First App')),
      body: const Center(
        child: Text('Hello, World!', style: TextStyle(fontSize: 24)),
      ),
    );
  }
}
`,
      },
    ],
    answerFiles: [
      {
        name: "lib/main.dart",
        content: `import 'package:flutter/material.dart';
import 'home_page.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(home: HomePage());
  }
}
`,
      },
      {
        name: "lib/home_page.dart",
        content: `import 'package:flutter/material.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Hello')),
      body: const Center(
        child: Text('こんにちは、世界！', style: TextStyle(fontSize: 24)),
      ),
    );
  }
}
`,
      },
    ],
  },
  {
    id: 2, num: "002", lang: "Flutter", diff: "beginner",
    title: "Widget 基礎",
    desc: "Container, Row, Column を組み合わせてレイアウトを作る方法を学ぶ。",
    state: "published", updated: "2026-05-20",
    goal: "Flutterのレイアウトウィジェットの組み合わせを理解する。",
    body: `# Widget 基礎

Flutterの世界では「すべてがWidget」です。文字も、ボタンも、レイアウトも、全部Widget。

## レイアウトの3兄弟

| Widget | 役割 |
|---|---|
| \`Container\` | 1つの子を装飾・配置する箱 |
| \`Row\` | 子を横方向に並べる |
| \`Column\` | 子を縦方向に並べる |

\`\`\`dart
Column(
  children: [
    Text('上'),
    Text('下'),
  ],
)
\`\`\`

## やってみよう

右のコードに \`Row\` を追加して、3つのアイコンを横並びにしてみましょう。`,
    code: `import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              Icon(Icons.star, size: 48),
              Text('Widget基礎'),
            ],
          ),
        ),
      ),
    );
  }
}
`,
    answer: `import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        body: Center(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              Icon(Icons.star, size: 48),
              Icon(Icons.favorite, size: 48),
              Icon(Icons.thumb_up, size: 48),
            ],
          ),
        ),
      ),
    );
  }
}
`,
  },
  {
    id: 3, num: "003", lang: "Flutter", diff: "intermediate",
    title: "状態管理 (setState)",
    desc: "StatefulWidget と setState を使って画面を更新する。",
    state: "published", updated: "2026-05-15",
    goal: "状態を持つUIを作り、ユーザー操作で画面を更新できる。",
    body: `# 状態管理 (setState)

カウンターアプリを通して **状態 (State)** を理解しましょう。

## StatefulWidget の流れ

1. \`StatefulWidget\` を継承する
2. \`createState()\` で \`State\` を返す
3. \`State\` の中で値を持ち、\`setState()\` で更新する

\`setState\` を呼ぶたびに Flutter は \`build\` を再実行し、画面に反映します。

## やってみよう

右のコードがすでにカウンターアプリになっています。**ビルド** を押して、右下の **+** ボタンを連打してみましょう。

> **チャレンジ**: マイナスボタンも追加してみてください。`,
    code: `import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) =>
      MaterialApp(home: const CounterPage());
}

class CounterPage extends StatefulWidget {
  const CounterPage({super.key});
  @override
  State<CounterPage> createState() => _CounterPageState();
}

class _CounterPageState extends State<CounterPage> {
  int _count = 0;

  void _increment() {
    setState(() {
      _count++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Counter')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('You have pushed the button this many times:'),
            Text('$_count',
              style: Theme.of(context).textTheme.headlineMedium),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _increment,
        child: const Icon(Icons.add),
      ),
    );
  }
}
`,
    answer: `import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) =>
      MaterialApp(home: const CounterPage());
}

class CounterPage extends StatefulWidget {
  const CounterPage({super.key});
  @override
  State<CounterPage> createState() => _CounterPageState();
}

class _CounterPageState extends State<CounterPage> {
  int _count = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Counter')),
      body: Center(
        child: Text('$_count',
            style: Theme.of(context).textTheme.headlineMedium),
      ),
      floatingActionButton: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          // マイナスボタンを追加
          FloatingActionButton(
            onPressed: () => setState(() => _count--),
            child: const Icon(Icons.remove),
          ),
          const SizedBox(width: 12),
          FloatingActionButton(
            onPressed: () => setState(() => _count++),
            child: const Icon(Icons.add),
          ),
        ],
      ),
    );
  }
}
`,
  },
  {
    id: 4, num: "004", lang: "Flutter", diff: "intermediate",
    title: "ListView と スクロール",
    desc: "ListView.builder で動的なリストを表示する。",
    state: "published", updated: "2026-05-12",
    goal: "大量データを効率的に表示できる ListView を使いこなす。",
    body: "# ListView と スクロール\n\nListView.builder を使って動的なリストを表示します。",
    code: "import 'package:flutter/material.dart';\n\nvoid main() => runApp(const MyApp());\n",
  },
  {
    id: 5, num: "005", lang: "Flutter", diff: "intermediate",
    title: "ナビゲーション",
    desc: "Navigator.push で画面遷移を実装する。引数の受け渡しも。",
    state: "published", updated: "2026-05-08",
  },
  {
    id: 6, num: "006", lang: "Flutter", diff: "advanced",
    title: "Provider で状態管理",
    desc: "アプリ全体の状態を Provider で管理するパターン。",
    state: "published", updated: "2026-05-01",
  },
  {
    id: 7, num: "007", lang: "Flutter", diff: "advanced",
    title: "HTTP通信とFutureBuilder",
    desc: "REST APIを叩いて、非同期にデータを表示する。",
    state: "draft", updated: "2026-05-23",
  },
  {
    id: 8, num: "008", lang: "Flutter", diff: "advanced",
    title: "アニメーション入門",
    desc: "AnimationController を使った滑らかな動きの作り方。",
    state: "draft", updated: "2026-05-24",
  },
  {
    id: 9, num: "009", lang: "Dart", diff: "beginner",
    title: "変数と型",
    desc: "var, final, const の違いと、Dartの基本的な型を学ぶ。",
    state: "published", updated: "2026-04-20",
  },
  {
    id: 10, num: "010", lang: "Dart", diff: "beginner",
    title: "関数とクロージャ",
    desc: "Dartの関数の書き方、無名関数、矢印関数、クロージャ。",
    state: "draft", updated: "2026-05-22",
  },
];

const FILE_TREE = [
  { type: "folder", name: "lib", level: 0, open: true, children: [
    { type: "file", name: "main.dart", ext: "dart", level: 1, active: true },
    { type: "folder", name: "widgets", level: 1, open: false },
  ]},
  { type: "folder", name: "test", level: 0, open: false },
  { type: "file", name: "pubspec.yaml", ext: "yaml", level: 0 },
  { type: "file", name: "README.md", ext: "md", level: 0 },
  { type: "file", name: "analysis_options.yaml", ext: "yaml", level: 0 },
];

const SAMPLE_CHAT = [
  {
    role: "assistant",
    text: "こんにちは！このレッスンでわからないことがあれば、何でも聞いてください。現在開いている `main.dart` の内容を見ながらお答えします。"
  },
  {
    role: "user",
    text: "setState ってなんで必要なんですか？ 変数を書き換えるだけじゃダメなんですか？"
  },
  {
    role: "assistant",
    text: `いい質問です！

変数を書き換えるだけだと、Flutter は「画面を更新するタイミング」がわからないんです。

\`setState()\` を呼ぶことで、Flutter に「この State が変わったから、もう一度 \`build\` を呼んでね」と伝えています。

\`\`\`dart
void _increment() {
  setState(() {
    _count++;        // ← この中で値を変える
  });
}
\`\`\`

逆に言うと、setState の **外** で値を変えても画面は更新されません。試してみると感覚がつかめますよ。`
  },
  {
    role: "user",
    text: "なるほど！ じゃあ build の中で setState 呼んだらどうなるんですか？"
  },
  {
    role: "assistant",
    text: "鋭い…！それは **無限ループ** になります 😅 build が走る → setState で再 build → また setState → ... となるので、Flutter が「setState() called during build」というエラーを出します。状態を変えるのは必ずユーザー操作のあと (`onPressed` など) にしましょう。"
  },
];

window.COURSES = COURSES;
window.LESSONS = LESSONS;
window.FILE_TREE = FILE_TREE;
window.SAMPLE_CHAT = SAMPLE_CHAT;

// Static content for the non-main project files (shown in editor tabs).
// `lib/main.dart` is intentionally absent — its content is the editable lesson code.
const FILE_CONTENTS = {
  "pubspec.yaml": `name: flutter_lesson
description: 学習用の Flutter プロジェクト
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.4.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
`,
  "README.md": `# flutter_lesson

学習用の Flutter アプリプロジェクトです。

## はじめかた

1. \`lib/main.dart\` を開いてコードを編集します。
2. 上部の **ビルド** ボタンを押すと、右下のプレビューに反映されます。
3. わからないことは **LLM** タブで質問できます。

## 参考リンク

- Flutter ドキュメント: https://docs.flutter.dev/
- Dart 言語ツアー: https://dart.dev/language
`,
  "analysis_options.yaml": `include: package:flutter_lints/flutter.yaml

linter:
  rules:
    prefer_const_constructors: true
    avoid_print: false
`,
};

window.FILE_CONTENTS = FILE_CONTENTS;
