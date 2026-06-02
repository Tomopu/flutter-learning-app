// Shared UI primitives: icons, dialog, simple markdown renderer.
// Exports to window.

const Icon = ({ name, className = "icon-svg" }) => {
  const paths = {
    book: <path d="M4 4h7v16H4z M11 4h9v16h-9 M14 8h4 M14 12h4" />,
    code: <path d="M9 5l-5 7 5 7 M15 5l5 7-5 7" />,
    settings: <path d="M12 3v3 M12 18v3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M3 12h3 M18 12h3 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1" />,
    play: <path d="M8 5l11 7-11 7V5z" />,
    plus: <path d="M12 5v14 M5 12h14" />,
    chevR: <path d="M9 6l6 6-6 6" />,
    chevD: <path d="M6 9l6 6 6-6" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-5-5" /></>,
    check: <path d="M5 12l5 5L20 7" />,
    x: <path d="M6 6l12 12 M18 6L6 18" />,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>,
    trash: <path d="M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13" />,
    save: <path d="M4 4h13l3 3v13H4z M8 4v6h8V4 M8 14h8v6H8z" />,
    edit: <path d="M14 3l7 7-12 12H2v-7z" />,
    send: <path d="M22 2L11 13 M22 2l-7 20-4-9-9-4z" />,
    chat: <path d="M21 12a8 8 0 11-3.5-6.6L21 4l-1.6 3.5A8 8 0 0121 12z" />,
    file: <path d="M14 3H5v18h14V8z M14 3v5h5" />,
    folder: <path d="M3 6h6l2 2h10v12H3z" />,
    terminal: <path d="M4 5h16v14H4z M7 9l3 3-3 3 M12 15h5" />,
    refresh: <path d="M3 12a9 9 0 0115-6.7L21 8 M21 3v5h-5 M21 12a9 9 0 01-15 6.7L3 16 M3 21v-5h5" />,
    filter: <path d="M3 4h18l-7 9v6l-4 2v-8z" />,
    layout: <path d="M3 4h18v16H3z M3 10h18 M10 10v10" />,
    arrowL: <path d="M19 12H5 M12 5l-7 7 7 7" />,
    upload: <path d="M12 16V4 M5 11l7-7 7 7 M4 20h16" />,
    download: <path d="M12 4v12 M5 13l7 7 7-7 M4 20h16" />,
    bell: <path d="M6 8a6 6 0 0112 0v5l2 3H4l2-3z M10 19a2 2 0 004 0" />,
    moon: <path d="M21 13A9 9 0 0111 3a8 8 0 1010 10z" />,
    menu: <path d="M3 6h18 M3 12h18 M3 18h18" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M4.93 19.07l1.41-1.41 M17.66 6.34l1.41-1.41" /></>,
  };
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || null}
    </svg>
  );
};

const Dialog = ({ open, title, body, confirmLabel = "実行", cancelLabel = "キャンセル", danger = false, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="dlg-backdrop" onClick={onCancel}>
      <div
        className={"dlg" + (danger ? " danger" : "")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dlg-header">{title}</div>
        <div className="dlg-body">{body}</div>
        <div className="dlg-footer">
          <button className="btn ghost" onClick={onCancel}>{cancelLabel}</button>
          <button
            className={"btn " + (danger ? "danger" : "primary")}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// Tiny markdown renderer (headings, paragraphs, lists, code, blockquotes, tables, inline code/em/strong/links)
function renderMarkdown(src) {
  if (!src) return "";
  const escape = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  const inline = (s) =>
    s
      .replace(/`([^`]+)`/g, (_m, c) => `<code>${escape(c)}</code>`)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  const lines = src.split("\n");
  let out = "";
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Code fence
    if (/^```/.test(line)) {
      const lang = line.slice(3).trim().toLowerCase();
      i++;
      let code = "";
      while (i < lines.length && !/^```/.test(lines[i])) {
        code += lines[i] + "\n";
        i++;
      }
      i++; // skip closing ```
      const body = (lang === "dart" || lang === "")
        ? highlightDart(code.trimEnd())
        : escape(code.trimEnd());
      out += `<pre class="code-block"><code>${body}</code></pre>`;
      continue;
    }
    // Headings
    if (/^### /.test(line)) { out += `<h3>${inline(escape(line.slice(4)))}</h3>`; i++; continue; }
    if (/^## /.test(line)) { out += `<h2>${inline(escape(line.slice(3)))}</h2>`; i++; continue; }
    if (/^# /.test(line)) { out += `<h1>${inline(escape(line.slice(2)))}</h1>`; i++; continue; }
    // Blockquote
    if (/^> /.test(line)) {
      let block = "";
      while (i < lines.length && /^> /.test(lines[i])) {
        block += lines[i].slice(2) + "\n";
        i++;
      }
      const isHint = /\*\*ヒント\*\*|\*\*Hint\*\*|\*\*チャレンジ\*\*/.test(block);
      out += `<blockquote${isHint ? ' class="hint"' : ""}>${inline(escape(block.trim())).replace(/\n/g, "<br>")}</blockquote>`;
      continue;
    }
    // Table
    if (/^\|/.test(line) && i + 1 < lines.length && /^\|[-:\s|]+\|$/.test(lines[i + 1])) {
      const headerCells = line.split("|").slice(1, -1).map((c) => c.trim());
      i += 2;
      let rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        rows.push(lines[i].split("|").slice(1, -1).map((c) => c.trim()));
        i++;
      }
      out += "<table><thead><tr>" + headerCells.map((c) => `<th>${inline(escape(c))}</th>`).join("") + "</tr></thead><tbody>";
      out += rows.map((r) => "<tr>" + r.map((c) => `<td>${inline(escape(c))}</td>`).join("") + "</tr>").join("");
      out += "</tbody></table>";
      continue;
    }
    // List
    if (/^[-*] /.test(line)) {
      let items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(lines[i].replace(/^[-*] /, ""));
        i++;
      }
      out += "<ul>" + items.map((it) => `<li>${inline(escape(it))}</li>`).join("") + "</ul>";
      continue;
    }
    if (/^\d+\. /.test(line)) {
      let items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      out += "<ol>" + items.map((it) => `<li>${inline(escape(it))}</li>`).join("") + "</ol>";
      continue;
    }
    // Blank
    if (line.trim() === "") { i++; continue; }
    // Paragraph (collect until blank)
    let para = line;
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !/^(#|>|```|[-*] |\d+\. |\|)/.test(lines[i])) {
      para += "\n" + lines[i];
      i++;
    }
    out += `<p>${inline(escape(para)).replace(/\n/g, "<br>")}</p>`;
  }
  return out;
}

// Lightweight Dart syntax highlighter → HTML string with .tk-* spans.
function highlightDart(code) {
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  const KW = "import|library|part|export|class|extends|implements|mixin|with|void|return|const|final|var|dynamic|new|if|else|for|while|switch|case|break|continue|super|this|true|false|null|static|get|set|late|required|async|await|yield|in|is|as|enum|typedef|factory|abstract|covariant|external|operator|rethrow|throw|try|catch|finally|do|default|show|hide|deferred|sync";
  const tokenRe = new RegExp(
    "(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)" +          // 1 comment
    "|('(?:\\\\.|[^'\\\\])*'|\"(?:\\\\.|[^\"\\\\])*\")" + // 2 string
    "|(@\\w+)" +                                          // 3 annotation
    "|(\\b\\d+(?:\\.\\d+)?\\b)" +                         // 4 number
    "|(\\b(?:" + KW + ")\\b)" +                            // 5 keyword
    "|(\\b[A-Z]\\w*)" +                                    // 6 type (Capitalized)
    "|([a-z_]\\w*)",                                       // 7 identifier
    "g"
  );
  let out = "", last = 0, m;
  while ((m = tokenRe.exec(code))) {
    out += esc(code.slice(last, m.index));
    last = tokenRe.lastIndex;
    if (m[1]) out += `<span class="tk-cmt">${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class="tk-str">${esc(m[2])}</span>`;
    else if (m[3]) out += `<span class="tk-ann">${esc(m[3])}</span>`;
    else if (m[4]) out += `<span class="tk-num">${esc(m[4])}</span>`;
    else if (m[5]) out += `<span class="tk-kw">${esc(m[5])}</span>`;
    else if (m[6]) out += `<span class="tk-typ">${esc(m[6])}</span>`;
    else out += esc(m[0]);
  }
  out += esc(code.slice(last));
  return out;
}

Object.assign(window, { Icon, Dialog, renderMarkdown, highlightDart });
