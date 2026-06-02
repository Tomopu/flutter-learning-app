// S01 — 教材一覧画面
// Zenn-like card grid of lessons. Clicking a card routes to S02.

const S01CourseList = ({ onOpenLesson }) => {
  const [langFilter, setLangFilter] = React.useState("すべて");
  const [diffFilter, setDiffFilter] = React.useState("すべて");
  const [sortBy, setSortBy] = React.useState("num");

  const allLangs = ["すべて", ...Array.from(new Set(LESSONS.map((l) => l.lang)))];
  const allDiffs = ["すべて", "入門", "中級", "上級"];
  const diffMap = { beginner: "入門", intermediate: "中級", advanced: "上級" };

  const filtered = LESSONS.filter((l) => l.state === "published")
    .filter((l) => langFilter === "すべて" || l.lang === langFilter)
    .filter((l) => diffFilter === "すべて" || diffMap[l.diff] === diffFilter);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "num") return a.num.localeCompare(b.num);
    if (sortBy === "lang") return a.lang.localeCompare(b.lang) || a.num.localeCompare(b.num);
    if (sortBy === "title") return a.title.localeCompare(b.title);
    return 0;
  });

  return (
    <div className="page-s01" data-screen-label="S01 教材一覧">
      <div className="s01-scroll">
        <div className="s01-container">
          <div className="hero">
            <h1>学習を始める</h1>
            <p>レッスンを選んでクリックすると、教材とコードエディタが横並びの学習画面が開きます。</p>
          </div>

          <div className="s01-controls">
            <div className="chip-row">
              {allLangs.map((lang) => (
                <button
                  key={lang}
                  className={"chip" + (langFilter === lang ? " active" : "")}
                  onClick={() => setLangFilter(lang)}
                >
                  {lang}
                </button>
              ))}
              <span className="ctrl-sep" />
              {allDiffs.map((d) => (
                <button
                  key={d}
                  className={"chip" + (diffFilter === d ? " active" : "")}
                  onClick={() => setDiffFilter(d)}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="s01-sort">
              <span className="count">{sorted.length} 件</span>
              <select
                className="select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="num">番号順</option>
                <option value="title">タイトル順</option>
                <option value="lang">言語順</option>
              </select>
            </div>
          </div>

          <div className="lesson-grid">
            {sorted.map((l) => (
              <button key={l.id} className="lesson-card" onClick={() => onOpenLesson(l.id)}>
                <div className="lc-top">
                  <span className="lc-num">#{l.num}</span>
                  <span className={"badge diff-" + l.diff}>
                    <span className="dot" />
                    {diffMap[l.diff]}
                  </span>
                </div>
                <h3 className="lc-title">{l.title}</h3>
                <p className="lc-desc">{l.desc}</p>
                <div className="lc-foot">
                  <span className="badge lang">{l.lang}</span>
                  <span className="lc-open">
                    学習する
                    <Icon name="chevR" />
                  </span>
                </div>
              </button>
            ))}
            {sorted.length === 0 && (
              <div className="empty" style={{ gridColumn: "1 / -1" }}>
                条件に一致する教材がありません。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

window.S01CourseList = S01CourseList;
