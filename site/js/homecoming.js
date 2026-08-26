/* ============================================================
 * homecoming.js — 藏红花回家 · 官网（白皮书网页演示版）
 * ------------------------------------------------------------
 * S0 开场：Cesium 地球俯冲青藏高原（空间维度）
 * S1~S5：五段叙事（Cesium / SVG / KG 轮换，Phase A 先占位）
 * S6：天旺的角色收束
 * 滚动：IntersectionObserver 分段激活 + 左侧五段导航指示
 *
 * 加固（2026-08-19）：
 *  - Cesium 多 CDN 回退：npmmirror → jsdelivr → unpkg（国内可达）
 *  - 底图回退：Esri 卫星 → Carto 暗色（keyless、稳定）
 *  - 最终兜底：全部失败时绘制静态 SVG 神山剪影，保证开场不空白
 * ============================================================ */

const Homecoming = {
  viewer: null,
  sections: [],
  activeStage: 0,
  anchors: [],
  routes: {},
  stages: []
};

/* ---------- Cesium 多 CDN 加载（非阻塞 + 回退 + 内置布局 CSS） ---------- */
const CESIUM_CDNS = [
  "https://registry.npmmirror.com/cesium/1.107.0/files/Build/Cesium/Cesium.js",
  "https://cdn.jsdelivr.net/npm/cesium@1.107.0/Build/Cesium/Cesium.js",
  "https://unpkg.com/cesium@1.107.0/Build/Cesium/Cesium.js"
];
// Cesium Ion token：必须在创建 Viewer 之前设置（对齐 kailash 已验证做法，三维地形依赖它）
const CESIUM_ION_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZDY0YWY3Yy1mZmQ1LTQ2MjgtYTRjZi01OTM0NzQ3YjljOGMiLCJpZCI6NDM2NzA2LCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3Nzk4MDU4MjZ9.80efk41binldWGgit3mGqqZ3keritykzZUoNw0qoQc0";
function applyIonToken() {
  try { if (window.Cesium && CESIUM_ION_TOKEN) window.Cesium.Ion.defaultAccessToken = CESIUM_ION_TOKEN; } catch (e) {}
}
// 关键：让 Cesium viewer 始终撑满 #hero-globe，不依赖外网 widgets.css（缺失会导致容器塌缩成小框）
const CESIUM_LAYOUT_CSS = `
  #hero-globe, #hero-globe > .cesium-widget, #hero-globe .cesium-viewer,
  #hero-globe .cesium-viewer-cesiumWidgetContainer, #hero-globe .cesium-viewer-main,
  #hero-globe .cesium-widget canvas { width:100% !important; height:100% !important; }
  #hero-globe .cesium-widget, #hero-globe .cesium-viewer,
  #hero-globe .cesium-viewer-cesiumWidgetContainer { position:absolute; top:0; left:0; }
  #hero-globe .cesium-viewer-bottom { left:0 !important; }
  .cesium-credit-logoContainer, .cesium-credit-expand-link { display:none !important; }
`;

function injectCesiumCss() {
  if (document.getElementById("sn-cesium-css")) return;
  const st = document.createElement("style");
  st.id = "sn-cesium-css";
  st.textContent = CESIUM_LAYOUT_CSS;
  document.head.appendChild(st);
}

function loadCesiumCss(cdnBase) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = cdnBase.replace("Cesium.js", "Widgets/widgets.css");
  document.head.appendChild(link);
}

function loadCesiumWithFallback(cdnIdx) {
  injectCesiumCss(); // 内联布局兜底，任何情况下 viewer 都全屏
  if (typeof window.Cesium !== "undefined") {
    applyIonToken();
    initCesium();
    return;
  }
  const idx = cdnIdx || 0;
  if (idx >= CESIUM_CDNS.length) {
    console.warn("[homecoming] 所有 Cesium CDN 均不可达，使用静态 SVG 兜底");
    showStaticFallback();
    return;
  }
  const script = document.createElement("script");
  script.src = CESIUM_CDNS[idx];
  script.onload = () => { applyIonToken(); loadCesiumCss(CESIUM_CDNS[idx]); initCesium(); ensureRouteGlobe(); };
  script.onerror = () => loadCesiumWithFallback(idx + 1);
  document.head.appendChild(script);
}

/* ---------- 静态 SVG 兜底（神山剪影） ---------- */
function showStaticFallback() {
  const el = document.getElementById("hero-globe");
  if (!el) return;
  el.classList.add("globe-fallback");
  el.innerHTML = `<svg viewBox="0 0 1440 720" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;opacity:.9">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0a1226"/><stop offset="60%" stop-color="#16224a"/><stop offset="100%" stop-color="#2a3a63"/>
      </linearGradient>
      <linearGradient id="snow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#eef1f6"/><stop offset="100%" stop-color="#9fb0cc"/>
      </linearGradient>
    </defs>
    <rect width="1440" height="720" fill="url(#sky)"/>
    <circle cx="1120" cy="150" r="46" fill="#e8c766" opacity="0.85"/>
    <path d="M0 720 L220 320 L380 520 L560 200 L760 520 L900 380 L1120 260 L1440 600 L1440 720 Z" fill="#1c2a4a"/>
    <path d="M560 200 L600 288 L560 288 Z M760 520 L800 428 L840 520 Z" fill="url(#snow)" opacity="0.9"/>
    <text x="1120" y="210" font-family="'Noto Serif SC',serif" font-size="20" fill="#e8c766" text-anchor="middle">米瑞 · 2945m</text>
  </svg>`;
}

/* ---------- S0 · Cesium 开场 ---------- */
function initCesium() {
  const el = document.getElementById("hero-globe");
  if (!el) return;
  if (typeof window.Cesium === "undefined") {
    showStaticFallback();
    return;
  }
  const Cesium = window.Cesium;
  try {
    // 底图池（全部用 UrlTemplateImageryProvider——同步初始化 Resource，稳定，无 getDerivedResource 崩溃）
    const providers = {
      // ① Esri 世界影像（WGS-84 精确，海外最佳；ArcGIS REST 瓦片模板）
      esri: new Cesium.UrlTemplateImageryProvider({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        credit: "© Esri World Imagery",
        minimumLevel: 0, maximumLevel: 19
      }),
      // ② 高德卫星（国内可达、免 key；webst 影像主机）
      gaode: new Cesium.UrlTemplateImageryProvider({
        url: "https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
        subdomains: ["1", "2", "3", "4"],
        credit: "© 高德地图",
        minimumLevel: 0, maximumLevel: 19
      }),
      // ③ Carto 暗色（最稳兜底）
      carto: new Cesium.UrlTemplateImageryProvider({
        url: "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        credit: "© OpenStreetMap © CARTO"
      })
    };

    const viewer = new Cesium.Viewer("hero-globe", {
      animation: false, timeline: false, baseLayerPicker: false,
      fullscreenButton: false, geocoder: false, homeButton: false,
      infoBox: false, sceneModePicker: false, navigationHelpButton: false,
      selectionIndicator: false, creditContainer: document.createElement("div")
      // 不覆盖 baseLayer/terrain —— 用默认（Ion token 已提前设置），确保三维地形正常加载（对齐 kailash 已验证做法）
    });
    Homecoming.viewer = viewer;
    try { viewer.scene.globe.enableLighting = true; } catch (e) {}
    try { viewer.scene.skyAtmosphere.show = true; } catch (e) {}
    try { viewer.scene.globe.depthTestAgainstTerrain = false; } catch (e) {}
    // 金色时刻光照：用可控的暖色低角度定向光模拟日出/日落，让立体地形更富层次、更明亮
    try {
      const dir = new Cesium.Cartesian3(0.55, 0.35, -0.75); // 从低角度斜照（东北向下），营造侧光立体感
      Cesium.Cartesian3.normalize(dir, dir);
      viewer.scene.light = new Cesium.DirectionalLight({ direction: dir, intensity: 3.2 });
    } catch (e) {
      console.warn("[homecoming] 金色时刻光照设置失败（回退太阳光）：", e && e.message);
    }
    // 提亮影像（gamma），弥补低角度光造成的偏暗
    try {
      for (let i = 0; i < viewer.imageryLayers.length; i++) {
        const layer = viewer.imageryLayers.get(i);
        if (layer) layer.gamma = 1.18;
      }
    } catch (e) {}
    const terrStatus = document.createElement("div");
    terrStatus.textContent = "地形: 加载中…";
    terrStatus.style.cssText = "position:absolute;right:120px;bottom:22px;z-index:6;font-size:11px;color:#9aa3b5;background:rgba(10,14,23,.6);padding:5px 10px;border-radius:14px;border:1px solid rgba(255,255,255,.15)";
    document.getElementById("hero").appendChild(terrStatus);
    const setTerr = (txt) => { terrStatus.textContent = txt; };
    try {
      if (Cesium.CesiumTerrainProvider && Cesium.CesiumTerrainProvider.fromIonAssetId) {
        Cesium.CesiumTerrainProvider.fromIonAssetId(1)
          .then((terrain) => {
            viewer.terrainProvider = terrain;
            console.log("[homecoming] ✅ 三维地形已加载（Cesium World Terrain, 真实立体地形）");
            setTerr("地形 ✓ 已加载");
          })
          .catch((e) => {
            console.warn("[homecoming] ⚠️ 三维地形加载失败：", e && (e.message || e));
            setTerr("地形 ✗ 未加载（" + ((e && e.message) || "未知") + "）");
          });
      } else {
        // 旧版回退
        Cesium.createWorldTerrain().then((terrain) => {
          viewer.terrainProvider = terrain;
          setTerr("地形 ✓ 已加载");
        }).catch((e) => {
          console.warn("[homecoming] createWorldTerrain 失败：", e && (e.message || e));
          setTerr("地形 ✗ 未加载");
        });
      }
    } catch (e) {
      console.warn("[homecoming] 地形启用异常：", e && e.message);
      setTerr("地形 ✗ 异常");
    }
    // 容器稳定后强制 resize，防止初始化为小尺寸
    setTimeout(() => { try { viewer.resize(); } catch (e) {} }, 300);

    // ---- 底图看门狗：检测"一直没渲染出瓦片"并自动换源 ----
    let tilesShown = false;
    let manualSwitch = false;
    viewer.scene.globe.tileLoadProgressEvent.addEventListener((remaining) => {
      if (remaining === 0) tilesShown = true;
    });
    const swapBaseLayer = (key) => {
      const p = providers[key];
      if (!p) return;
      console.warn(`[homecoming] 底图切换 → ${key}`);
      viewer.imageryLayers.removeAll();
      viewer.imageryLayers.addImageryProvider(p);
    };
    const sequence = [["gaode", 8000], ["carto", 8000]];
    (function watchdog(idx) {
      setTimeout(() => {
        if (tilesShown || manualSwitch) return; // 已出图或用户已手选，保持
        if (idx >= sequence.length) return;
        swapBaseLayer(sequence[idx][0]);
        watchdog(idx + 1);
      }, sequence[idx] ? sequence[idx][1] : 8000);
    })(0);

    // 卫星源显式报错 → 立即切高德
    providers.esri.errorEvent.addEventListener(() => swapBaseLayer("gaode"));

    // ---- 手动底图切换（右下角，用户可自行选择） ----
    const sw = document.createElement("div");
    sw.style.cssText = "position:absolute;right:18px;bottom:18px;z-index:6;display:flex;gap:8px";
    sw.innerHTML = `
      <button data-k="esri" style="padding:6px 12px;font-size:11px;border-radius:16px;border:1px solid rgba(255,255,255,.3);background:rgba(10,14,23,.6);color:#e5e7eb;cursor:pointer">🛰️ 全球卫星</button>
      <button data-k="gaode" style="padding:6px 12px;font-size:11px;border-radius:16px;border:1px solid rgba(255,255,255,.3);background:rgba(10,14,23,.6);color:#e5e7eb;cursor:pointer">🇨🇳 高德卫星</button>
      <button data-k="carto" style="padding:6px 12px;font-size:11px;border-radius:16px;border:1px solid rgba(255,255,255,.3);background:rgba(10,14,23,.6);color:#e5e7eb;cursor:pointer">🌑 暗色</button>`;
    sw.addEventListener("click", (e) => {
      const k = e.target.dataset.k;
      if (k) { manualSwitch = true; swapBaseLayer(k); }
    });
    document.getElementById("hero").appendChild(sw);

    // 开场：太空视角 → 俯冲下降 → 定格 KMZ「定位视角」的三维透视
    // （数据来源：Google Earth Pro 定位视角.kmz 的 <LookAt>）
    const HERO_VIEW = {
      lng: 94.57047582677238,
      lat: 29.49010703732081,
      heading: 46.61228662271247,   // 方位角 0=北 顺时针
      tilt: 77.10844854287973,      // 与天顶夹角 0=正顶 90=水平
      range: 4366.567387561417,     // 相机到目标视距（米）
      targetH: 3080                 // 目标高度（基地海拔 2945m 上方，防相机入地）
    };
    // KML tilt → Cesium pitch（俯角 = 90° - tilt；负值为向下看）
    const pitchRad = Cesium.Math.toRadians(-(90 - HERO_VIEW.tilt));
    const headingRad = Cesium.Math.toRadians(HERO_VIEW.heading);
    // 目标点（基地上空）——lookAt 会权威地将相机对准该点
    const heroTargetBase = Cesium.Cartesian3.fromDegrees(HERO_VIEW.lng, HERO_VIEW.lat, HERO_VIEW.targetH);
    // 落地函数：采样真实地形高度后精确落位定格（保证相机权威定格在 KMZ 终点视角）
    const landHeroView = () => {
      let groundH = HERO_VIEW.targetH;
      try {
        const h = viewer.scene.globe.getHeight(Cesium.Cartographic.fromDegrees(HERO_VIEW.lng, HERO_VIEW.lat));
        if (h !== undefined && !isNaN(h)) groundH = h + 20;
      } catch (e) {}
      const target = Cesium.Cartesian3.fromDegrees(HERO_VIEW.lng, HERO_VIEW.lat, groundH);
      viewer.camera.lookAt(target, new Cesium.HeadingPitchRange(headingRad, pitchRad, HERO_VIEW.range));
      // 解锁矩阵变换，使视角保持在此终点姿态且允许自然微调
      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      console.log("[homecoming] ✅ 已权威锁定并保持 KMZ 三维终点定位视角");
    };

    // 初始化时直接定格到最终定位视角
    landHeroView();

    // 顺滑开场：从高空快速俯冲并精确定格在终点视角（2.5 秒极速完成）
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(HERO_VIEW.lng, HERO_VIEW.lat, 28000),
      orientation: { heading: headingRad, pitch: pitchRad, roll: 0 },
      duration: 2.5,
      easingFunction: Cesium.EasingFunction.QUADRATIC_OUT,
      complete: () => {
        landHeroView();
      }
    });

    // 当三维地形加载完成时，再次精确重设，确保地形起伏与视角完美贴合
    viewer.scene.globe.tileLoadProgressEvent.addEventListener((remaining) => {
      if (remaining === 0) {
        landHeroView();
      }
    });
  } catch (err) {
    console.warn("[homecoming] Cesium 初始化失败:", err);
    showStaticFallback();
  }
}

/* ---------- S2 回家之路 · 迷你 Cesium 地球 ---------- */
let _routeInit = false;
function initRouteGlobe() {
  const el = document.getElementById("route-globe");
  if (!el) return;
  if (typeof window.Cesium === "undefined") { el.classList.add("globe-fallback"); return; }
  const Cesium = window.Cesium;
  const routeCoords = (Homecoming.routes.homecoming && Homecoming.routes.homecoming.coords) || [];
  if (routeCoords.length < 2) { el.classList.add("globe-fallback"); return; }
  try {
    const viewer = new Cesium.Viewer("route-globe", {
      animation: false, timeline: false, baseLayerPicker: false, fullscreenButton: false,
      geocoder: false, homeButton: false, infoBox: false, sceneModePicker: false,
      navigationHelpButton: false, selectionIndicator: false, creditContainer: document.createElement("div"),
      baseLayer: new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
        url: "https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
        subdomains: ["1", "2", "3", "4"], credit: "© 高德地图"
      }))
    });
    viewer.scene.globe.enableLighting = false;

    // 回家航线
    const flat = [];
    routeCoords.forEach(c => flat.push(c[0], c[1]));
    viewer.entities.add({
      id: "homecoming-route",
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(flat), width: 5,
        material: new Cesium.PolylineGlowMaterialProperty({ glowPower: 0.3, color: Cesium.Color.fromCssColorString("#d4a017") })
      }
    });

    // 锚点（米瑞 / 崇明 / 雅尼 / 苯日神山）
    const want = ["mili", "chongming", "yani", "benri"];
    (Homecoming.anchors || []).filter(a => want.includes(a.id)).forEach(a => {
      viewer.entities.add({
        id: "anchor-" + a.id,
        position: Cesium.Cartesian3.fromDegrees(a.coords[0], a.coords[1], (a.alt || 3000) + 30),
        point: { pixelSize: 9, color: Cesium.Color.fromCssColorString("#e8c766"), outlineColor: Cesium.Color.fromCssColorString("#ffffff"), outlineWidth: 1.5, disableDepthTestDistance: 1e7 },
        label: { text: a.name, font: '11px "PingFang SC", sans-serif', fillColor: Cesium.Color.fromCssColorString("#eef1f6"), outlineColor: Cesium.Color.fromCssColorString("#000000"), outlineWidth: 2.5, style: Cesium.LabelStyle.FILL_AND_OUTLINE, pixelOffset: new Cesium.Cartesian2(0, -16), verticalOrigin: Cesium.VerticalOrigin.BOTTOM, disableDepthTestDistance: 1e7 }
      });
    });

    // 开场视角：东北俯瞰航线区域
    viewer.camera.setView({ destination: Cesium.Cartesian3.fromDegrees(102, 30, 4700000), orientation: { heading: 0, pitch: -Cesium.Math.PI / 2.3, roll: 0 } });
    setTimeout(() => {
      viewer.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(100, 30.4, 1500000), orientation: { heading: 0, pitch: -Cesium.Math.PI / 2.5, roll: 0 }, duration: 7, easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT });
    }, 600);
    setTimeout(() => { try { viewer.resize(); } catch (e) {} }, 400);
  } catch (e) {
    console.warn("[homecoming] 回家之路迷你地球初始化失败：", e && e.message);
    el.classList.add("globe-fallback");
  }
}
function ensureRouteGlobe() {
  if (_routeInit) return;
  if (typeof window.Cesium === "undefined") return;
  if (!Homecoming.anchors.length) { setTimeout(ensureRouteGlobe, 800); return; }
  _routeInit = true;
  initRouteGlobe();
}

/* ---------- 开场命题字幕序列 ---------- */
function playHeroTitle() {
  const lines = document.querySelectorAll(".hero-line");
  lines.forEach((el, i) => {
    setTimeout(() => el.classList.add("show"), 1400 + i * 2600);
  });
}

/* ---------- 滚动绑定：五段激活 ---------- */
function initScrollBinding() {
  const sections = document.querySelectorAll(".stage-section");
  const dots = document.querySelectorAll(".stage-dot");
  if (!("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const idx = Number(entry.target.dataset.index || 0);
      Homecoming.activeStage = idx;
      // 更新左侧导航
      dots.forEach((d, i) => d.classList.toggle("active", i === idx));
      // 滚动浮现：为所在章节加 in-view（触发 .stage-inner 上移淡入）
      document.querySelectorAll(".stage-section").forEach(s => s.classList.toggle("in-view", s === entry.target));
      // 一问一答：进入章节时打字机打出问题
      const q = entry.target.querySelector(".qa-question");
      if (q) typeQuestion(q);
      // 广播阶段（Cesium 巡航联动等）
      window.dispatchEvent(new CustomEvent("homecoming:stage", {
        detail: { stage: idx }
      }));
    });
  }, { threshold: 0.45 });

  sections.forEach((sec, i) => {
    sec.dataset.index = i;
    io.observe(sec);
  });
}

/* ---------- 过渡到 CEA 概念设计图（落点后淡入） ---------- */
function showCeaTransition() {
  const imgUrl = "/site/assets/cea-design.png";
  let overlay = document.getElementById("cea-overlay");
  if (overlay) { overlay.classList.add("show"); return; }

  const style = document.createElement("style");
  style.textContent = `
    #cea-overlay{position:fixed;inset:0;z-index:1500;display:flex;align-items:center;justify-content:center;
      background:rgba(5,8,18,.82);opacity:0;transition:opacity .9s ease;pointer-events:none;backdrop-filter:blur(6px)}
    #cea-overlay.show{opacity:1;pointer-events:auto}
    #cea-overlay .cea-card{position:relative;max-width:min(1000px,94vw);max-height:92vh;background:var(--night-2,#0c1326);
      border:1px solid rgba(212,160,23,.35);border-radius:18px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.6);
      transform:translateY(24px) scale(.98);transition:transform .5s cubic-bezier(.2,.7,.2,1)}
    #cea-overlay.show .cea-card{transform:none}
    #cea-overlay img{display:block;max-width:100%;max-height:calc(92vh - 120px);object-fit:contain;margin:0 auto;background:#0a0f1e}
    #cea-overlay .cea-cap{padding:14px 22px;display:flex;align-items:center;justify-content:space-between;gap:16px;
      border-top:1px solid rgba(255,255,255,.08)}
    #cea-overlay .cea-cap .t{font-family:'Noto Serif SC',serif;font-size:15px;color:var(--gold-soft,#e8c766);letter-spacing:1px}
    #cea-overlay .cea-cap .s{font-size:12px;color:var(--mist,#8b93a7);margin-top:3px}
    #cea-overlay .cea-close{flex:none;padding:8px 18px;border-radius:20px;border:1px solid rgba(255,255,255,.2);
      background:rgba(255,255,255,.05);color:#e5e7eb;font-size:12px;cursor:pointer;transition:all .25s}
    #cea-overlay .cea-close:hover{border-color:var(--gold,#d4a017);color:var(--gold-soft)}
  `;
  document.head.appendChild(style);

  overlay = document.createElement("div");
  overlay.id = "cea-overlay";
  overlay.innerHTML = `
    <div class="cea-card">
      <img src="${imgUrl}" alt="天旺藏红花 CEA 基地概念设计">
      <div class="cea-cap">
        <div>
          <div class="t">天旺藏红花 CEA 基地 · 概念设计</div>
          <div class="s">西藏林芝 · 藏红花 CEA 土培种植工厂全景示意图（海拔 2945m）</div>
        </div>
        <button class="cea-close">回到三维 · 继续探索</button>
      </div>
    </div>`;
  overlay.querySelector(".cea-close").addEventListener("click", () => {
    overlay.classList.remove("show");
    setTimeout(() => overlay.remove(), 900);
  });
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("show"));
}

/* ---------- 打字机字幕效果（一问一答的问题） ---------- */
function typeQuestion(el) {
  if (!el || el.dataset.typed || el.dataset.typing) return;
  const text = (el.dataset.text || el.textContent).trim();
  if (!text) return;
  el.dataset.text = text;
  el.dataset.typing = "1"; // 打字中：显示光标
  el.textContent = "";
  let i = 0;
  const speed = 90;
  const timer = setInterval(() => {
    el.textContent = text.slice(0, ++i);
    if (i >= text.length) {
      clearInterval(timer);
      delete el.dataset.typing;
      el.dataset.typed = "1"; // 完成：隐藏光标
    }
  }, speed);
}

/* ---------- 左侧导航点击滚动 ---------- */
function initRail() {
  const rail = document.getElementById("stage-rail");
  if (!rail) return;
  rail.addEventListener("click", (e) => {
    const dot = e.target.closest(".stage-dot");
    if (!dot) return;
    const idx = Number(dot.dataset.idx);
    const target = document.querySelectorAll(".stage-section")[idx];
    if (target) target.scrollIntoView({ behavior: "smooth" });
  });
}

/* ---------- 数据加载（锚点/关系，供后续阶段使用） ---------- */
async function loadData() {
  try {
    const [anchors, relations] = await Promise.all([
      fetch("/site/data/geo-anchors.json").then(r => r.json()),
      fetch("/site/data/relations.json").then(r => r.json())
    ]);
    Homecoming.anchors = anchors.anchors || [];
    Homecoming.routes = anchors.routes || {};
    Homecoming.stages = anchors.stages || [];
    window.__homecomingData = { anchors: Homecoming.anchors, routes: Homecoming.routes, relations };
    console.log(`[homecoming] 数据就绪：${Homecoming.anchors.length} 锚点, ${(relations.relations || []).length} 关系边`);
    ensureRouteGlobe(); // 数据就绪后初始化 S2 回家之路迷你地球
  } catch (e) {
    console.warn("[homecoming] 数据加载失败:", e.message);
  }
}

/* ---------- 启动 ---------- */
window.addEventListener("DOMContentLoaded", () => {
  playHeroTitle();
  initScrollBinding();
  initRail();
  loadData();
  loadCesiumWithFallback(0);
});
