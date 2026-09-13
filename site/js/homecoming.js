/* ============================================================
 * homecoming.js — 藏红花实至名归 · 官网核心空间叙事引擎
 * ------------------------------------------------------------
 * S0 开场：Cesium 真彩卫星地球 ➔ 电影级俯冲林芝米瑞 ➔ 迅速平滑切换【产地生态全景认知图】
 * 交互：支持随时自由在【3D卫星地球】与【产地生态全景】之间无缝切换
 * ============================================================ */

const Homecoming = {
  viewer: null,
  activeStage: 0,
  anchors: [],
  routes: {},
  stages: []
};

/* ---------- Cesium 多 CDN 加载与全屏布局保障 ---------- */
const CESIUM_CDNS = [
  "https://registry.npmmirror.com/cesium/1.107.0/files/Build/Cesium/Cesium.js",
  "https://cdn.jsdelivr.net/npm/cesium@1.107.0/Build/Cesium/Cesium.js",
  "https://unpkg.com/cesium@1.107.0/Build/Cesium/Cesium.js"
];

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

function loadCesiumWithFallback(cdnIdx = 0) {
  injectCesiumCss();
  if (typeof window.Cesium !== "undefined") {
    initCesium();
    return;
  }
  const idx = cdnIdx;
  if (idx >= CESIUM_CDNS.length) {
    console.warn("[homecoming] Cesium CDN 不可达，直接显示生态全景图");
    transitionToEcosystemImage();
    return;
  }
  const script = document.createElement("script");
  script.src = CESIUM_CDNS[idx];
  script.onload = () => {
    loadCesiumCss(CESIUM_CDNS[idx]);
    initCesium();
  };
  script.onerror = () => loadCesiumWithFallback(idx + 1);
  document.head.appendChild(script);
}

/* ---------- S0 · Cesium 开场与真彩卫星俯冲 ---------- */
function initCesium() {
  const el = document.getElementById("hero-globe");
  if (!el || typeof window.Cesium === "undefined") return;

  const Cesium = window.Cesium;
  try {
    // 采用高德高保真卫星底图（针对国内网络深度优化，透亮生动）
    const imageryProvider = new Cesium.UrlTemplateImageryProvider({
      url: "https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
      subdomains: ["1", "2", "3", "4"],
      credit: "© 高德卫星"
    });

    const baseLayer = new Cesium.ImageryLayer(imageryProvider);
    // 提升底图亮度与对比度，告别灰暗，展现雪域蓝天白云的通透自然美
    baseLayer.brightness = 1.18;
    baseLayer.contrast = 1.18;
    baseLayer.saturation = 1.20;
    baseLayer.gamma = 1.05;

    const viewer = new Cesium.Viewer("hero-globe", {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      selectionIndicator: false,
      creditContainer: document.createElement("div"),
      baseLayer: baseLayer
    });
    Homecoming.viewer = viewer;

    viewer.scene.globe.enableLighting = false; // 均匀通透自然光
    viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#070b18");
    viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#070b18");

    // 天旺基地核心视点（对齐生态认知全景图视角：东北朝向雅鲁藏布江与南迦巴瓦/加拉白垒群峰）
    const HERO_VIEW = {
      lng: 94.55411,
      lat: 29.47631,
      heading: 48.2,   // 东北视线正对雅鲁藏布江谷地与雪山群峰
      tilt: 62.0,      // 大倾角俯视，展现强烈峡谷纵深
      range: 3600,
      targetH: 2945
    };

    // 初始镜头：海拔 480km 太空全景
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(HERO_VIEW.lng - 0.35, HERO_VIEW.lat - 0.75, 480000),
      orientation: {
        heading: Cesium.Math.toRadians(HERO_VIEW.heading),
        pitch: Cesium.Math.toRadians(-65),
        roll: 0
      }
    });

    // 0.4 秒后启动电影级快速平滑下潜飞行
    setTimeout(() => {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(HERO_VIEW.lng - 0.05, HERO_VIEW.lat - 0.09, 14000),
        orientation: {
          heading: Cesium.Math.toRadians(HERO_VIEW.heading),
          pitch: Cesium.Math.toRadians(-38),
          roll: 0
        },
        duration: 1.8,
        easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
        complete: () => {
          // 第二程低空定格
          const target = Cesium.Cartesian3.fromDegrees(HERO_VIEW.lng, HERO_VIEW.lat, HERO_VIEW.targetH);
          viewer.camera.lookAt(target, new Cesium.HeadingPitchRange(
            Cesium.Math.toRadians(HERO_VIEW.heading),
            Cesium.Math.toRadians(-(90 - HERO_VIEW.tilt)),
            HERO_VIEW.range
          ));
          viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);

          // 基地金色发光定位锚点
          const pinPos = Cesium.Cartesian3.fromDegrees(HERO_VIEW.lng, HERO_VIEW.lat, HERO_VIEW.targetH + 80);
          viewer.entities.add({
            position: pinPos,
            point: {
              pixelSize: 14,
              color: Cesium.Color.fromCssColorString("#d4a017"),
              outlineColor: Cesium.Color.fromCssColorString("#ffffff"),
              outlineWidth: 2,
              disableDepthTestDistance: 1e7
            },
            label: {
              text: "西藏林芝 · 米瑞天旺基地 (2945m)",
              font: 'bold 13px "PingFang SC", sans-serif',
              fillColor: Cesium.Color.fromCssColorString("#faeec7"),
              outlineColor: Cesium.Color.fromCssColorString("#070b18"),
              outlineWidth: 3.5,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new Cesium.Cartesian2(0, -22),
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              disableDepthTestDistance: 1e7
            }
          });

          // 定位完成后，立即迅速平滑切换到生态认知图！
          setTimeout(() => {
            transitionToEcosystemImage();
          }, 350);
        }
      });
    }, 400);

    setTimeout(() => {
      try { viewer.resize(); } catch (e) {}
    }, 400);

  } catch (err) {
    console.warn("[homecoming] Cesium 初始化异常，降级直显生态认知图:", err);
    transitionToEcosystemImage();
  }
}

/* ---------- 视角与天旺生态图平滑切换 ---------- */
function transitionToEcosystemImage() {
  const overlay = document.getElementById("hero-ecosystem-overlay");
  const switcher = document.getElementById("hero-view-switch");
  const heroTitle = document.querySelector(".hero-title");
  const heroVeil = document.querySelector(".hero-veil");
  const btnEco = document.getElementById("btn-eco-view");
  const btn3d = document.getElementById("btn-3d-view");

  if (overlay) overlay.classList.add("show");
  if (heroTitle) heroTitle.classList.add("hero-fade-out");
  if (heroVeil) heroVeil.classList.add("hero-fade-out");
  if (switcher) switcher.classList.add("show");
  if (btnEco) btnEco.classList.add("active");
  if (btn3d) btn3d.classList.remove("active");
}

function showCesiumView() {
  const overlay = document.getElementById("hero-ecosystem-overlay");
  const heroTitle = document.querySelector(".hero-title");
  const heroVeil = document.querySelector(".hero-veil");
  const btnEco = document.getElementById("btn-eco-view");
  const btn3d = document.getElementById("btn-3d-view");

  if (overlay) overlay.classList.remove("show");
  if (heroTitle) heroTitle.classList.remove("hero-fade-out");
  if (heroVeil) heroVeil.classList.remove("hero-fade-out");
  if (btnEco) btnEco.classList.remove("active");
  if (btn3d) btn3d.classList.add("active");
}

function initViewSwitcher() {
  const btnEco = document.getElementById("btn-eco-view");
  const btn3d = document.getElementById("btn-3d-view");
  if (btnEco) {
    btnEco.addEventListener("click", () => transitionToEcosystemImage());
  }
  if (btn3d) {
    btn3d.addEventListener("click", () => showCesiumView());
  }
}

/* ---------- 开场命题字幕序列 ---------- */
function playHeroTitle() {
  const lines = document.querySelectorAll(".hero-line");
  lines.forEach((el, i) => {
    setTimeout(() => el.classList.add("show"), 900 + i * 2200);
  });
}

/* ---------- 数据加载 ---------- */
async function loadData() {
  try {
    const [anchors, relations] = await Promise.all([
      fetch("/site/data/geo-anchors.json").then(r => r.json()).catch(() => ({})),
      fetch("/site/data/relations.json").then(r => r.json()).catch(() => ({}))
    ]);
    Homecoming.anchors = anchors.anchors || [];
    Homecoming.routes = anchors.routes || {};
    Homecoming.stages = anchors.stages || [];
    window.__homecomingData = { anchors: Homecoming.anchors, routes: Homecoming.routes, relations };
  } catch (e) {
    console.warn("[homecoming] 数据加载:", e.message);
  }
}

/* ---------- 启动 ---------- */
window.addEventListener("DOMContentLoaded", () => {
  playHeroTitle();
  initViewSwitcher();
  loadData();
  loadCesiumWithFallback(0);
});
