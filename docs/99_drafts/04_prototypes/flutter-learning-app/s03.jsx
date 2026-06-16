// S03 — Admin画面
// Two sub-views: list (with bulk ops) + edit (tabbed editor with preview).

const { useState: useS, useMemo: useM, useEffect: useE } = React;

const STATE_LABELS = { draft: "下書き", published: "公開中" };
const DIFF_LABEL = { beginner: "入門", intermediate: "中級", advanced: "上級" };

const formatDate = (s) => s ? s.replace(/^2026-/, "") : "";

// Shared Monaco editor + path helpers (exported from s02.jsx)
const AdminMonaco = window.MonacoEditor;
const adminLangForPath = window.langForPath || ((p) => "plaintext");
const adminExtForPath = window.EXT_BY_PATH || ((p) => "file");
const AdminFileIcon = window.FileTypeIcon || (() => null);

// Build an editable file list from either a files array or a single string.
function deriveFiles(filesArr, single, defaultName) {
  if (Array.isArray(filesArr) && filesArr.length) {
    return filesArr.map((f) => ({ name: f.name, content: f.content }));
  }
  return [{ name: defaultName, content: single || "" }];
}
// Pick the representative file (main.dart, else first) for S02 compatibility.
function primaryContent(files) {
  if (!files || !files.length) return "";
  const main = files.find((f) => /main\.dart$/.test(f.name));
  return (main || files[0]).content;
}

// Multi-file code editor: file list (add/rename/delete) + Monaco for the active file.
function CodeFilesEditor({ files, onChange, emptyHint }) {
  const [active, setActive] = useS(0);
  const idx = Math.min(active, files.length - 1);
  const cur = files[idx];

  const addFile = () => {
    const base = "untitled";
    let n = 1, name;
    do { name = `lib/${base}${n === 1 ? "" : n}.dart`; n++; }
    while (files.some((f) => f.name === name));
    onChange([...files, { name, content: "" }]);
    setActive(files.length);
  };
  const delFile = (i) => {
    const next = files.filter((_, j) => j !== i);
    onChange(next.length ? next : [{ name: "lib/main.dart", content: "" }]);
    setActive((a) => (a >= i && a > 0 ? a - 1 : a));
  };
  const rename = (i, name) => onChange(files.map((f, j) => j === i ? { ...f, name } : f));
  const setContent = (i, content) => onChange(files.map((f, j) => j === i ? { ...f, content } : f));

  return (
    <div className="cfe dark-zone">
      <div className="cfe-list">
        <div className="cfe-list-head">ファイル</div>
        {files.map((f, i) => {
          const ext = adminExtForPath(f.name);
          return (
            <div
              key={i}
              className={"cfe-item" + (i === idx ? " active" : "")}
              onClick={() => setActive(i)}
            >
              <span className={"ft-icon ft-icon-" + ext}>
                <AdminFileIcon ext={ext} isFolder={false} />
              </span>
              <span className="cfe-item-name">{f.name.split("/").pop()}</span>
              {files.length > 1 && (
                <button
                  className="cfe-del"
                  title="ファイルを削除"
                  onClick={(e) => { e.stopPropagation(); delFile(i); }}
                >
                  <Icon name="x" />
                </button>
              )}
            </div>
          );
        })}
        <button className="cfe-add" onClick={addFile}>
          <Icon name="plus" />
          ファイルを追加
        </button>
      </div>
      <div className="cfe-main">
        <div className="cfe-bar">
          <span className={"ft-icon ft-icon-" + adminExtForPath(cur.name)}>
            <AdminFileIcon ext={adminExtForPath(cur.name)} isFolder={false} />
          </span>
          <input
            className="cfe-path"
            value={cur.name}
            spellCheck={false}
            onChange={(e) => rename(idx, e.target.value)}
            title="ファイルパス（例: lib/main.dart）"
          />
        </div>
        <div className="cfe-monaco">
          <AdminMonaco
            key={idx}
            value={cur.content}
            onChange={(c) => setContent(idx, c)}
            language={adminLangForPath(cur.name)}
          />
        </div>
      </div>
    </div>
  );
}

// ============ LIST VIEW ============
const AdminList = ({ items, setItems, onEdit, onNew }) => {
  const [stateF, setStateF] = useS("すべて");
  const [langF, setLangF] = useS("すべて");
  const [sort, setSort] = useS({ col: "updated", dir: "desc" });
  const [selected, setSelected] = useS(new Set());
  const [bulkAction, setBulkAction] = useS("publish");
  const [dialog, setDialog] = useS(null); // { kind, ids, target?, danger? }

  const allLangs = ["すべて", ...Array.from(new Set(items.map((l) => l.lang)))];
  const filtered = items.
  filter((l) => stateF === "すべて" || l.state === stateF).
  filter((l) => langF === "すべて" || l.lang === langF).
  sort((a, b) => {
    const dir = sort.dir === "asc" ? 1 : -1;
    if (sort.col === "lang") return a.lang.localeCompare(b.lang) * dir;
    if (sort.col === "updated") return (a.updated || "").localeCompare(b.updated || "") * dir;
    if (sort.col === "title") return a.title.localeCompare(b.title) * dir;
    if (sort.col === "num") return a.num.localeCompare(b.num) * dir;
    return 0;
  });

  const allVisibleSelected = filtered.length > 0 && filtered.every((l) => selected.has(l.id));
  const someSelected = !allVisibleSelected && filtered.some((l) => selected.has(l.id));

  const toggleAll = () => {
    if (allVisibleSelected) {
      const next = new Set(selected);
      filtered.forEach((l) => next.delete(l.id));
      setSelected(next);
    } else {
      setSelected(new Set([...selected, ...filtered.map((l) => l.id)]));
    }
  };
  const toggleOne = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const toggleSort = (col) => {
    setSort((p) => p.col === col ? { col, dir: p.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" });
  };
  const sortInd = (col) => sort.col === col ? <span className="sort-ind">{sort.dir === "asc" ? "▲" : "▼"}</span> : null;

  const performBulk = () => {
    const ids = Array.from(selected);
    setItems((curr) =>
    curr.map((l) => {
      if (!ids.includes(l.id)) return l;
      if (bulkAction === "publish") return { ...l, state: "published", updated: "2026-05-26" };
      if (bulkAction === "unpublish") return { ...l, state: "draft", updated: "2026-05-26" };
      return l;
    }).
    filter((l) => bulkAction !== "delete" || !ids.includes(l.id))
    );
    setSelected(new Set());
    setDialog(null);
  };

  const askBulk = () => {
    setDialog({ kind: "bulk", ids: Array.from(selected), action: bulkAction });
  };

  const performIndividual = () => {
    const { id, action } = dialog;
    setItems((curr) => curr.map((l) => {
      if (l.id !== id) return l;
      if (action === "publish") return { ...l, state: "published", updated: "2026-05-26" };
      if (action === "unpublish") return { ...l, state: "draft", updated: "2026-05-26" };
      return l;
    }));
    setDialog(null);
  };

  const selCount = selected.size;
  const bulkLabels = {
    publish: "承認して公開",
    unpublish: "非公開にする",
    delete: "削除する"
  };

  return (
    <div className="page-s03" data-screen-label="S03 Admin 教材一覧">
      <div className="app-header" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="crumb">
          <span style={{ color: "var(--fg-3)", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase" }}>Admin</span>
          <span className="sep">/</span>
          <span className="current">教材管理</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn primary" onClick={onNew}>
            <Icon name="plus" />
            教材を追加
          </button>
        </div>
      </div>

      <div className="toolbar">
        <span className="label">状態:</span>
        <div className="chip-row">
          {["すべて", "draft", "published"].map((s) =>
          <button
            key={s}
            className={"chip" + (stateF === s ? " active" : "")}
            onClick={() => setStateF(s)}>
            
              {s === "すべて" ? "すべて" : STATE_LABELS[s]}
            </button>
          )}
        </div>
        <div style={{ width: 1, height: 22, background: "var(--border)" }} />
        <span className="label">言語:</span>
        <div className="chip-row">
          {allLangs.map((l) =>
          <button
            key={l}
            className={"chip" + (langF === l ? " active" : "")}
            onClick={() => setLangF(l)}>
            
              {l}
            </button>
          )}
        </div>
        <div style={{ marginLeft: "auto", color: "var(--fg-2)", fontSize: 12 }}>{filtered.length} 件</div>
      </div>

      {selCount > 0 &&
      <div className="toolbar bulk">
          <span className="label">
            <strong style={{ color: "var(--info)" }}>{selCount} 件</strong> 選択中
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="label">一括操作:</span>
            <select
            className="select"
            style={{ width: 180 }}
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}>
            
              <option value="publish">承認して公開</option>
              <option value="unpublish">非公開にする</option>
              <option value="delete">削除する</option>
            </select>
            <button
            className={"btn " + (bulkAction === "delete" ? "danger" : "primary")}
            onClick={askBulk}>
            
              実行
            </button>
          </div>
          <button
          className="btn ghost sm"
          style={{ marginLeft: "auto" }}
          onClick={() => setSelected(new Set())}>
          
            <Icon name="x" />
            選択解除
          </button>
        </div>
      }

      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th className="check" style={{ width: 40 }}>
                <input
                  type="checkbox"
                  className={"chk" + (someSelected ? " indeterminate" : "")}
                  checked={allVisibleSelected}
                  ref={(el) => {if (el) el.indeterminate = someSelected;}}
                  onChange={toggleAll} />
                
              </th>
              <th style={{ width: 100 }}>状態</th>
              <th className="sortable" onClick={() => toggleSort("title")}>タイトル {sortInd("title")}</th>
              <th className="sortable" style={{ width: 120 }} onClick={() => toggleSort("lang")}>言語 {sortInd("lang")}</th>
              <th style={{ width: 100 }}>難易度</th>
              <th className="sortable" style={{ width: 110 }} onClick={() => toggleSort("updated")}>更新日 {sortInd("updated")}</th>
              <th style={{ width: 200 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) =>
            <tr
              key={l.id}
              className={selected.has(l.id) ? "selected" : ""}>
              
                <td className="check">
                  <input
                  type="checkbox"
                  className="chk"
                  checked={selected.has(l.id)}
                  onChange={() => toggleOne(l.id)}
                  onClick={(e) => e.stopPropagation()} />
                
                </td>
                <td>
                  <span className={"badge state-" + l.state}>
                    <span className="dot" />
                    {STATE_LABELS[l.state]}
                  </span>
                </td>
                <td className="title" style={{ fontSize: "12px" }}>
                  <span style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono)", fontSize: 12, marginRight: 8 }}>
                    #{l.num}
                  </span>
                  {l.title}
                </td>
                <td><span className="badge lang">{l.lang}</span></td>
                <td>
                  <span className={"badge diff-" + l.diff}>
                    <span className="dot" />
                    {DIFF_LABEL[l.diff]}
                  </span>
                </td>
                <td style={{ color: "var(--fg-2)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                  {formatDate(l.updated)}
                </td>
                <td className="actions">
                  <button className="btn sm ghost" onClick={(e) => {e.stopPropagation();onEdit(l.id);}}>
                    <Icon name="edit" />
                    編集
                  </button>
                  {l.state === "draft" ?
                <button
                  className="btn sm primary"
                  style={{ marginLeft: 4, minWidth: 76, justifyContent: "center" }}
                  onClick={(e) => {e.stopPropagation();setDialog({ kind: "individual", id: l.id, action: "publish", title: l.title });}}>
                  
                      <Icon name="check" />
                      承認
                    </button> :

                <button
                  className="btn sm"
                  style={{ marginLeft: 4, minWidth: 76, justifyContent: "center" }}
                  onClick={(e) => {e.stopPropagation();setDialog({ kind: "individual", id: l.id, action: "unpublish", title: l.title });}}>
                  
                      非公開
                    </button>
                }
                </td>
              </tr>
            )}
            {filtered.length === 0 &&
            <tr>
                <td colSpan={7} className="empty">条件に一致する教材がありません。</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      {/* Confirmation dialogs */}
      {dialog?.kind === "bulk" &&
      <Dialog
        open
        danger={dialog.action === "delete"}
        title={
        dialog.action === "publish" ? `${dialog.ids.length} 件を公開しますか？` :
        dialog.action === "unpublish" ? `${dialog.ids.length} 件を非公開にしますか？` :
        `${dialog.ids.length} 件を削除しますか？`
        }
        body={
        dialog.action === "delete" ?
        <span>この操作は<strong style={{ color: "var(--error)" }}>取り消せません</strong>。本当に <strong>{dialog.ids.length} 件</strong> の教材を削除しますか？</span> :
        <span>選択した <strong>{dialog.ids.length} 件</strong> の教材を一括で「{bulkLabels[dialog.action]}」します。</span>
        }
        confirmLabel={dialog.action === "delete" ? "削除する" : "実行する"}
        onCancel={() => setDialog(null)}
        onConfirm={performBulk} />

      }
      {dialog?.kind === "individual" &&
      <Dialog
        open
        title={dialog.action === "publish" ? "公開しますか？" : "非公開にしますか？"}
        body={
        <span>
              「<strong>{dialog.title}</strong>」を
              {dialog.action === "publish" ? " 公開状態にします。" : " 下書き状態に戻します。"}
            </span>
        }
        confirmLabel={dialog.action === "publish" ? "公開する" : "非公開にする"}
        onCancel={() => setDialog(null)}
        onConfirm={performIndividual} />

      }
    </div>);

};

// ============ EDIT VIEW ============
const AdminEdit = ({ lesson, onBack, onSave }) => {
  const [draft, setDraft] = useS(() => ({
    title: lesson.title || "",
    lang: lesson.lang || "Flutter",
    diff: lesson.diff || "beginner",
    desc: lesson.desc || "",
    goal: lesson.goal || "",
    body: lesson.body || "",
    codeFiles: deriveFiles(lesson.codeFiles, lesson.code, "lib/main.dart"),
    answerFiles: deriveFiles(lesson.answerFiles, lesson.answer, "lib/main.dart"),
    state: lesson.state || "draft"
  }));
  const [tab, setTab] = useS("body"); // body | code | answer
  const [previewMode, setPreviewMode] = useS(false);
  const [confirmPublish, setConfirmPublish] = useS(false);
  const isNew = !lesson.id;

  // Sync the multi-file arrays back into code/answer for S02 compatibility on save.
  const buildPayload = (state) => ({
    ...draft,
    state,
    code: primaryContent(draft.codeFiles),
    answer: primaryContent(draft.answerFiles),
  });

  const langs = ["Flutter", "Dart", "JavaScript", "Python", "TypeScript"];
  const diffs = [
  { v: "beginner", label: "入門" },
  { v: "intermediate", label: "中級" },
  { v: "advanced", label: "上級" }];


  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div className="page-s03" data-screen-label={"S03 Admin 編集"}>
      <div className="app-header">
        <div className="crumb">
          <span style={{ color: "var(--fg-3)", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase" }}>Admin</span>
          <span className="sep">/</span>
          <a onClick={onBack}>教材管理</a>
          <span className="sep">/</span>
          <span className="current">{isNew ? "新規教材" : `Lesson ${lesson.num} ${draft.title || ""}`}</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn ghost sm" onClick={onBack}>
            <Icon name="arrowL" />
            一覧へ戻る
          </button>
          <button className="btn" onClick={() => onSave(buildPayload("draft"))}>
            <Icon name="save" />
            下書き保存
          </button>
          <button className="btn primary" onClick={() => setConfirmPublish(true)}>
            <Icon name="check" />
            承認して公開する
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="admin-meta">
        <div className="admin-meta-grid">
          <div className="field full">
            <label className="field-label">タイトル</label>
            <input
              className="input"
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="例: Hello World" />
            
          </div>
          <div className="field">
            <label className="field-label">言語</label>
            <select
              className="select"
              value={draft.lang}
              onChange={(e) => set("lang", e.target.value)}>
              
              {langs.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">難易度</label>
            <select
              className="select"
              value={draft.diff}
              onChange={(e) => set("diff", e.target.value)}>
              
              {diffs.map((d) => <option key={d.v} value={d.v}>{d.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">現在の状態</label>
            <div style={{ display: "flex", alignItems: "center", height: 32 }}>
              <span className={"badge state-" + draft.state}>
                <span className="dot" />
                {STATE_LABELS[draft.state]}
              </span>
            </div>
          </div>
          <div className="field full">
            <label className="field-label">説明（概要）</label>
            <input
              className="input"
              value={draft.desc}
              onChange={(e) => set("desc", e.target.value)}
              placeholder="一覧画面に表示される短い説明" />
            
          </div>
          <div className="field full">
            <label className="field-label">学習目標</label>
            <input
              className="input"
              value={draft.goal}
              onChange={(e) => set("goal", e.target.value)}
              placeholder="このレッスンを終えると何ができるようになるか" />
            
          </div>
        </div>
      </div>

      {/* Editor tabs + content */}
      <div className="admin-edit-body">
        <div className="tabs">
          <button className={"tab" + (tab === "body" ? " active" : "")} onClick={() => setTab("body")}>
            <Icon name="book" />
            教材本文
          </button>
          <button className={"tab" + (tab === "code" ? " active" : "")} onClick={() => setTab("code")}>
            <Icon name="code" />
            初期コード
          </button>
          <button className={"tab" + (tab === "answer" ? " active" : "")} onClick={() => setTab("answer")}>
            <Icon name="check" />
            模範解答
          </button>
          <div className="tab-spacer" />
          {tab === "body" && (
            <div style={{ display: "flex", alignItems: "center", padding: "0 12px", gap: 8, flexShrink: 0 }}>
              <span style={{ fontSize: 12, color: "var(--fg-2)", whiteSpace: "nowrap" }}>表示:</span>
              <div className="toggle-pair">
                <button
                  className={!previewMode ? "active" : ""}
                  onClick={() => setPreviewMode(false)}>
                  
                  編集
                </button>
                <button
                  className={previewMode ? "active" : ""}
                  onClick={() => setPreviewMode(true)}>
                  
                  <Icon name="eye" /> プレビュー
                </button>
              </div>
            </div>
          )}
          {tab !== "body" && (
            <div style={{ padding: "0 12px", fontSize: 12, color: "var(--fg-2)", whiteSpace: "nowrap", flexShrink: 0 }}>
              {tab === "code"
                ? `初期ファイル ${draft.codeFiles.length} 件`
                : `解答ファイル ${draft.answerFiles.length} 件`}
            </div>
          )}
        </div>

        <div className="admin-edit-content">
          {tab === "body" ? (
            !previewMode ? (
              <textarea
                className="edit-textarea"
                value={draft.body}
                onChange={(e) => set("body", e.target.value)}
                placeholder={"# 見出し\n\nMarkdown 形式で教材本文を書きます。"}
                spellCheck={false}
              />
            ) : (
              <div className="preview-pane">
                <div className="md" dangerouslySetInnerHTML={{ __html: renderMarkdown(draft.body) }} />
              </div>
            )
          ) : tab === "code" ? (
            <CodeFilesEditor
              files={draft.codeFiles}
              onChange={(f) => set("codeFiles", f)}
            />
          ) : (
            <CodeFilesEditor
              files={draft.answerFiles}
              onChange={(f) => set("answerFiles", f)}
            />
          )}
        </div>
      </div>

      <Dialog
        open={confirmPublish}
        title="公開しますか？"
        body={
        <span>
            「<strong>{draft.title || "（無題）"}</strong>」を保存し、状態を <strong>公開中</strong> に変更します。学習者の一覧画面に表示されるようになります。
          </span>
        }
        confirmLabel="承認して公開"
        onCancel={() => setConfirmPublish(false)}
        onConfirm={() => {
          onSave(buildPayload("published"));
          setConfirmPublish(false);
        }} />
      
    </div>);

};

window.AdminList = AdminList;
window.AdminEdit = AdminEdit;