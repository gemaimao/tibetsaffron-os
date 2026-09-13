// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 宋夏天Dazzle
// 作者全平台ID：宋夏天Dazzle；公众号：送你整个夏天
// Three.js 藏红花赴藏航线 3D 可视化器 (取代原 Cesium 迷你地球)

import * as THREE from 'three';

function createTextSprite(text: string, color: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Group();

  ctx.font = 'bold 22px "PingFang SC", sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = 8;
  ctx.fillText(text, 128, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(3.4, 0.85, 1);
  return sprite;
}

export function initThreeRouteGlobe(containerId = 'route-globe') {
  const container = document.getElementById(containerId);
  if (!container) return null;

  const width = container.clientWidth || 760;
  const height = container.clientHeight || 340;

  // Scene & Camera
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070b18);

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
  camera.position.set(0, 7, 16);
  camera.lookAt(0, 0.5, 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // Group for the stage
  const rootGroup = new THREE.Group();
  scene.add(rootGroup);

  // Background star/particle field
  const starGeo = new THREE.BufferGeometry();
  const starCount = 260;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i += 3) {
    starPos[i] = (Math.random() - 0.5) * 50;
    starPos[i + 1] = (Math.random() - 0.5) * 30;
    starPos[i + 2] = (Math.random() - 0.5) * 30 - 6;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xe8c766,
    size: 0.14,
    transparent: true,
    opacity: 0.4,
  });
  scene.add(new THREE.Points(starGeo, starMat));

  // Base Grid / HUD Ring
  const gridHelper = new THREE.GridHelper(24, 16, 0xd4a017, 0x1e293b);
  gridHelper.position.y = -1.8;
  (gridHelper.material as THREE.Material).transparent = true;
  (gridHelper.material as THREE.Material).opacity = 0.28;
  rootGroup.add(gridHelper);

  // Anchors Data (Centered on 3D stage coordinates)
  const anchors = [
    { name: '崇明养球', pos: new THREE.Vector3(5.6, -0.4, 1.2), color: 0xe8c766, colorHex: '#e8c766', size: 0.38 },
    { name: '米瑞基地 (2945m)', pos: new THREE.Vector3(-0.4, 0.6, -0.2), color: 0xd4a017, colorHex: '#fbbf24', size: 0.52 },
    { name: '雅尼汇流', pos: new THREE.Vector3(-3.2, 0.8, -1.2), color: 0x22d3ee, colorHex: '#67e8f9', size: 0.35 },
    { name: '苯日神山', pos: new THREE.Vector3(-5.8, 1.3, -2.2), color: 0xc4b5fd, colorHex: '#c084fc', size: 0.35 },
  ];

  // Add anchor points, ripple rings and labels
  const rippleMeshes: THREE.Mesh[] = [];
  anchors.forEach((a) => {
    // Core sphere
    const sphereGeo = new THREE.SphereGeometry(a.size, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({ color: a.color });
    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.position.copy(a.pos);
    rootGroup.add(mesh);

    // Ripple Ring
    const ringGeo = new THREE.RingGeometry(a.size * 1.3, a.size * 1.9, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: a.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(a.pos);
    ring.position.y -= 0.05;
    rootGroup.add(ring);
    rippleMeshes.push(ring);

    // Vertical anchor line down to grid
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      a.pos,
      new THREE.Vector3(a.pos.x, -1.8, a.pos.z)
    ]);
    const lineMat = new THREE.LineBasicMaterial({
      color: a.color,
      transparent: true,
      opacity: 0.28
    });
    rootGroup.add(new THREE.Line(lineGeo, lineMat));

    // Floating text label sprite
    const sprite = createTextSprite(a.name, a.colorHex);
    sprite.position.copy(a.pos);
    sprite.position.y += a.size + 0.65;
    rootGroup.add(sprite);
  });

  // Flight Route Curve (CatmullRom)
  const routePoints = [
    new THREE.Vector3(5.6, -0.4, 1.2), // Chongming
    new THREE.Vector3(3.2, 1.9, 0.8),
    new THREE.Vector3(1.2, 2.3, 0.4),
    new THREE.Vector3(-0.4, 0.6, -0.2), // Mirui
    new THREE.Vector3(-3.2, 0.8, -1.2), // Yani
    new THREE.Vector3(-5.8, 1.3, -2.2)  // Benri
  ];
  const curve = new THREE.CatmullRomCurve3(routePoints, false, 'catmullrom', 0.25);

  // Route Tube
  const tubeGeo = new THREE.TubeGeometry(curve, 100, 0.065, 8, false);
  const tubeMat = new THREE.MeshBasicMaterial({
    color: 0xd4a017,
    transparent: true,
    opacity: 0.72,
  });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  rootGroup.add(tube);

  // Traveling photon particle
  const photonGeo = new THREE.SphereGeometry(0.22, 16, 16);
  const photonMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95
  });
  const photon = new THREE.Mesh(photonGeo, photonMat);
  rootGroup.add(photon);

  // Photon trail
  const trailCount = 10;
  const trailMeshes: THREE.Mesh[] = [];
  for (let i = 0; i < trailCount; i++) {
    const tMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.16 * (1 - i / trailCount), 10, 10),
      new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.6 * (1 - i / trailCount)
      })
    );
    rootGroup.add(tMesh);
    trailMeshes.push(tMesh);
  }

  // Animation loop
  let reqId = 0;
  let progress = 0;
  let time = 0;

  function animate() {
    reqId = requestAnimationFrame(animate);
    time += 0.016;
    progress = (progress + 0.0032) % 1;

    // Move photon along curve
    const pos = curve.getPointAt(progress);
    photon.position.copy(pos);

    // Update trail
    trailMeshes.forEach((tMesh, idx) => {
      const trailT = (progress - (idx + 1) * 0.015 + 1) % 1;
      tMesh.position.copy(curve.getPointAt(trailT));
    });

    // Ripple pulse
    rippleMeshes.forEach((ring, idx) => {
      const scale = 1 + (Math.sin(time * 3 + idx) * 0.5 + 0.5) * 0.7;
      ring.scale.set(scale, scale, 1);
      (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0.1, 0.65 - scale * 0.35);
    });

    // Gentle camera bobbing
    rootGroup.rotation.y = Math.sin(time * 0.25) * 0.06;
    camera.lookAt(0, 0.5, 0);

    renderer.render(scene, camera);
  }

  animate();

  // Resize handler
  function onResize() {
    if (!container) return;
    const w = container.clientWidth || 760;
    const h = container.clientHeight || 340;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  return {
    destroy: () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    }
  };
}
