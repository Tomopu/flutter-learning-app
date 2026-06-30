# Claude向けドキュメント作成ルール

このドキュメントは、プロジェクトのドキュメントを作成・更新する際の**絶対的なルール**です。

## 【最重要】Claudeが理解しやすい形式で書く

## ドキュメントの目的

```javascript
// ドキュメントの判断基準
if (情報.isプロジェクト固有) {
    return "書く";
} else if (情報.is一般的な知識) {
    return "書かない";  // Claudeは既に知っている
} else if (情報.is架空の例) {
    return "絶対に書かない";  // 混乱の元
}
```

## 書くべきもの（必須）

### 1. プロジェクト固有のルール・制約
```markdown
✅ 良い例：
- Google Closure Tools を使用（Webpack/Viteではない）
- サーバーレスポンスは必ず obj['property'] でアクセス
- グローバル関数は window['functionName'] = func; で登録
```

### 2. 実際のコードから抽出したパターン
```markdown
✅ 良い例：
// ec.alert.js:49-65 より
function alert(msg, opt_callback) {
    var dialog = getInstance();
    dialog.setTextContent(msg);
    dialog.setButtonSet(BUTTON_OK);
    // ...
}
```

### 3. 歴史的経緯による例外・混在
```markdown
✅ 良い例：
- ビジネスロジック層が3世代混在
  - src/Model/: 最古・現在も多用
  - 旧DDD: 保守のみ、新規追加禁止
  - src/Ddd/: 最新・新規追加可
```

### 4. よくある間違いと正しいパターン
```markdown
✅ 良い例：
❌ 間違い: window.myFunction = func;
✅ 正しい: window['myFunction'] = func;
理由: ADVANCED_OPTIMIZATIONSで名前が変更される

✅ 良い例：
element.className = 'button-primary';  // ❌ NG：本番で動かない
理由: CSSクラス名も短縮されるため goog.getCssName() 必須
```

**重要**: プロジェクト固有の制約により「一般的には正しいが、このプロジェクトでは間違い」となるパターンは、必ず以下を含めること：
1. ❌ マークと「NG」「動かない」等の明確な警告
2. なぜダメなのかの理由（例：「本番で動かない」「ADVANCED_OPTIMIZATIONSで破壊される」）
3. ✅ 正しいパターンとの対比

## 書いてはいけないもの（禁止）

### 1. 一般的なプログラミング知識
```markdown
❌ 悪い例：
- JSDocの基本的な書き方
- JavaScriptの基本文法
- 一般的なデザインパターンの説明
```

### 2. 架空の例示コード
```markdown
❌ 悪い例：
function createUser(name, age, isActive) {  // 実在しない関数
    return {name: name, age: age};
}
```

### 3. プロジェクトで使われていないパターン
```markdown
❌ 悪い例：
@typedef {{id: number}} User  // プロジェクトでtypedefは未使用
```

### 4. Claudeへの一般的な説明
```markdown
❌ 悪い例：
「これはMVCパターンの一種で...」  // 不要な説明
```

## ドキュメント作成時の必須手順

### Step 1: 実コード確認
```bash
# 書こうとしている内容が実在するか確認
grep -r "パターン名" js/
grep -r "メソッド名" src/

# 実際の使用箇所を特定
# ファイル名:行番号 を必ず記録
```

### Step 2: 記述形式
```markdown
## 機能名/パターン名

### 実装場所
- `js/ec/alert.js:49-65` - alert関数の実装
- `js/admin/condition/parts/checkcaution.js:110` - ブラケット記法の使用例

### プロジェクト固有のルール
1. 必ず XhrIo を使用（fetch/jQuery禁止）
2. サーバーデータは obj['key'] でアクセス

### 実装例（実コードより）
\```javascript
// admin/condition/requestxhr.js:34-40 より
var product = data['product'];
product['order'] = order;        // サーバーデータ
product.onlyAccessory = true;    // JS内部追加
\```
```

### Step 3: 検証チェックリスト
- [ ] すべての例は実在するコードから抽出したか？
- [ ] ファイル名:行番号 を含めているか？
- [ ] 一般的な知識を説明していないか？
- [ ] プロジェクト固有の情報のみか？

## ドキュメント更新時のルール

### 即座に更新すべき場合
```javascript
if (実装とドキュメントに乖離を発見) {
    return "即座に修正";
} else if (新機能を実装) {
    return "関連ドキュメントも更新";
} else if (実装パターンが変更) {
    return "影響するすべてのドキュメントを更新";
}
```

### 更新時の記録
```markdown
## 更新履歴
- 2024-XX-XX: [ファイル名] の実装変更に伴い修正
- 2024-XX-XX: [機能名] の追加に伴い新規セクション追加
```

## 品質基準

### 良いドキュメントの特徴
1. **具体的**: ファイル名:行番号 が明記されている
2. **実在**: すべての例が実際のコードに存在する
3. **固有**: プロジェクト特有の情報のみ
4. **実用的**: 実装時に直接参考にできる

### 悪いドキュメントの特徴
1. **抽象的**: 一般論や理論の説明
2. **架空**: 実在しない例やパターン
3. **冗長**: Claudeが既に知っている情報
4. **古い**: 実装と乖離している

## このルールの適用範囲

### 適用すべきドキュメント
- `claude-docs/` 以下のすべての技術ドキュメント
- `CLAUDE.md` の技術セクション
- 実装ガイド・パターン集

### 適用外
- README.md（人間向け）
- コミットメッセージ
- コード内コメント（最小限に）

## 最終確認

ドキュメント作成後、以下を自問自答：

1. **このドキュメントがなかったら、Claudeは正しく実装できないか？**
   - Yes → 必要なドキュメント
   - No → 不要な可能性

2. **一般的なWeb開発の知識で解決できるか？**
   - Yes → 削除すべき
   - No → プロジェクト固有なので残す

3. **1年後の新規Claudeが読んで、すぐに実装できるか？**
   - Yes → 良いドキュメント
   - No → 改善が必要