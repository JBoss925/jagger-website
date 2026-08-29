import { useEffect, useMemo, useRef, useState } from "react";
import { profileContent } from "../../shared/content/profile";
import type { ProjectEntry } from "../../shared/types/content";

type TradingViewWidgetProps = {
  script: string;
  config: Record<string, unknown>;
  className?: string;
  label: string;
};

const marketSymbols = [
  { symbol: "NASDAQ:AAPL", short: "AAPL", name: "Apple", market: "NASDAQ" },
  { symbol: "NASDAQ:MSFT", short: "MSFT", name: "Microsoft", market: "NASDAQ" },
  { symbol: "NASDAQ:NVDA", short: "NVDA", name: "NVIDIA", market: "NASDAQ" },
  { symbol: "NASDAQ:GOOGL", short: "GOOGL", name: "Alphabet", market: "NASDAQ" },
  { symbol: "NASDAQ:AMZN", short: "AMZN", name: "Amazon", market: "NASDAQ" },
  { symbol: "NASDAQ:META", short: "META", name: "Meta", market: "NASDAQ" },
  { symbol: "NASDAQ:AVGO", short: "AVGO", name: "Broadcom", market: "NASDAQ" },
  { symbol: "NYSE:ORCL", short: "ORCL", name: "Oracle", market: "NYSE" },
  { symbol: "NYSE:JPM", short: "JPM", name: "JPMorgan", market: "NYSE" },
  { symbol: "NYSE:BRK.B", short: "BRK.B", name: "Berkshire", market: "NYSE" },
  { symbol: "NYSE:JNJ", short: "JNJ", name: "Johnson & Johnson", market: "NYSE" },
  { symbol: "NYSE:XOM", short: "XOM", name: "Exxon Mobil", market: "NYSE" },
  { symbol: "NASDAQ:WMT", short: "WMT", name: "Walmart", market: "NASDAQ" },
  { symbol: "NYSE:V", short: "V", name: "Visa", market: "NYSE" },
  { symbol: "NYSE:PG", short: "PG", name: "Procter & Gamble", market: "NYSE" },
  { symbol: "NYSE:KO", short: "KO", name: "Coca-Cola", market: "NYSE" },
  { symbol: "NYSE:HD", short: "HD", name: "Home Depot", market: "NYSE" },
  { symbol: "NYSE:CAT", short: "CAT", name: "Caterpillar", market: "NYSE" }
];

const intervalOptions = [
  { label: "5m", value: "5" },
  { label: "15m", value: "15" },
  { label: "1h", value: "60" },
  { label: "1D", value: "D" },
  { label: "1W", value: "W" }
];

const projectCodes: Record<string, string> = {
  ojaml: "OJML",
  hearth: "HRTH",
  jaggerscript: "JSGR",
  "genetic-learners": "GENE",
  "jagger-games": "PLAY",
  jetstream: "JET",
  rengine: "RNDR",
  "tsxlight-renderer": "TSXL"
};

const tickerConfig = {
  symbols: marketSymbols.map((item) => ({ proName: item.symbol, title: item.short })),
  showSymbolLogo: true,
  isTransparent: true,
  displayMode: "regular",
  colorTheme: "dark",
  locale: "en"
};

function mainSiteHref(path = "") {
  if (import.meta.env.DEV) return `${window.location.protocol}//${window.location.hostname}:5173${path}`;
  return `https://jaggerbrulato.com${path}`;
}

function externalHref(href: string) {
  return href.startsWith("/") ? mainSiteHref(href) : href;
}

function clean(value: string) {
  return value.replace(/\*\*(.*?)\*\*/g, "$1");
}

function projectCode(project: ProjectEntry) {
  return projectCodes[project.slug] ?? project.slug.replace(/[^a-z]/gi, "").slice(0, 4).toUpperCase();
}

function TradingViewWidget({ script, config, className = "", label }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const serializedConfig = JSON.stringify(config);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.replaceChildren();

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    const loader = document.createElement("div");
    loader.className = "widget-loader";
    loader.textContent = "CONNECTING TO MARKET DATA…";
    widget.append(loader);
    container.append(widget);

    const scriptElement = document.createElement("script");
    scriptElement.type = "text/javascript";
    scriptElement.src = `https://s3.tradingview.com/external-embedding/${script}`;
    scriptElement.async = true;
    scriptElement.textContent = serializedConfig;
    container.append(scriptElement);

    return () => container.replaceChildren();
  }, [script, serializedConfig]);

  return <div ref={containerRef} className={`tradingview-widget-container ${className}`} aria-label={label} />;
}

function TradingViewTickerList() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const widget = document.createElement("tv-tickers");
    widget.setAttribute("symbols", marketSymbols.map((item) => item.symbol).join(","));
    widget.setAttribute("direction", "vertical");
    widget.setAttribute("item-size", "compact");
    widget.setAttribute("hide-chart", "");
    widget.setAttribute("theme", "dark");
    widget.setAttribute("aria-label", "Live prices and daily changes supplied by TradingView");
    container.replaceChildren(widget);

    if (!document.querySelector('script[data-tradingview-tickers]')) {
      const scriptElement = document.createElement("script");
      scriptElement.type = "module";
      scriptElement.src = "https://widgets.tradingview-widget.com/w/en/tv-tickers.js";
      scriptElement.dataset.tradingviewTickers = "true";
      document.head.append(scriptElement);
    }

    return () => container.replaceChildren();
  }, []);

  return <div ref={containerRef} className="market-tickers" style={{ "--market-monitor-count": marketSymbols.length } as React.CSSProperties} />;
}

function MarketClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return <time dateTime={now.toISOString()}>{now.toLocaleTimeString([], { hour12: false, timeZoneName: "short" })}</time>;
}

function App() {
  const [activeSymbol, setActiveSymbol] = useState("NASDAQ:AAPL");
  const [interval, setInterval] = useState("D");
  const [selectedProject, setSelectedProject] = useState(profileContent.projects[0]);
  const symbolMeta = marketSymbols.find((item) => item.symbol === activeSymbol) ?? marketSymbols[0];

  const chartConfig = useMemo(() => ({
    autosize: true,
    symbol: activeSymbol,
    interval,
    timezone: "exchange",
    theme: "dark",
    style: "1",
    locale: "en",
    backgroundColor: "#07100c",
    gridColor: "rgba(84, 125, 104, 0.16)",
    hide_top_toolbar: false,
    hide_legend: false,
    allow_symbol_change: true,
    save_image: false,
    calendar: false,
    support_host: "https://www.tradingview.com"
  }), [activeSymbol, interval]);

  const technicalConfig = useMemo(() => ({
    interval: "1D",
    width: "100%",
    height: "100%",
    isTransparent: true,
    symbol: activeSymbol,
    showIntervalTabs: true,
    displayMode: "single",
    locale: "en",
    colorTheme: "dark"
  }), [activeSymbol]);

  return (
    <div className="terminal-shell">
      <header className="topbar">
        <a className="terminal-brand" href="#workspace"><span>JB</span><strong>CAPITAL</strong><small>PORTFOLIO TERMINAL</small></a>
        <nav aria-label="Finance view navigation"><a href="#workspace">Markets</a><a href="#career">Career tape</a><a href="#research">Research</a><a href="#exposure">Exposure</a></nav>
        <div className="topbar-actions"><a className="home-action" href={mainSiteHref()}>HOME VIEW</a><a href={mainSiteHref("/files/resume.pdf")}>RESUME</a><a className="contact-action" href={`mailto:${profileContent.email}`}>CONTACT</a></div>
      </header>

      <section className="ticker-tape" aria-label="Live market ticker">
        <TradingViewWidget script="embed-widget-ticker-tape.js" config={tickerConfig} label="Live market ticker supplied by TradingView" />
      </section>

      <div className="market-status"><span><i /> MARKET DATA CONNECTED</span><span>TECH + BLUE CHIP UNIVERSE</span><span><MarketClock /></span><span>DATA BY TRADINGVIEW</span></div>

      <main>
        <section className="workspace" id="workspace">
          <aside className="symbol-rail panel">
            <header><span>WATCHLIST</span><small>{marketSymbols.length} SYMBOLS</small></header>
            <div className="symbol-list">
              {marketSymbols.map((item) => <button key={item.symbol} className={activeSymbol === item.symbol ? "active" : ""} onClick={() => setActiveSymbol(item.symbol)}><span><strong>{item.short}</strong><small>{item.name}</small></span><em>{item.market}</em></button>)}
            </div>
          </aside>

          <section className="chart-panel panel">
            <header className="chart-toolbar">
              <div><span className="eyebrow">PRIMARY CHART</span><strong>{symbolMeta.short}</strong><small>{symbolMeta.name} · {symbolMeta.market}</small></div>
              <div className="intervals" aria-label="Chart interval">{intervalOptions.map((item) => <button className={interval === item.value ? "active" : ""} key={item.value} onClick={() => setInterval(item.value)}>{item.label}</button>)}</div>
            </header>
            <TradingViewWidget key={`${activeSymbol}-${interval}`} script="embed-widget-advanced-chart.js" config={chartConfig} className="advanced-chart" label={`${symbolMeta.name} live interactive chart supplied by TradingView`} />
          </section>

          <aside className="market-rail">
            <section className="panel quotes-panel"><header><span>MARKET MONITOR</span><small>LIVE / DELAYED</small></header><TradingViewTickerList /></section>
            <section className="panel coverage-card"><header><span>ANALYST PROFILE</span><small>JB / 2026</small></header><h2>{profileContent.name}</h2><p>{clean(profileContent.title)}</p><div>{profileContent.metrics.map((metric) => <span key={metric.label}><small>{metric.label}</small><strong>{metric.value}</strong></span>)}</div></section>
          </aside>
        </section>

        <section className="career-section" id="career">
          <div className="section-bar"><div><span>01</span><h2>Career Tape</h2></div><p>Operating history across product, platform, infrastructure, data, and technical leadership.</p></div>
          <div className="career-tape panel">
            {profileContent.experience.map((job, index) => <details key={job.slug} open={index === 0 ? true : undefined}><summary><time>{job.timeframe}</time><strong>{job.company}</strong><span>{job.role}</span><em>{job.location}</em><i>+</i></summary><div><p>{job.summary}</p><ol>{job.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ol><div className="career-tags">{job.tags.map((tag) => <span key={`${tag.tone}-${tag.label}`}>{tag.label}</span>)}</div></div></details>)}
          </div>
          <aside className="technical-panel panel"><header><span>TECHNICAL SIGNAL</span><small>{symbolMeta.short}</small></header><TradingViewWidget script="embed-widget-technical-analysis.js" config={technicalConfig} className="technical-widget" label={`${symbolMeta.name} technical analysis supplied by TradingView`} /></aside>
        </section>

        <section className="research-grid" id="research">
          <div className="section-bar"><div><span>02</span><h2>Engineering Research Ledger</h2></div><p>Projects are presented as coverage instruments. Values below are portfolio information—not securities or trade recommendations.</p></div>
          <div className="research-table panel">
            <div className="table-head"><span>SYMBOL</span><span>ASSET / PRODUCT</span><span>CORE THESIS</span><span>STACK</span><span>ACTION</span></div>
            {profileContent.projects.map((project) => <button className={selectedProject.slug === project.slug ? "active" : ""} key={project.slug} onClick={() => setSelectedProject(project)}><strong>{projectCode(project)}</strong><span>{project.title}</span><span>{clean(project.description)}</span><span>{project.stack.slice(0, 3).join(" · ")}</span><em>OPEN ↗</em></button>)}
          </div>
          <aside className="research-note panel">
            <header><span>RESEARCH NOTE</span><small>{projectCode(selectedProject)} / ACTIVE</small></header>
            <div className="research-code">{projectCode(selectedProject)}</div><h3>{selectedProject.title}</h3><p>{clean(selectedProject.impact)}</p>
            <dl><dt>Technology</dt><dd>{selectedProject.stack.join(" · ")}</dd><dt>Coverage</dt><dd>{selectedProject.icon ?? "software / systems"}</dd></dl>
            <div className="research-links">{selectedProject.links.map((link) => <a key={link.label} href={externalHref(link.href)}>{link.label}<span>↗</span></a>)}</div>
          </aside>
        </section>

        <section className="exposure-section" id="exposure">
          <div className="section-bar"><div><span>03</span><h2>Factor Exposure</h2></div><p>Full-stack breadth grouped by the engineering outcomes each capability supports.</p></div>
          <div className="exposure-grid">
            {profileContent.skillClusters.map((cluster, index) => <article className="panel" key={cluster.title}><header><span>FACTOR 0{index + 1}</span><small>ACTIVE</small></header><h3>{cluster.title}</h3><p>{cluster.summary}</p><div>{cluster.items.map((item) => <span key={item}>{item}</span>)}</div></article>)}
          </div>
        </section>
      </main>

      <footer><span>JB CAPITAL / PORTFOLIO TERMINAL</span><p>Market widgets are provided by TradingView and may be real-time or delayed by exchange. This site does not execute trades or provide investment advice.</p><div><a href={mainSiteHref()}>HOME</a><a href={`mailto:${profileContent.email}`}>CONTACT</a><a href="#workspace">TOP ↑</a></div></footer>
    </div>
  );
}

export default App;
