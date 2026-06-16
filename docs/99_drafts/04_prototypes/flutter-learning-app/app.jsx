// Main app: routing, header, tweaks panel.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "density": "normal",
  "sidebar": true,
  "leftPaneWidth": 380,
  "accent": "#3EA8FF"
} /*EDITMODE-END*/;

const ACCENT_OPTIONS = [
"#3EA8FF", // Zenn blue
"#0175C2", // Flutter blue
"#7C9CFF", // soft indigo
"#13B981", // emerald
"#A78BFA" // violet
];

const App = () => {
  // route: { screen: 's01' | 's02' | 's03', lessonId?, adminView? }
  const [route, setRoute] = React.useState({ screen: "s01" });
  const [lessons, setLessons] = React.useState(LESSONS);
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply density + accent + theme globally
  React.useEffect(() => {
    document.documentElement.setAttribute("data-density", tweaks.density);
  }, [tweaks.density]);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", tweaks.theme);
  }, [tweaks.theme]);

  const toggleTheme = () =>
  setTweak("theme", tweaks.theme === "dark" ? "light" : "dark");

  React.useEffect(() => {
    document.documentElement.style.setProperty("--accent", tweaks.accent);
    // derive hover
    const lighter = tweaks.accent;
    document.documentElement.style.setProperty("--accent-hover", lighter);
    // soft variant (with alpha)
    document.documentElement.style.setProperty(
      "--accent-soft",
      hexToRgba(tweaks.accent, 0.15)
    );
  }, [tweaks.accent]);

  function hexToRgba(hex, a) {
    const m = hex.replace("#", "");
    const r = parseInt(m.slice(0, 2), 16);
    const g = parseInt(m.slice(2, 4), 16);
    const b = parseInt(m.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  const currentLesson = React.useMemo(() => {
    if (route.lessonId != null) {
      return lessons.find((l) => l.id === route.lessonId) || lessons[0];
    }
    return lessons[0];
  }, [route.lessonId, lessons]);

  const openLesson = (id) => setRoute({ screen: "s02", lessonId: id });
  const goAdmin = () => setRoute({ screen: "s03", adminView: "list" });
  const goHome = () => setRoute({ screen: "s01" });

  const editLesson = (id) =>
  setRoute({ screen: "s03", adminView: "edit", lessonId: id });
  const newLesson = () =>
  setRoute({ screen: "s03", adminView: "edit", lessonId: null });
  const backToAdminList = () => setRoute({ screen: "s03", adminView: "list" });

  const saveLesson = (draft) => {
    if (route.lessonId) {
      setLessons((curr) => curr.map((l) => l.id === route.lessonId ? { ...l, ...draft, updated: "2026-05-26" } : l));
    } else {
      const newId = Math.max(...lessons.map((l) => l.id)) + 1;
      const newNum = String(newId).padStart(3, "0");
      setLessons((curr) => [...curr, { ...draft, id: newId, num: newNum, updated: "2026-05-26" }]);
    }
    backToAdminList();
  };

  return (
    <div
      className="app-shell"
      data-sidebar={tweaks.sidebar ? "on" : "off"}>
      
      <Header route={route} onHome={goHome} onAdmin={goAdmin} theme={tweaks.theme} onToggleTheme={toggleTheme} />
      <div className="app-main">
        {route.screen === "s01" &&
        <S01CourseList onOpenLesson={openLesson} />
        }
        {route.screen === "s02" &&
        <S02StudyMain
          key={currentLesson.id}
          lesson={currentLesson}
          onBack={goHome}
          leftPaneWidth={tweaks.leftPaneWidth}
          onLeftPaneWidth={(w) => setTweak("leftPaneWidth", w)} />

        }
        {route.screen === "s03" && route.adminView === "list" &&
        <AdminList
          items={lessons}
          setItems={setLessons}
          onEdit={editLesson}
          onNew={newLesson} />

        }
        {route.screen === "s03" && route.adminView === "edit" &&
        <AdminEdit
          lesson={
          route.lessonId ?
          lessons.find((l) => l.id === route.lessonId) || {} :
          {}
          }
          onBack={backToAdminList}
          onSave={saveLesson} />

        }
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="表示">
          <TweakRadio
            label="テーマ"
            value={tweaks.theme}
            options={[
            { label: "ライト", value: "light" },
            { label: "ダーク", value: "dark" }]
            }
            onChange={(v) => setTweak("theme", v)} />
          
          <TweakRadio
            label="UI 密度"
            value={tweaks.density}
            options={[
            { label: "通常", value: "normal" },
            { label: "コンパクト", value: "compact" }]
            }
            onChange={(v) => setTweak("density", v)} />
          
          <TweakToggle
            label="サイドバー（ファイルツリー）"
            value={tweaks.sidebar}
            onChange={(v) => setTweak("sidebar", v)} />
          
        </TweakSection>

        <TweakSection label="レイアウト">
          <TweakSlider
            label="左ペイン幅 (S02)"
            value={tweaks.leftPaneWidth}
            min={280}
            max={560}
            step={10}
            unit="px"
            onChange={(v) => setTweak("leftPaneWidth", v)} />
          
        </TweakSection>

        <TweakSection label="ブランド">
          <TweakColor
            label="アクセントカラー"
            value={tweaks.accent}
            options={ACCENT_OPTIONS}
            onChange={(v) => setTweak("accent", v)} />
          
        </TweakSection>

        <div style={{ marginTop: 12, padding: 10, background: "rgba(255,255,255,0.04)", borderRadius: 6, fontSize: 11, color: "var(--fg-2)", lineHeight: 1.5 }}>
          ヒント: <span className="kbd">Tweaks</span> ボタンでパネル開閉。S01 の行クリックで S02、ヘッダーの <strong>Admin</strong> で S03 へ。
        </div>
      </TweaksPanel>
    </div>);

};

// ============ Header ============
const Header = ({ route, onHome, onAdmin, theme, onToggleTheme }) => {
  const screen = route.screen;
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const isLearn = screen === "s01" || screen === "s02";
  const isAdmin = screen === "s03";

  return (
    <header className="app-header">
      <div className="brand" onClick={onHome} style={{ cursor: "pointer" }}>
        <div className="brand-mark">F</div>
        <span className="brand-name">FlutterLearn</span>
        <span className="brand-sub">/ {isAdmin ? "Admin" : "学習"}</span>
      </div>

      <div className="header-menu" ref={menuRef}>
        <button
          className={"btn ghost icon hamburger" + (menuOpen ? " open" : "")}
          onClick={() => setMenuOpen((o) => !o)}
          title="メニュー"
          aria-label="メニュー"
          aria-expanded={menuOpen}>
          <Icon name="menu" />
        </button>

        {menuOpen && (
          <div className="menu-pop" role="menu">
            <div className="menu-label">画面</div>
            <button
              className={"menu-item" + (isLearn ? " active" : "")}
              role="menuitemradio"
              aria-checked={isLearn}
              onClick={() => { onHome(); setMenuOpen(false); }}>
              <Icon name="book" />
              <span>学習</span>
              {isLearn && <Icon name="check" className="icon-svg menu-check" />}
            </button>
            <button
              className={"menu-item" + (isAdmin ? " active" : "")}
              role="menuitemradio"
              aria-checked={isAdmin}
              onClick={() => { onAdmin(); setMenuOpen(false); }}>
              <Icon name="settings" />
              <span>Admin</span>
              {isAdmin && <Icon name="check" className="icon-svg menu-check" />}
            </button>

            <div className="menu-sep" />

            <div className="menu-label">テーマ</div>
            <button
              className="menu-item"
              role="menuitemcheckbox"
              aria-checked={theme === "dark"}
              onClick={() => { onToggleTheme(); }}>
              {theme === "dark" ? <Icon name="moon" /> : <Icon name="sun" />}
              <span>{theme === "dark" ? "ダークモード" : "ライトモード"}</span>
              <span className="menu-switch" data-on={theme === "dark"}>
                <span className="menu-switch-knob" />
              </span>
            </button>

            <div className="menu-sep" />

            <div className="menu-version">
              <span className="brand-mark sm">F</span>
              <div>
                <div className="mv-name">FlutterLearn</div>
                <div className="mv-ver">v0.1.0 · prototype</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>);

};

// Mount
const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);