// S02 — 学習メイン画面
// IDE-like dual-pane: left (材料/LLM), right (Monaco editor + preview/console/files).

const { useState, useEffect, useRef, useCallback } = React;

// ------- Console -------
const ConsolePanel = ({ lines, building }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines.length]);
  return (
    <div className="console" ref={ref}>
      {lines.map((l, i) =>
      <div key={i} className={"line " + (l.kind || "")}>
          <span className="ts">[{l.ts}]</span> {l.text}
        </div>
      )}
      {building &&
      <div className="line">
          <span className="prompt">$</span> <span className="spinner" /> building...
        </div>
      }
    </div>);

};

// ------- File Tree -------
const EXT_BY_PATH = (path) => {
  const m = /\.([a-z0-9]+)$/i.exec(path || "");
  return m ? m[1].toLowerCase() : "file";
};
const LANG_BY_EXT = { dart: "dart", yaml: "yaml", yml: "yaml", json: "json", md: "markdown" };
const langForPath = (path) => LANG_BY_EXT[EXT_BY_PATH(path)] || "plaintext";

const FILE_ICON_COLORS_DARK = {
  dart: "#54C5F8",
  yaml: "#d878b8",
  yml: "#d878b8",
  json: "#dcb86b",
  md: "#9aa0a6",
  folder: "#e0a458"
};

const FileTypeIcon = ({ ext, isFolder, isOpen }) => {
  if (isFolder) {
    return (
      <svg className="ft-svg folder" viewBox="0 0 16 16" aria-hidden="true">
        {isOpen ?
        <path d="M1.5 4.5h4l1.5 1.5h7.5v7.5h-13z M1.5 13.5l1.5-5h13l-1.5 5" /> :

        <path d="M1.5 4.5h4l1.5 1.5h7.5v7.5h-13z" />
        }
      </svg>);

  }
  return (
    <svg className={"ft-svg file ext-" + (ext || "file")} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 1.5h6l3.5 3.5v9h-9.5z" />
      <path className="fold" d="M9 1.5v3.5h3.5" />
    </svg>);

};

const FileTreeItem = ({ node, level = 0, openMap, setOpenMap, active, onSelect }) => {
  const path = node.path;
  const isOpen = node.type === "folder" ? !!openMap[path] : false;
  return (
    <>
      <div
        className={"ft-item lvl-" + Math.min(level, 2) + (active === path ? " active" : "")}
        onClick={() => {
          if (node.type === "folder") setOpenMap({ ...openMap, [path]: !isOpen });else
          onSelect(path);
        }}>
        
        <span className="ft-chev">
          {node.type === "folder" ? isOpen ? "▾" : "▸" : ""}
        </span>
        <span className={"ft-icon ft-icon-" + (node.type === "folder" ? "folder" : node.ext || "file")}>
          <FileTypeIcon
            ext={node.ext}
            isFolder={node.type === "folder"}
            isOpen={isOpen} />
          
        </span>
        <span>{node.name}</span>
      </div>
      {node.type === "folder" && isOpen && (node.children || []).map((c) =>
      <FileTreeItem
        key={c.path}
        node={c}
        level={level + 1}
        openMap={openMap}
        setOpenMap={setOpenMap}
        active={active}
        onSelect={onSelect} />

      )}
    </>);

};

const FileTree = ({ tree, active, onSelect }) => {
  const [openMap, setOpenMap] = useState({ "lib": true });
  return (
    <div className="file-tree">
      <div style={{ padding: "6px 12px", fontSize: 11, color: "var(--fg-3)", letterSpacing: ".08em", textTransform: "uppercase" }}>
        flutter_lesson
      </div>
      {tree.map((n) =>
      <FileTreeItem
        key={n.path}
        node={n}
        openMap={openMap}
        setOpenMap={setOpenMap}
        active={active}
        onSelect={onSelect} />

      )}
    </div>);

};

// stamp paths into the tree
function preparePaths(tree, parent = "") {
  return tree.map((n) => {
    const path = parent ? parent + "/" + n.name : n.name;
    return {
      ...n,
      path,
      children: n.children ? preparePaths(n.children, path) : undefined
    };
  });
}

// ------- Preview (mock Flutter counter app) -------
const FlutterPreview = ({ count, onTap, building, error }) => {
  if (building) {
    return (
      <div className="preview-host">
        <div style={{ textAlign: "center", color: "var(--fg-2)" }}>
          <span className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }} />
          <div style={{ marginTop: 12, fontSize: 13 }}>Flutter Web ビルド中...</div>
        </div>
      </div>);

  }
  if (error) {
    return (
      <div className="preview-host">
        <div style={{ textAlign: "center", color: "var(--error)", maxWidth: 360 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>ビルドエラー</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg-1)", background: "var(--bg-0)", padding: 12, borderRadius: 4, textAlign: "left" }}>
            {error}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--fg-2)" }}>左のLLMタブで質問できます。</div>
        </div>
      </div>);

  }
  return (
    <div className="preview-host">
      <div className="device">
        <div className="device-screen">
          <div className="dv-status">
            <span>9:41</span>
            <span>●●●●● 100%</span>
          </div>
          <div className="dv-appbar">Counter</div>
          <div className="dv-body">
            <div className="small">You have pushed the button this many times:</div>
            <div className="big">{count}</div>
          </div>
          <button className="dv-fab" onClick={onTap} title="+">＋</button>
        </div>
      </div>
    </div>);

};

// ------- Monaco editor mount -------
const MonacoEditor = ({ value, onChange, language = "dart" }) => {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let disposed = false;
    function init() {
      if (disposed || !window.monaco || !containerRef.current) return;
      // Define a darker theme close to our palette
      window.monaco.editor.defineTheme("flearn-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
        { token: "comment", foreground: "5e5e66", fontStyle: "italic" },
        { token: "keyword", foreground: "c586c0" },
        { token: "string", foreground: "ce9178" },
        { token: "number", foreground: "b5cea8" },
        { token: "type", foreground: "4ec9b0" },
        { token: "identifier", foreground: "9cdcfe" }],

        colors: {
          "editor.background": "#0f1318",
          "editor.foreground": "#e8edf3",
          "editorLineNumber.foreground": "#5b6573",
          "editorLineNumber.activeForeground": "#c4ccd6",
          "editor.selectionBackground": "#3ea8ff33",
          "editor.lineHighlightBackground": "#161b22",
          "editorCursor.foreground": "#3ea8ff",
          "editorIndentGuide.background": "#1f262f",
          "editorIndentGuide.activeBackground": "#2a323d"
        }
      });
      editorRef.current = window.monaco.editor.create(containerRef.current, {
        value,
        language,
        theme: "flearn-dark",
        fontFamily: "JetBrains Mono, Fira Code, monospace",
        fontSize: 13,
        lineHeight: 20,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        renderLineHighlight: "all",
        padding: { top: 12, bottom: 12 },
        automaticLayout: true,
        tabSize: 2
      });
      editorRef.current.onDidChangeModelContent(() => {
        const v = editorRef.current.getValue();
        if (onChangeRef.current) onChangeRef.current(v);
      });
    }

    if (window.monaco) init();else
    {
      // monaco loader script is included on the page; wait for it
      const handle = setInterval(() => {
        if (window.monaco) {
          clearInterval(handle);
          init();
        }
      }, 100);
      return () => {
        disposed = true;
        clearInterval(handle);
      };
    }

    return () => {
      disposed = true;
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
    // eslint-disable-next-line
  }, []);

  // Sync external value -> editor (e.g. when switching lesson / file tab)
  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== value) {
      editorRef.current.setValue(value || "");
    }
  }, [value]);

  // Sync language when switching file tabs
  useEffect(() => {
    if (editorRef.current && window.monaco) {
      const model = editorRef.current.getModel();
      if (model) window.monaco.editor.setModelLanguage(model, language);
    }
  }, [language]);

  return <div className="monaco-container" ref={containerRef} />;
};

// ------- LLM chat -------
const ChatPanel = ({ messages, lessonNum, fileName }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages]);
  return (
    <div className="chat">
      <div className="chat-msgs" ref={ref}>
        {messages.map((m, i) =>
        <div key={i} className={"chat-msg " + m.role}>
            <div className="av">{m.role === "user" ? "あ" : "AI"}</div>
            <div className="body">
              <div className="role">{m.role === "user" ? "あなた" : "Lesson Assistant"}</div>
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }} />
            </div>
          </div>
        )}
      </div>
      <div className="chat-input">
        <div className="chat-context">
          <span>送信時に同梱:</span>
          <span className="ctx-chip">lesson #{lessonNum}</span>
          <span className="ctx-chip">{fileName}</span>
          <span className="ctx-chip">console (12 lines)</span>
        </div>
        <div className="chat-input-row">
          <textarea
            placeholder="質問を入力... (Shift+Enter で改行、Enter で送信)"
            rows={1} />
          
          <button className="btn primary icon" title="送信">
            <Icon name="send" />
          </button>
        </div>
      </div>
    </div>);

};

// ------- Resizer hook -------
function useResizer({ initial, min, max, axis, onCommit }) {
  const [value, setValue] = useState(initial);
  const lastExternalRef = useRef(initial);
  // When the external initial changes (e.g. via Tweaks slider), adopt it locally.
  useEffect(() => {
    if (lastExternalRef.current !== initial) {
      lastExternalRef.current = initial;
      setValue(initial);
    }
  }, [initial]);
  const valueRef = useRef(value);
  valueRef.current = value;

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    const start = axis === "x" ? e.clientX : e.clientY;
    const startV = valueRef.current;
    document.body.style.cursor = axis === "x" ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";
    const sign = axis === "y-inverted" ? -1 : 1;
    const move = (ev) => {
      const cur = axis === "x" ? ev.clientX : ev.clientY;
      const next = Math.max(min, Math.min(max, startV + sign * (cur - start)));
      setValue(next);
    };
    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (onCommit) onCommit(valueRef.current);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  }, [axis, min, max, onCommit]);

  return [value, onMouseDown, setValue];
}

// ------- Answer (模範解答) panel -------
const AnswerPanel = ({ lesson, revealed, onReveal, onApply }) => {
  const [copied, setCopied] = useState(false);

  if (!lesson.answer) {
    return (
      <div className="answer-empty">
        <Icon name="check" className="icon-svg" />
        <p>この教材には模範解答が登録されていません。</p>
      </div>);

  }

  const copy = () => {
    navigator.clipboard?.writeText(lesson.answer.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  if (!revealed) {
    return (
      <div className="answer-gate">
        <div className="answer-gate-card">
          <div className="ag-icon"><Icon name="eye" className="icon-svg" /></div>
          <h3>模範解答を表示しますか？</h3>
          <p>まずは自分で書いてみることをおすすめします。詰まったときに参考にしましょう。</p>
          <button className="btn primary" onClick={onReveal}>
            <Icon name="eye" />
            模範解答を表示する
          </button>
        </div>
      </div>);

  }

  return (
    <div className="answer-view">
      <div className="answer-toolbar">
        <span className="answer-label">
          <Icon name="check" className="icon-svg" />
          模範解答
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button className="btn sm ghost" onClick={copy}>
            <Icon name={copied ? "check" : "code"} />
            {copied ? "コピーしました" : "コピー"}
          </button>
          <button className="btn sm" onClick={onApply} title="エディタの main.dart に反映">
            <Icon name="download" />
            エディタに反映
          </button>
        </div>
      </div>
      <div className="answer-body">
        <div className="answer-code dark-zone">
          <div className="answer-code-bar">
            <span className="ac-dot" />
            <span className="ac-name">main.dart</span>
          </div>
          <pre className="answer-pre"><code
            dangerouslySetInnerHTML={{ __html: highlightDart(lesson.answer.trim()) }}
          /></pre>
        </div>
      </div>
    </div>);

};

// ------- The S02 screen -------
const S02StudyMain = ({ lesson, onBack, leftPaneWidth, onLeftPaneWidth }) => {
  const [leftTab, setLeftTab] = useState("material"); // material | answer | llm
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [rightTab, setRightTab] = useState("preview"); // preview | console | files

  // Resizable layout
  const [leftW, onLeftDividerDown] = useResizer({
    initial: leftPaneWidth,
    min: 240,
    max: 720,
    axis: "x",
    onCommit: onLeftPaneWidth
  });
  // Bottom panel height — local only (not persisted)
  const [bottomH, onBottomDividerDown] = useResizer({
    initial: 320,
    min: 120,
    max: 720,
    axis: "y-inverted"
  });
  const [code, setCode] = useState(lesson.code || "");
  const [count, setCount] = useState(0);
  const [building, setBuilding] = useState(false);
  const [buildError, setBuildError] = useState(null);
  // Last build result for the toolbar status log: null | { ok, seconds }
  const [buildStatus, setBuildStatus] = useState(null);
  const [consoleLines, setConsoleLines] = useState(() => [
  { ts: "12:00:01", kind: "info", text: "Project loaded: flutter_lesson" },
  { ts: "12:00:01", kind: "info", text: "Dart SDK: 3.4.0 / Flutter: 3.22.0" },
  { ts: "12:00:02", kind: "ok", text: "Ready. Press [ビルド] to compile." }]
  );
  const [activeFile, setActiveFile] = useState("lib/main.dart");
  // Multiple open files shown as editor tabs. main.dart is always open first.
  const [openTabs, setOpenTabs] = useState(["lib/main.dart"]);
  // Per-file content for the non-main files (edits persist during the session).
  const [fileContents, setFileContents] = useState(() => ({ ...FILE_CONTENTS }));

  const isMainFile = activeFile === "lib/main.dart";
  const editorValue = isMainFile ? code : fileContents[activeFile] ?? "";
  const editorLang = langForPath(activeFile);
  const onEditorChange = isMainFile ?
  setCode :
  (v) => setFileContents((m) => ({ ...m, [activeFile]: v }));

  const openFile = (path) => {
    setOpenTabs((tabs) => tabs.includes(path) ? tabs : [...tabs, path]);
    setActiveFile(path);
  };
  const closeTab = (path, e) => {
    e.stopPropagation();
    setOpenTabs((tabs) => {
      const next = tabs.filter((t) => t !== path);
      if (path === activeFile) {
        const idx = tabs.indexOf(path);
        const fallback = next[idx] || next[idx - 1] || next[0];
        if (fallback) setActiveFile(fallback);
      }
      return next.length ? next : tabs; // keep at least one tab open
    });
  };

  // when lesson changes, reset code
  useEffect(() => {
    setCode(lesson.code || "");
    setCount(0);
    setBuildError(null);
    setBuildStatus(null);
    setAnswerRevealed(false);
    setLeftTab((t) => t === "answer" && !lesson.answer ? "material" : t);
  }, [lesson.id]);

  const tree = React.useMemo(() => preparePaths(FILE_TREE), []);

  const nowTs = () => {
    const d = new Date();
    return d.toTimeString().slice(0, 8);
  };

  const runBuild = useCallback(() => {
    setBuilding(true);
    setBuildError(null);
    setBuildStatus(null);
    setConsoleLines((l) => [
    ...l,
    { ts: nowTs(), kind: "info", text: "$ flutter build web" },
    { ts: nowTs(), kind: "info", text: "Compiling lib/main.dart..." }]
    );
    setRightTab("console");
    setTimeout(() => {
      setConsoleLines((l) => [
      ...l,
      { ts: nowTs(), kind: "info", text: "Resolving dependencies... (cached)" },
      { ts: nowTs(), kind: "info", text: "Running Dart compiler..." }]
      );
    }, 600);
    setTimeout(() => {
      // Simple check: if there's no runApp, treat as error
      const hasRunApp = /runApp\s*\(/.test(code);
      if (!hasRunApp) {
        const secs = (0.8 + Math.random() * 1.2).toFixed(1);
        setBuilding(false);
        setBuildError("lib/main.dart:3:1: Error: `runApp()` の呼び出しが見つかりません。");
        setBuildStatus({ ok: false, seconds: secs });
        setConsoleLines((l) => [
        ...l,
        { ts: nowTs(), kind: "err", text: "Error: runApp() not found in main.dart" },
        { ts: nowTs(), kind: "err", text: `Build failed in ${secs}s` }]
        );
        return;
      }
      const secs = (8 + Math.random() * 6).toFixed(1);
      setBuilding(false);
      setBuildStatus({ ok: true, seconds: secs });
      setConsoleLines((l) => [
      ...l,
      { ts: nowTs(), kind: "ok", text: "✓ Built build/web/main.dart.js (132 KB)" },
      { ts: nowTs(), kind: "ok", text: `Build completed in ${secs}s` }]
      );
      setRightTab("preview");
    }, 1600);
  }, [code]);

  const fileLabel = activeFile.split("/").pop();

  return (
    <div className="page-s02" data-screen-label="S02 学習メイン">
      {/* Top toolbar */}
      <div className="s02-toolbar">
        <button className="btn ghost sm" onClick={onBack} title="教材一覧へ戻る">
          <Icon name="arrowL" />
          戻る
        </button>
        <div style={{ width: 1, height: 18, background: "var(--border)" }} />
        <span className="lesson-num mono">#{lesson.num}</span>
        <span className="lesson-title">{lesson.title}</span>
        <span className={"badge lang"} style={{ marginLeft: 8 }}>{lesson.lang}</span>
        <span className={"badge diff-" + lesson.diff}>
          <span className="dot" />
          {{ beginner: "入門", intermediate: "中級", advanced: "上級" }[lesson.diff]}
        </span>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {(building || buildStatus) &&
          <div
            className={
            "build-status " + (
            building ? "is-building" : buildStatus.ok ? "is-ok" : "is-err")
            }
            title="直近のビルド結果">
            
              {building ?
            <>
                  <span className="spinner" />
                  <span>ビルド中…</span>
                </> :

            <>
                  <span className="bs-dot" />
                  <span>{buildStatus.ok ? "ビルド成功" : "ビルド失敗"}</span>
                  <span className="bs-time">· {buildStatus.seconds}s</span>
                </>
            }
            </div>
          }
          <button className="btn sm" onClick={() => setCode(lesson.code || "")} title="初期コードに戻す">
            <Icon name="refresh" />
            リセット
          </button>
          <button className="btn primary sm" onClick={runBuild} disabled={building}>
            {building ? <span className="spinner" /> : <Icon name="play" />}
            ビルド
          </button>
        </div>
      </div>

      <div className="s02-body split-h">
        {/* LEFT PANE */}
        <div className="pane s02-left" style={{ width: leftW, flex: `0 0 ${leftW}px` }}>
          <div className="tabs">
            <button
              className={"tab" + (leftTab === "material" ? " active" : "")}
              onClick={() => setLeftTab("material")}>
              
              <Icon name="book" />
              教材
            </button>
            <button
              className={"tab" + (leftTab === "answer" ? " active" : "")}
              onClick={() => setLeftTab("answer")}>
              
              <Icon name="check" />
              解答
            </button>
            <button
              className={"tab" + (leftTab === "llm" ? " active" : "")}
              onClick={() => setLeftTab("llm")}>
              
              <Icon name="chat" />
              LLM
            </button>
            <div className="tab-spacer" />
          </div>

          <div style={{ flex: 1, minHeight: 0, display: leftTab === "material" ? "flex" : "none", flexDirection: "column" }}>
            <div className="md" dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.body || "") }} />
          </div>

          <div style={{ flex: 1, minHeight: 0, display: leftTab === "answer" ? "flex" : "none", flexDirection: "column" }}>
            <AnswerPanel
              lesson={lesson}
              revealed={answerRevealed}
              onReveal={() => setAnswerRevealed(true)}
              onApply={() => {setCode(lesson.answer);setActiveFile("lib/main.dart");}} />
            
          </div>

          <div style={{ flex: 1, minHeight: 0, display: leftTab === "llm" ? "flex" : "none", flexDirection: "column" }}>
            <ChatPanel messages={SAMPLE_CHAT} lessonNum={lesson.num} fileName={fileLabel} />
          </div>
        </div>

        <div className="divider-v" onMouseDown={onLeftDividerDown} title="ドラッグして幅を変更" style={{ opacity: "1" }} />

        {/* RIGHT PANE */}
        <div className="pane" style={{ flex: "1 1 auto" }}>
          <div className="split-v" style={{ flex: 1, minHeight: 0 }}>
            {/* Editor */}
            <div className="pane editor-host dark-zone" style={{ flex: "1 1 auto" }}>
              <div className="editor-tabs">
                <div className="etab-strip">
                  {openTabs.map((path) => {
                    const name = path.split("/").pop();
                    const ext = EXT_BY_PATH(path);
                    const dirty = path === "lib/main.dart" && code !== (lesson.code || "");
                    return (
                      <div
                        key={path}
                        className={"etab" + (activeFile === path ? " active" : "")}
                        onClick={() => setActiveFile(path)}
                        title={path}>
                        
                        <span className={"ft-icon ft-icon-" + ext}>
                          <FileTypeIcon ext={ext} isFolder={false} />
                        </span>
                        <span className="etab-name">{name}</span>
                        {dirty && <span className="etab-dirty" title="未保存の変更" />}
                        <button
                          className="etab-close"
                          onClick={(e) => closeTab(path, e)}
                          title="閉じる"
                          aria-label="タブを閉じる">
                          
                          <Icon name="x" />
                        </button>
                      </div>);

                  })}
                </div>
                <span className="etab-meta">
                  {{ dart: "Dart", yaml: "YAML", json: "JSON", markdown: "Markdown" }[editorLang] || "Text"} · LF · UTF-8
                </span>
              </div>
              <MonacoEditor value={editorValue} onChange={onEditorChange} language={editorLang} />
            </div>

            <div className="divider-h" onMouseDown={onBottomDividerDown} title="ドラッグして高さを変更" />

            {/* Bottom panel */}
            <div className="pane bottom-panel" style={{ flex: `0 0 ${bottomH}px` }}>
              <div className="tabs">
                <button
                  className={"tab" + (rightTab === "preview" ? " active" : "")}
                  onClick={() => setRightTab("preview")}>
                  
                  <Icon name="eye" />
                  プレビュー
                </button>
                <button
                  className={"tab" + (rightTab === "console" ? " active" : "")}
                  onClick={() => setRightTab("console")}>
                  
                  <Icon name="terminal" />
                  コンソール
                </button>
                <button
                  className={"tab" + (rightTab === "files" ? " active" : "")}
                  onClick={() => setRightTab("files")}>
                  
                  <Icon name="folder" />
                  ファイル
                </button>
                <div className="tab-spacer" />
                {rightTab === "preview" && !building && !buildError &&
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", color: "var(--fg-2)", fontSize: 11 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)" }} />
                    running on chrome
                  </div>
                }
              </div>

              <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
                {rightTab === "preview" &&
                <FlutterPreview count={count} onTap={() => setCount((c) => c + 1)} building={building} error={buildError} />
                }
                {rightTab === "console" && <ConsolePanel lines={consoleLines} building={building} />}
                {rightTab === "files" &&
                <FileTree tree={tree} active={activeFile} onSelect={openFile} />
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};

window.S02StudyMain = S02StudyMain;
window.MonacoEditor = MonacoEditor;
window.langForPath = langForPath;
window.EXT_BY_PATH = EXT_BY_PATH;
window.FileTypeIcon = FileTypeIcon;