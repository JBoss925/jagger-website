import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import {
  ACESFilmicToneMapping,
  Color,
  Group,
  InstancedMesh,
  MathUtils,
  Object3D,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { CUBE_COUNT } from "./CubeFormations";
import {
  ALL_EXHIBITS,
  MUSEUM_GROUPS,
  evaluateExhibitHero,
  evaluateExhibitMini,
  getExhibitById,
  getExhibitByNumber,
  type MuseumExhibit,
} from "./sculptureCatalog";
import { soundEngine } from "./soundEngine";
import "./museum.css";

type StageViewMode = "both" | "large" | "small";
type FilterMode =
  | "all"
  | "active"
  | "userFavorite"
  | "aiFavorite"
  | "season3"
  | "contenders"
  | "past"
  | "Experience"
  | "Projects"
  | "About";

const MINI_COUNT = 12;

type CubePose = {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  scale: number;
  color: Color;
  startX: number;
  startY: number;
  startZ: number;
  startScale: number;
  delay: number;
};

function easeOutBack(t: number, overshoot = 1.08): number {
  const c1 = overshoot;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function MuseumSwarm({
  exhibit,
  viewMode,
  isBlind,
}: {
  exhibit: MuseumExhibit;
  viewMode: StageViewMode;
  isBlind: boolean;
}) {
  const heroMeshRef = useRef<InstancedMesh>(null);
  const miniMeshRef = useRef<InstancedMesh>(null);
  const rigRef = useRef<Group>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const tmpColor = useMemo(() => new Color(), []);
  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 5, 0.125), []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const timelineRef = useRef(0);
  const transitionStartRef = useRef(performance.now());
  const lastExhibitIdRef = useRef("");

  const heroStatesRef = useRef<CubePose[] | null>(null);
  if (!heroStatesRef.current) {
    heroStatesRef.current = Array.from({ length: CUBE_COUNT }, (_, i) => ({
      x: 0,
      y: 0,
      z: 0,
      rx: 0,
      ry: 0,
      rz: 0,
      scale: 0.16,
      color: new Color("#9f82e6"),
      startX: 0,
      startY: 0,
      startZ: 0,
      startScale: 0.16,
      delay: (i / CUBE_COUNT) * 0.14,
    }));
  }

  const miniStatesRef = useRef<CubePose[] | null>(null);
  if (!miniStatesRef.current) {
    miniStatesRef.current = Array.from({ length: MINI_COUNT }, (_, i) => ({
      x: 3.1,
      y: 0,
      z: 0,
      rx: 0,
      ry: 0,
      rz: 0,
      scale: 0.16,
      color: new Color("#9f82e6"),
      startX: 3.1,
      startY: 0,
      startZ: 0,
      startScale: 0.16,
      delay: (i / MINI_COUNT) * 0.1,
    }));
  }

  useEffect(() => {
    const key = `${exhibit.id}:${viewMode}`;
    if (lastExhibitIdRef.current === key) return;
    lastExhibitIdRef.current = key;
    transitionStartRef.current = performance.now();

    const snap = (arr: CubePose[] | null) => {
      if (!arr) return;
      for (let i = 0; i < arr.length; i++) {
        const s = arr[i];
        s.startX = s.x;
        s.startY = s.y;
        s.startZ = s.z;
        s.startScale = s.scale;
        s.delay = ((i % 24) / 24) * 0.14;
      }
    };
    snap(heroStatesRef.current);
    snap(miniStatesRef.current);
  }, [exhibit.id, viewMode]);

  useFrame(({ pointer }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.08);
    timelineRef.current += delta;
    const t = isBlind ? 1.15 : timelineRef.current;
    const elapsed = isBlind
      ? 10
      : Math.max(0, (performance.now() - transitionStartRef.current) / 1000);

    if (rigRef.current) {
      rigRef.current.rotation.y = MathUtils.damp(
        rigRef.current.rotation.y,
        isBlind ? 0 : pointer.x * 0.18,
        4.5,
        delta,
      );
      rigRef.current.rotation.x = MathUtils.damp(
        rigRef.current.rotation.x,
        isBlind ? 0 : -pointer.y * 0.1,
        4.5,
        delta,
      );
    }

    const showLarge = viewMode === "both" || viewMode === "large";
    const showSmall = viewMode === "both" || viewMode === "small";
    const heroCenterX = viewMode === "both" ? -1.35 : 0;
    const miniCenterX = viewMode === "both" ? 3.15 : 0;
    const miniBoost = viewMode === "small" ? 2.4 : 1.7;
    const duration = 0.42;

    const heroMesh = heroMeshRef.current;
    const heroStates = heroStatesRef.current;
    if (heroMesh && heroStates) {
      for (let i = 0; i < CUBE_COUNT; i++) {
        const st = heroStates[i];
        const tgt = evaluateExhibitHero(exhibit, i, t, heroCenterX, -0.05);
        const tgtScale = showLarge ? tgt.scale : 0.0001;

        if (elapsed >= st.delay + duration || isBlind) {
          if (isBlind) {
            st.x = tgt.x;
            st.y = tgt.y;
            st.z = tgt.z;
            st.rx = tgt.rx;
            st.ry = tgt.ry;
            st.rz = tgt.rz;
            st.scale = tgtScale;
          } else {
            const rate = 13;
            st.x = MathUtils.damp(st.x, tgt.x, rate, delta);
            st.y = MathUtils.damp(st.y, tgt.y, rate, delta);
            st.z = MathUtils.damp(st.z, tgt.z, rate, delta);
            st.rx = MathUtils.damp(st.rx, tgt.rx, rate, delta);
            st.ry = MathUtils.damp(st.ry, tgt.ry, rate, delta);
            st.rz = MathUtils.damp(st.rz, tgt.rz, rate, delta);
            st.scale = MathUtils.damp(st.scale, tgtScale, rate, delta);
          }
        } else if (elapsed > st.delay) {
          const p = MathUtils.clamp((elapsed - st.delay) / duration, 0, 1);
          const e = easeOutBack(p, 1.05);
          const arc = Math.sin(p * Math.PI);
          st.x = MathUtils.lerp(st.startX, tgt.x, e);
          st.y = MathUtils.lerp(st.startY, tgt.y, e) + arc * 0.28;
          st.z = MathUtils.lerp(st.startZ, tgt.z, e) + arc * 0.4;
          st.rx = tgt.rx;
          st.ry = tgt.ry;
          st.rz = tgt.rz;
          st.scale = MathUtils.lerp(st.startScale, tgtScale, Math.min(1, p * 1.4));
        }

        dummy.position.set(st.x, st.y, st.z);
        dummy.rotation.set(st.rx, st.ry, st.rz);
        dummy.scale.setScalar(Math.max(0.0001, st.scale));
        dummy.updateMatrix();
        heroMesh.setMatrixAt(i, dummy.matrix);

        tmpColor.set(tgt.color);
        if (isBlind) st.color.copy(tmpColor);
        else st.color.lerp(tmpColor, 1 - Math.exp(-delta * 10));
        heroMesh.setColorAt(i, st.color);
      }
      heroMesh.instanceMatrix.needsUpdate = true;
      if (heroMesh.instanceColor) heroMesh.instanceColor.needsUpdate = true;
    }

    const miniMesh = miniMeshRef.current;
    const miniStates = miniStatesRef.current;
    if (miniMesh && miniStates) {
      for (let i = 0; i < MINI_COUNT; i++) {
        const st = miniStates[i];
        const m = evaluateExhibitMini(exhibit, i, MINI_COUNT, t, miniBoost);
        const tx = miniCenterX + m.dx;
        const ty = -0.1 + m.dy;
        const tz = 0.55 + m.dz;
        const tgtScale = showSmall ? m.scale : 0.0001;

        if (isBlind) {
          st.x = tx;
          st.y = ty;
          st.z = tz;
          st.rx = m.rx;
          st.ry = m.ry;
          st.rz = m.rz;
          st.scale = tgtScale;
        } else {
          const rate = 13;
          st.x = MathUtils.damp(st.x, tx, rate, delta);
          st.y = MathUtils.damp(st.y, ty, rate, delta);
          st.z = MathUtils.damp(st.z, tz, rate, delta);
          st.rx = MathUtils.damp(st.rx, m.rx, rate, delta);
          st.ry = MathUtils.damp(st.ry, m.ry, rate, delta);
          st.rz = MathUtils.damp(st.rz, m.rz, rate, delta);
          st.scale = MathUtils.damp(st.scale, tgtScale, rate, delta);
        }

        dummy.position.set(st.x, st.y, st.z);
        dummy.rotation.set(st.rx, st.ry, st.rz);
        dummy.scale.setScalar(Math.max(0.0001, st.scale));
        dummy.updateMatrix();
        miniMesh.setMatrixAt(i, dummy.matrix);

        tmpColor.set(m.color);
        if (isBlind) st.color.copy(tmpColor);
        else st.color.lerp(tmpColor, 1 - Math.exp(-delta * 10));
        miniMesh.setColorAt(i, st.color);
      }
      miniMesh.instanceMatrix.needsUpdate = true;
      if (miniMesh.instanceColor) miniMesh.instanceColor.needsUpdate = true;
    }
  });

  const heroPlinthX = viewMode === "both" ? -1.35 : 0;
  const miniPlinthX = viewMode === "both" ? 3.15 : 0;

  return (
    <group ref={rigRef}>
      {(viewMode === "both" || viewMode === "large") && (
        <>
          <pointLight
            position={[heroPlinthX, 0.1, 1.2]}
            color={exhibit.palette.glow}
            intensity={2.6}
            distance={6}
            decay={2}
          />
          <ContactShadows
            position={[heroPlinthX, -2.2, 0.1]}
            opacity={0.26}
            scale={6.2}
            blur={2.5}
            far={5}
            resolution={256}
            frames={1}
            color="#472b8f"
          />
        </>
      )}
      {(viewMode === "both" || viewMode === "small") && (
        <ContactShadows
          position={[miniPlinthX, -1.65, 0.1]}
          opacity={0.22}
          scale={3.6}
          blur={2.2}
          far={4}
          resolution={128}
          frames={1}
          color="#472b8f"
        />
      )}

      <instancedMesh ref={heroMeshRef} args={[geometry, undefined, CUBE_COUNT]} frustumCulled={false}>
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.09}
          metalness={0.06}
          clearcoat={1}
          clearcoatRoughness={0.04}
          ior={1.52}
          reflectivity={1}
          iridescence={0.44}
          iridescenceIOR={1.36}
          envMapIntensity={1.42}
        />
      </instancedMesh>

      <instancedMesh ref={miniMeshRef} args={[geometry, undefined, MINI_COUNT]} frustumCulled={false}>
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.09}
          metalness={0.06}
          clearcoat={1}
          clearcoatRoughness={0.04}
          ior={1.52}
          reflectivity={1}
          iridescence={0.44}
          iridescenceIOR={1.36}
          envMapIntensity={1.42}
        />
      </instancedMesh>
    </group>
  );
}

export default function MuseumPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isBlind = searchParams.get("blind") === "1";

  const initialExhibit = useMemo(() => {
    const exParam = searchParams.get("exhibit");
    if (exParam) {
      const asNum = Number(exParam);
      if (!Number.isNaN(asNum)) {
        const byNum = getExhibitByNumber(asNum);
        if (byNum) return byNum;
      }
      const byId = getExhibitById(exParam);
      if (byId) return byId;
    }
    return ALL_EXHIBITS[0];
  }, [searchParams]);

  const [selectedId, setSelectedId] = useState(initialExhibit.id);
  const [viewMode, setViewMode] = useState<StageViewMode>(isBlind ? "large" : "both");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [query, setQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    setSelectedId(initialExhibit.id);
  }, [initialExhibit.id]);

  const selected = useMemo(
    () => ALL_EXHIBITS.find((e) => e.id === selectedId) ?? ALL_EXHIBITS[0],
    [selectedId],
  );

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MUSEUM_GROUPS.map((g) => {
      const exhibits = g.exhibits.filter((ex) => {
        if (filterMode === "Experience" && ex.sectionLabel !== "Experience") return false;
        if (filterMode === "Projects" && ex.sectionLabel !== "Projects") return false;
        if (filterMode === "About" && ex.sectionLabel !== "About") return false;
        if (filterMode === "active" && !ex.isActive) return false;
        if (filterMode === "userFavorite" && !ex.isUserFavorite) return false;
        if (filterMode === "aiFavorite" && !ex.isAiFavorite) return false;
        if (filterMode === "season3" && ex.era !== "Season 3") return false;
        if (
          filterMode === "contenders" &&
          ex.era !== "Contender A" &&
          ex.era !== "Contender B" &&
          ex.era !== "Season 2" &&
          ex.era !== "Season 3" &&
          ex.era !== "Bracket Winner"
        ) {
          return false;
        }
        if (filterMode === "past" && !ex.era.startsWith("Past") && ex.era !== "Previous") {
          return false;
        }
        if (!q) return true;
        const badgeText = [
          ex.isActive ? "active live" : "",
          ex.isUserFavorite ? "your pick favorite" : "",
          ex.isAiFavorite ? "ai favorite council" : "",
        ].join(" ");
        const hay = `${ex.code} ${ex.number} ${g.title} ${ex.name} ${ex.era} ${badgeText} ${ex.notes} ${ex.blindGuess}`.toLowerCase();
        return hay.includes(q);
      });
      return { ...g, exhibits };
    }).filter((g) => g.exhibits.length > 0);
  }, [filterMode, query]);

  const flatVisible = useMemo(
    () => filteredGroups.flatMap((g) => g.exhibits),
    [filteredGroups],
  );

  const selectExhibit = (ex: MuseumExhibit) => {
    setSelectedId(ex.id);
    soundEngine.playSelect(ex.number);
    const next = new URLSearchParams(searchParams);
    next.set("exhibit", String(ex.number));
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if (isBlind) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        const idx = flatVisible.findIndex((x) => x.id === selected.id);
        const next = flatVisible[(idx + 1) % Math.max(1, flatVisible.length)];
        if (next) selectExhibit(next);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        const idx = flatVisible.findIndex((x) => x.id === selected.id);
        const prev =
          flatVisible[(idx - 1 + flatVisible.length) % Math.max(1, flatVisible.length)];
        if (prev) selectExhibit(prev);
      } else if (e.key === " ") {
        e.preventDefault();
        setViewMode((m) => (m === "both" ? "large" : m === "large" ? "small" : "both"));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [flatVisible, isBlind, selected.id]);

  // Clean zero-HUD blind render mode for unbiased sub-agent evaluation!
  if (isBlind) {
    return (
      <div className="museum-blind-stage">
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [0, 0.2, 10.6], fov: 40 }}
          gl={{
            alpha: true,
            antialias: true,
            toneMapping: ACESFilmicToneMapping,
            toneMappingExposure: 1.04,
          }}
        >
          <ambientLight intensity={0.34} color="#f5efff" />
          <hemisphereLight args={["#ffffff", "#5a3fa3", 0.58]} />
          <directionalLight position={[6, 9, 8]} intensity={2.15} color="#ffffff" />
          <directionalLight position={[-7, 3, -4]} intensity={1.35} color="#c0a3ff" />
          <directionalLight position={[2, -6, 3]} intensity={0.48} color="#f4c7e4" />
          <Environment resolution={256} frames={1}>
            <Lightformer form="rect" intensity={3.2} color="#ffffff" scale={[11, 5, 1]} position={[0, 7, 5]} rotation={[Math.PI / 3, 0, 0]} />
            <Lightformer form="rect" intensity={2.2} color="#d6bfff" scale={[6, 10, 1]} position={[-8, 2, 3]} rotation={[0, Math.PI / 2.6, 0]} />
            <Lightformer form="circle" intensity={1.6} color="#f7d2eb" scale={5} position={[6, 3, 6]} rotation={[0, -Math.PI / 3, 0]} />
            <Lightformer form="rect" intensity={0.35} color="#1e1240" scale={[14, 10, 1]} position={[8, -1, -2]} rotation={[0, -Math.PI / 2.2, 0]} />
            <Lightformer form="rect" intensity={0.35} color="#261852" scale={[14, 8, 1]} position={[-4, -7, -3]} rotation={[-Math.PI / 2.4, 0, 0]} />
          </Environment>
          <MuseumSwarm exhibit={selected} viewMode="large" isBlind={true} />
        </Canvas>
      </div>
    );
  }

  return (
    <div className="museum-shell">
      <aside className="museum-sidebar">
        <div className="museum-sidebar__head">
          <div className="museum-title-row">
            <a href="/" className="museum-back" title="Back to portfolio">
              ← Portfolio
            </a>
            <span className="museum-count">
              {ALL_EXHIBITS.length} exhibits · {MUSEUM_GROUPS.length} subjects
            </span>
          </div>
          <h1>Sculpture Museum</h1>
          <p>
            Every past, current, and bracket sculpture idea — numbered so you can pick exact favorites.
            Use <kbd>↑</kbd> <kbd>↓</kbd> to step fast, <kbd>Space</kbd> to toggle Large/Small.
          </p>

          <input
            type="search"
            className="museum-search"
            placeholder="Filter by #number, subject, or idea..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="museum-filters" role="group" aria-label="Filter exhibits">
            {(
              [
                ["all", "All"],
                ["active", "★ Active"],
                ["userFavorite", "♥ Your Picks"],
                ["aiFavorite", "✦ AI Picks"],
                ["season3", "Season 3"],
                ["contenders", "Bracket"],
                ["past", "Past"],
                ["Experience", "Exp"],
                ["Projects", "Proj"],
                ["About", "About"],
              ] as Array<[FilterMode, string]>
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                className={filterMode === val ? "is-selected" : undefined}
                onClick={() => setFilterMode(val)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="museum-list">
          {filteredGroups.map((group) => (
            <section key={group.id} className="museum-group">
              <header className="museum-group__head">
                <span
                  className="museum-group__dot"
                  style={{ background: group.palette.primary }}
                />
                <div>
                  <h2>{group.title}</h2>
                  <small>
                    {group.sectionLabel} · {group.subtitle}
                  </small>
                </div>
              </header>

              <ul className="museum-group__items">
                {group.exhibits.map((ex) => {
                  const isCurrent = ex.id === selected.id;
                  return (
                    <li key={ex.id}>
                      <button
                        type="button"
                        className={`museum-item ${isCurrent ? "is-selected" : ""} ${ex.isActive ? "is-active-live" : ""}`}
                        onClick={() => selectExhibit(ex)}
                      >
                        <span className="museum-item__num">{ex.code}</span>
                        <span className="museum-item__body">
                          <span className="museum-item__name">{ex.name}</span>
                          <span className="museum-item__meta">
                            {ex.isActive && (
                              <span className="museum-badge museum-badge--active">★ Active</span>
                            )}
                            {ex.isUserFavorite && (
                              <span className="museum-badge museum-badge--user">♥ Your Pick</span>
                            )}
                            {ex.isAiFavorite && (
                              <span className="museum-badge museum-badge--ai">✦ AI Favorite</span>
                            )}
                            <span className={`museum-era museum-era--${ex.era.toLowerCase().replace(/\s+/g, "-")}`}>
                              {ex.era}
                            </span>
                            <span className="museum-score">{ex.councilScore}</span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </aside>

      <main className="museum-stage">
        <div className="museum-stage__toolbar">
          <div className="museum-stage__badge">
            <span className="museum-code-pill">{selected.code}</span>
            <strong>{selected.groupTitle}</strong>
            <span className="museum-sep">/</span>
            <span>{selected.name}</span>
          </div>

          <div className="museum-view-switch" role="group" aria-label="Sculpture scale mode">
            {(
              [
                ["both", "Large + Small"],
                ["large", "Large (120)"],
                ["small", "Small (Mini)"],
              ] as Array<[StageViewMode, string]>
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                className={viewMode === mode ? "is-selected" : undefined}
                onClick={() => setViewMode(mode)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="museum-canvas-wrap">
          <Canvas
            dpr={[1, 1.75]}
            camera={{ position: [0, 0.25, 11.4], fov: 40 }}
            gl={{
              alpha: true,
              antialias: true,
              toneMapping: ACESFilmicToneMapping,
              toneMappingExposure: 1.04,
            }}
          >
            <ambientLight intensity={0.34} color="#f5efff" />
            <hemisphereLight args={["#ffffff", "#5a3fa3", 0.58]} />
            <directionalLight position={[6, 9, 8]} intensity={2.15} color="#ffffff" />
            <directionalLight position={[-7, 3, -4]} intensity={1.35} color="#c0a3ff" />
            <directionalLight position={[2, -6, 3]} intensity={0.48} color="#f4c7e4" />
            <Environment resolution={256} frames={1}>
              <Lightformer form="rect" intensity={3.2} color="#ffffff" scale={[11, 5, 1]} position={[0, 7, 5]} rotation={[Math.PI / 3, 0, 0]} />
              <Lightformer form="rect" intensity={2.2} color="#d6bfff" scale={[6, 10, 1]} position={[-8, 2, 3]} rotation={[0, Math.PI / 2.6, 0]} />
              <Lightformer form="circle" intensity={1.6} color="#f7d2eb" scale={5} position={[6, 3, 6]} rotation={[0, -Math.PI / 3, 0]} />
              <Lightformer form="rect" intensity={0.35} color="#1e1240" scale={[14, 10, 1]} position={[8, -1, -2]} rotation={[0, -Math.PI / 2.2, 0]} />
              <Lightformer form="rect" intensity={0.35} color="#261852" scale={[14, 8, 1]} position={[-4, -7, -3]} rotation={[-Math.PI / 2.4, 0, 0]} />
            </Environment>
            <MuseumSwarm exhibit={selected} viewMode={viewMode} isBlind={false} />
          </Canvas>

          {viewMode === "both" && (
            <div className="museum-plinth-labels" aria-hidden="true">
              <span className="museum-plinth-label museum-plinth-label--large">
                LARGE HERO · 120 CUBES
              </span>
              <span className="museum-plinth-label museum-plinth-label--small">
                SMALL OVERVIEW · 12 CUBES
              </span>
            </div>
          )}
        </div>

        <footer className="museum-inspector">
          <div className="museum-inspector__info">
            <div className="museum-inspector__row">
              {selected.isActive && (
                <span className="museum-badge-lg museum-badge--active">★ Active on Site</span>
              )}
              {selected.isUserFavorite && (
                <span className="museum-badge-lg museum-badge--user">♥ Your Favorite</span>
              )}
              {selected.isAiFavorite && (
                <span className="museum-badge-lg museum-badge--ai">✦ AI Council Favorite</span>
              )}
              <span className="museum-era-lg">{selected.era}</span>
              <span className="museum-score-lg">{selected.councilScore}</span>
            </div>
            <p className="museum-inspector__notes">{selected.notes}</p>
            <p className="museum-inspector__blind">
              <strong>Blind intuition test:</strong> “{selected.blindGuess}”
            </p>
          </div>

          <div className="museum-inspector__actions">
            <button
              type="button"
              className="museum-nav-btn"
              onClick={() => {
                const idx = flatVisible.findIndex((x) => x.id === selected.id);
                const prev =
                  flatVisible[(idx - 1 + flatVisible.length) % Math.max(1, flatVisible.length)];
                if (prev) selectExhibit(prev);
              }}
            >
              ← Prev
            </button>
            <button
              type="button"
              className="museum-nav-btn"
              onClick={() => {
                const idx = flatVisible.findIndex((x) => x.id === selected.id);
                const next = flatVisible[(idx + 1) % Math.max(1, flatVisible.length)];
                if (next) selectExhibit(next);
              }}
            >
              Next →
            </button>
            <button
              type="button"
              className="museum-copy-btn"
              onClick={() => {
                void navigator.clipboard?.writeText(
                  `${selected.code} (${selected.groupTitle}: ${selected.name})`,
                );
                setCopiedCode(selected.code);
                window.setTimeout(() => setCopiedCode(null), 1600);
              }}
            >
              {copiedCode === selected.code ? `Copied ${selected.code}!` : `Copy ${selected.code}`}
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
