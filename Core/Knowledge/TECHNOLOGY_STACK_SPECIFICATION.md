# 天旺农牧 企业官网与 OS 操作系统技术栈架构说明书 (Technology Stack Specification)

**文档版本**: `v1.0`  
**核心说明**: 本文档明确了天旺农牧“三合一”企业官网与 Brand Content OS 操作系统所采用的四大技术栈模块（包含 GIS 地理信息、视听多媒体、交互式知识图谱与内部 OS 引擎）。

---

## 🏛️ 五大技术栈模块构成 (Technology Stack Blueprint)

```text
========================================================================================
             【天旺农牧 官方企业门户与 OS 操作系统 技术栈架构 (Tech Stack)】
========================================================================================
                                         │
 ┌───────────────────┬───────────────────┼───────────────────┬───────────────────┐
 ▼                   ▼                   ▼                   ▼                   ▼
【1. GIS 3D 地理信息】 【2. 多媒体与视听流】 【3. 交互知识图谱】  【4. 内部 OS 引擎】   【5. 前端响应式 Web】
 (CesiumJS / GeoJSON) (Video.js / PhotoSwipe) (ECharts / D3.js)  (Node.js / CAP Engine) (Vite / Vanilla JS)
 • 3D 高程地形沙盘    • 4K 基地视频流     • 34 Master 图谱    • V2.3 三维治理引擎   • 玻璃拟态 Dock 菜单
 • 3大种植法地图分布  • 凭证 PDF 画廊     • 关系拓扑拖拽下钻  • Git + NotebookLM   • 响应式移动端适配
```

---

## 🛠️ 技术栈构成明细

### 1. GIS 地理信息系统技术栈 (GIS & 3D Spatial Stack)
- **核心技术**: `CesiumJS` (3D WebGL / GeoJSON / KML / 3D Tiles) ＋ `Leaflet / Mapbox GL JS`；
- **具体应用场景**:
  1. **西藏林芝 3D 高程地形与生态沙盘**: 基于 Cesium 3D Tiles 真实渲染雅尼两江汇流、南迦巴瓦峰（7782m）与海拔 2945m 天旺 CEA 大温室；
  2. **全球藏红花产区与 3 大种植法分布地图**: 在地图上分层展示全球产区在三种不同农艺模式下的地理演进分布：
     - ① **传统露天大田栽培法产区地图** (伊朗、西班牙等传统大田产区)；
     - ② **两段式栽培法产区地图** (崇明大田养球 ＋ 林芝设施控环催花)；
     - ③ **CEA 现代设施水培/植物工厂产区地图** (控环水培演进区域)。

### 2. 视听与多媒体技术栈 (Media & Video Streaming Stack)
- **核心技术**: `HLS.js / Video.js` ＋ `PhotoSwipe / Fancybox` ＋ CSS 3D 动画；
- **具体应用场景**:
  1. **生产基地 4K 视听画册**: 支持林芝基地与大温室高清视频流播放；
  2. **硬核凭证全屏画廊**: 支持拉萨海关《植物检疫证书》(`CMP-001`) 与食药检院 0农残报告 (`SCI-001`) 原件 PDF/图片的高清无损缩放与在线查看。

3. **交互式知识图谱技术栈 (Interactive Knowledge Graph Stack)**
- **核心技术**: `ECharts Graph` / `D3.js` ＋ `Vis.js`；
- **具体应用场景**:
  1. **品牌与认知知识图谱探针**: 将 34 个 Master 认知节点、两大类素材（品牌传播 ＋ 认知推广）、三维度治理（归属权/时间/声明）转化为可拖拽、可缩放、可下钻的**交互式动态知识网络**。

### 4. 内部知识管理操作系统技术栈 (Internal OS Engine Stack)
- **核心技术**: `Node.js` + `Vite REST API` + `Simple-Git` + `Google Gemini NotebookLM Sync Pipeline` + `CAP Assembly Engine`；
- **具体应用场景**:
  1. **SSOT 建库与治理**: V2.3 三维治理规则引擎（`BRAND_OWNED`, `HISTORICAL`, `CONFIRMED_FACT`）；
  2. **5W1H 场景受控 CAP 通稿合成引擎**: 自动匹配选材、检查规则、输出脱敏稿件。

### 5. 前端响应式 Web 门户技术栈 (Frontend Responsive Portal Stack)
- **核心技术**: `Vite` + `Vanilla JS (ES6+)` + `Modern CSS3 (Flexbox/Grid/Glassmorphism)` + `Remixicon`；
- **具体应用场景**:
  1. 实现面向公众、客户、媒体与监管的顶级企业门户；
  2. 包含悬浮拟态 Dock 菜单、侧边抽屉与双模式体验。
