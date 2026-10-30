import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FixoProduct } from '../types/product';
import { sound } from '../utils/audio';

interface HeartIsland3DProps {
  products: FixoProduct[];
  activeProduct: FixoProduct | null;
  onOpenProduct: (product: FixoProduct) => void;
  playerPos: { x: number; z: number };
  setPlayerPos: React.Dispatch<React.SetStateAction<{ x: number; z: number }>>;
  joystickVector: { x: number; y: number };
  teleportTarget: { x: number; z: number } | null;
  clearTeleport: () => void;
  timeOfDay: 'day' | 'sunset' | 'night' | 'dawn';
  isBirdEye: boolean;
}

const HEX_R = 8.5;
const SQ3 = Math.sqrt(3);
const INTERACTION_DIST = 4.8;

// Convert axial hex coordinates (q, r) to 3D world (x, z)
export const hexToWorld = (q: number, r: number, radius = HEX_R) => {
  const x = radius * SQ3 * (q + r / 2.0);
  const z = radius * 1.5 * r;
  return { x, z };
};

export const HeartIsland3D: React.FC<HeartIsland3DProps> = ({
  products,
  activeProduct,
  onOpenProduct,
  playerPos,
  setPlayerPos,
  joystickVector,
  teleportTarget,
  clearTeleport,
  timeOfDay,
  isBirdEye
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const envRef = useRef<{
    sunLight?: THREE.DirectionalLight;
    skyMat?: THREE.ShaderMaterial;
    waterMat?: THREE.MeshStandardMaterial;
    fog?: THREE.Fog;
  }>({});

  const [nearbyProduct, setNearbyProduct] = useState<FixoProduct | null>(null);
  const nearbyProductRef = useRef<FixoProduct | null>(null);

  // Keep references to dynamic props to prevent effect teardown/re-creation loops
  const activeProductRef = useRef(activeProduct);
  activeProductRef.current = activeProduct;

  const joystickVectorRef = useRef(joystickVector);
  joystickVectorRef.current = joystickVector;

  const onOpenProductRef = useRef(onOpenProduct);
  onOpenProductRef.current = onOpenProduct;

  const setPlayerPosRef = useRef(setPlayerPos);
  setPlayerPosRef.current = setPlayerPos;

  const productsRef = useRef(products);
  productsRef.current = products;

  // Character internal physics state (Continuous smooth position & velocity)
  const playerStateRef = useRef({
    x: playerPos.x || 0,
    z: playerPos.z || 3.5,
    vx: 0,
    vz: 0,
    rotationY: 0,
    targetRotationY: 0,
    isMoving: false,
    walkTimer: 0,
    stepTimer: 0
  });

  // Handle external teleport / dock fly-to
  useEffect(() => {
    if (teleportTarget) {
      playerStateRef.current.x = teleportTarget.x;
      playerStateRef.current.z = teleportTarget.z;
      playerStateRef.current.vx = 0;
      playerStateRef.current.vz = 0;
      setPlayerPos({ x: teleportTarget.x, z: teleportTarget.z });
      sound.playTeleport();

      // Smoothly glide camera to target
      if (controlsRef.current && cameraRef.current) {
        const controls = controlsRef.current;
        const cam = cameraRef.current;
        const offset = isBirdEye ? new THREE.Vector3(0, 52, 4) : new THREE.Vector3(0, 26, 28);
        cam.position.set(teleportTarget.x + offset.x, offset.y, teleportTarget.z + offset.z);
        controls.target.set(teleportTarget.x, 1.2, teleportTarget.z);
        controls.update();
      }

      clearTeleport();
    }
  }, [teleportTarget, clearTeleport, setPlayerPos, isBirdEye]);

  // Handle Bird's eye toggle
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const controls = controlsRef.current;
    const px = playerStateRef.current.x;
    const pz = playerStateRef.current.z;

    if (isBirdEye) {
      cam.position.set(px, 62, pz + 4);
      controls.target.set(px, 0, pz);
    } else {
      cam.position.set(px, 26, pz + 28);
      controls.target.set(px, 1.2, pz);
    }
    controls.update();
  }, [isBirdEye]);

  // Handle Time of Day presets
  useEffect(() => {
    const env = envRef.current;
    if (!env.sunLight || !env.skyMat || !env.waterMat || !env.fog) return;

    if (timeOfDay === 'day') {
      env.sunLight.color.setHex(0xfff1de);
      env.sunLight.intensity = 2.6;
      env.skyMat.uniforms.topColor.value.setHex(0x9fd0ec);
      env.skyMat.uniforms.horizonColor.value.setHex(0xf4eee3);
      env.waterMat.color.setHex(0x9fd8db);
      env.fog.color.setHex(0xf4eee3);
    } else if (timeOfDay === 'sunset') {
      env.sunLight.color.setHex(0xff9f6a);
      env.sunLight.intensity = 2.0;
      env.skyMat.uniforms.topColor.value.setHex(0x8b8fc4);
      env.skyMat.uniforms.horizonColor.value.setHex(0xf7b98f);
      env.waterMat.color.setHex(0x93a9bd);
      env.fog.color.setHex(0xf7b98f);
    } else if (timeOfDay === 'night') {
      env.sunLight.color.setHex(0xb4c2ff);
      env.sunLight.intensity = 0.8;
      env.skyMat.uniforms.topColor.value.setHex(0x1e2c58);
      env.skyMat.uniforms.horizonColor.value.setHex(0x3f4f80);
      env.waterMat.color.setHex(0x5a88b2);
      env.fog.color.setHex(0x1e2c58);
    } else if (timeOfDay === 'dawn') {
      env.sunLight.color.setHex(0xffb48a);
      env.sunLight.intensity = 1.6;
      env.skyMat.uniforms.topColor.value.setHex(0x7f8fc4);
      env.skyMat.uniforms.horizonColor.value.setHex(0xf6c3a6);
      env.waterMat.color.setHex(0x8fb7c4);
      env.fog.color.setHex(0xf6c3a6);
    }
  }, [timeOfDay]);

  // Robust Keyboard event listeners (Works across all IME / CapsLock / Key variations)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (activeProductRef.current) return;
      const key = (e.key || '').toLowerCase();
      const code = (e.code || '').toLowerCase();

      if (key === 'w' || code === 'keyw' || key === 'arrowup' || code === 'arrowup') keysRef.current['up'] = true;
      if (key === 's' || code === 'keys' || key === 'arrowdown' || code === 'arrowdown') keysRef.current['down'] = true;
      if (key === 'a' || code === 'keya' || key === 'arrowleft' || code === 'arrowleft') keysRef.current['left'] = true;
      if (key === 'd' || code === 'keyd' || key === 'arrowright' || code === 'arrowright') keysRef.current['right'] = true;

      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key) ||
          ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(code)) {
        e.preventDefault();
      }

      const nearby = nearbyProductRef.current;
      if ((e.key === ' ' || code === 'space' || key === 'e' || code === 'keye') && nearby) {
        e.preventDefault();
        sound.playInteract();
        onOpenProductRef.current(nearby);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const key = (e.key || '').toLowerCase();
      const code = (e.code || '').toLowerCase();

      if (key === 'w' || code === 'keyw' || key === 'arrowup' || code === 'arrowup') keysRef.current['up'] = false;
      if (key === 's' || code === 'keys' || key === 'arrowdown' || code === 'arrowdown') keysRef.current['down'] = false;
      if (key === 'a' || code === 'keya' || key === 'arrowleft' || code === 'arrowleft') keysRef.current['left'] = false;
      if (key === 'd' || code === 'keyd' || key === 'arrowright' || code === 'arrowright') keysRef.current['right'] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Main Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf4eee3, 60, 200);

    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 26, 28);
    cameraRef.current = camera;

    container.innerHTML = '';
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // Orbit Controls (Mouse rotates view, pans, zooms)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera sinking under water
    controls.minDistance = 12;
    controls.maxDistance = 120;
    controls.target.set(0, 1.2, 0);
    controlsRef.current = controls;

    // 2. Lighting (Kaohsiung Harbor Warm Sun & Sky Light)
    const hemiLight = new THREE.HemisphereLight(0xeef6fa, 0x8f8270, 1.35);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff1de, 2.6);
    sunLight.position.set(38, 55, 32);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 150;
    const sd = 50;
    sunLight.shadow.camera.left = -sd;
    sunLight.shadow.camera.right = sd;
    sunLight.shadow.camera.top = sd;
    sunLight.shadow.camera.bottom = -sd;
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.normalBias = 0.04;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xbfd6ff, 0.45);
    fillLight.position.set(-30, 25, -30);
    scene.add(fillLight);

    // 3. Sky Dome & Kaohsiung Bay Sparkling Water Plane
    const skyGeo = new THREE.SphereGeometry(240, 32, 16);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: new THREE.Color(0x9fd0ec) },
        horizonColor: { value: new THREE.Color(0xf4eee3) }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 horizonColor;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition).y;
          gl_FragColor = vec4(mix(horizonColor, topColor, max(pow(max(h, 0.0), 0.6), 0.0)), 1.0);
        }
      `
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);

    // Sparkling Turquoise Water
    const waterGeo = new THREE.PlaneGeometry(600, 600, 32, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x9fd8db,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.22;
    water.receiveShadow = true;
    scene.add(water);

    envRef.current = {
      sunLight,
      skyMat,
      waterMat,
      fog: scene.fog as THREE.Fog
    };

    // 4. Distant Kaohsiung Skyline & Asian New Bay Area (亞洲新灣區景觀)
    const baySkylineGroup = new THREE.Group();
    scene.add(baySkylineGroup);

    // A. 高雄 85 大樓 (85 Sky Tower Silhouette in distance)
    const tower85Group = new THREE.Group();
    tower85Group.position.set(-65, 0, -85);
    const tower85Mat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 });

    // Lower two towers (Pillars)
    const pillarL = new THREE.Mesh(new THREE.BoxGeometry(4.2, 28, 4.2), tower85Mat);
    pillarL.position.set(-3.2, 14, 0);
    tower85Group.add(pillarL);

    const pillarR = new THREE.Mesh(new THREE.BoxGeometry(4.2, 28, 4.2), tower85Mat);
    pillarR.position.set(3.2, 14, 0);
    tower85Group.add(pillarR);

    // Central connector body & main high tower
    const center85 = new THREE.Mesh(new THREE.BoxGeometry(10.5, 18, 5.2), tower85Mat);
    center85.position.set(0, 37, 0);
    tower85Group.add(center85);

    // Antenna Mast
    const spire85 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.8, 14, 8), tower85Mat);
    spire85.position.set(0, 53, 0);
    tower85Group.add(spire85);
    baySkylineGroup.add(tower85Group);

    // B. 高雄流行音樂中心 (Kaohsiung Music Center - 音浪塔 Wave Tower)
    const kmcGroup = new THREE.Group();
    kmcGroup.position.set(65, 0, -80);
    const kmcMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.4 });
    const waveTower = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 8.5, 22, 6), kmcMat);
    waveTower.position.y = 11;
    kmcGroup.add(waveTower);
    baySkylineGroup.add(kmcGroup);

    // C. 高雄展覽館 (Kaohsiung Exhibition Center Wave Roof)
    const kecGroup = new THREE.Group();
    kecGroup.position.set(-55, 0, -45);
    const kecRoof = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 5, 16, 1, false, 0, Math.PI), tower85Mat);
    kecRoof.rotation.z = Math.PI / 2;
    kecRoof.position.y = 4.5;
    kecGroup.add(kecRoof);
    baySkylineGroup.add(kecGroup);

    // D. 大港橋 (Great Harbor Bridge - Horizontal pedestrian swing bridge)
    const bridgeHarbor = new THREE.Mesh(new THREE.BoxGeometry(32, 1.2, 2.8), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }));
    bridgeHarbor.position.set(40, 1.4, -40);
    bridgeHarbor.rotation.y = -Math.PI / 5;
    baySkylineGroup.add(bridgeHarbor);

    // E. Harbor Sailboats on the bay
    const boats: THREE.Group[] = [];
    for (let b = 0; b < 5; b++) {
      const boat = new THREE.Group();
      const hull = new THREE.Mesh(new THREE.ConeGeometry(1.6, 4.2, 4), new THREE.MeshStandardMaterial({ color: 0xfafafa }));
      hull.rotation.x = Math.PI / 2;
      hull.position.y = 0.2;
      boat.add(hull);

      const sail = new THREE.Mesh(new THREE.ConeGeometry(1.4, 3.8, 3), new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
      sail.position.set(0, 2.2, -0.4);
      boat.add(sail);

      const angle = (b / 5) * Math.PI * 2 + 0.4;
      boat.position.set(Math.cos(angle) * 55, 0, Math.sin(angle) * 55);
      boat.rotation.y = angle + Math.PI / 2;
      scene.add(boat);
      boats.push(boat);
    }

    // 5. Hexagonal Archipelago Generation
    const islandCenters = new Map<string, { x: number; z: number }>();
    const islandsGroup = new THREE.Group();
    scene.add(islandsGroup);

    // Island Ground Style Tones
    const GROUND_COLORS: Record<string, number> = {
      hub: 0xf4f1ec, // Central KSP Plaza
      cam: 0xdcb79a, // Warm Terracotta Sandstone
      vpc: 0xb9d9d6, // Soft Cyan Turf
      fico: 0xb9cd98, // Crisp Mint Lawn
      fibo: 0xc9a27c, // Seaside Boardwalk / Sand
      lbs: 0xc5b5a7, // Lavender Stone
      cis: 0x9fc7cf, // Ocean Marina Dock
      kms: 0xd9b08c, // Courtyard Pavers
      fiwo: 0xe2a46f, // Rubber Peach Pad
      bds: 0x9fb683, // Sage Garden Lawn
      meter: 0xa9b878 // Farmland / Meadow
    };

    // Helper: Build a single Pointy-Top Hexagonal Island
    const buildHexIsland = (id: string, q: number, r: number, groundColor: number) => {
      const { x, z } = hexToWorld(q, r);
      islandCenters.set(id, { x, z });

      const g = new THREE.Group();
      g.position.set(x, 0, z);

      // Top Beveled Hexagon Ground Surface (y = 0.35)
      const topPlateGeo = new THREE.CylinderGeometry(HEX_R - 0.2, HEX_R, 0.55, 6);
      const topPlateMat = new THREE.MeshStandardMaterial({
        color: groundColor,
        roughness: 0.65,
        metalness: 0.1
      });
      const topPlate = new THREE.Mesh(topPlateGeo, topPlateMat);
      topPlate.position.y = 0.35;
      topPlate.receiveShadow = true;
      g.add(topPlate);

      // Sandstone Cliff Strata Underneath (Tapers into water)
      const cliffGeo = new THREE.CylinderGeometry(HEX_R, HEX_R * 0.78, 3.2, 6);
      const cliffMat = new THREE.MeshStandardMaterial({
        color: 0xc7b08f,
        roughness: 0.85,
        metalness: 0.1,
        flatShading: true
      });
      const cliff = new THREE.Mesh(cliffGeo, cliffMat);
      cliff.position.y = -1.25;
      cliff.receiveShadow = true;
      g.add(cliff);

      // Shallow Water Lagoon Shelf Contour
      const lagoonGeo = new THREE.CylinderGeometry(HEX_R * 1.15, HEX_R * 1.15, 0.12, 6);
      const lagoonMat = new THREE.MeshBasicMaterial({
        color: 0xa4d4da,
        transparent: true,
        opacity: 0.52
      });
      const lagoon = new THREE.Mesh(lagoonGeo, lagoonMat);
      lagoon.position.y = -0.15;
      g.add(lagoon);

      // Inner Walking Ring Tile Promenade
      const ringGeo = new THREE.RingGeometry(HEX_R * 0.68, HEX_R * 0.85, 32);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xf4f1ec,
        roughness: 0.5,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.64;
      ring.receiveShadow = true;
      g.add(ring);

      islandsGroup.add(g);
      return g;
    };

    // Build Central Hub: 高雄軟體科技園區 (KSP)
    buildHexIsland('hub', 0, 0, GROUND_COLORS.hub);

    // Build 10 Product Hex Islands
    products.forEach((prod) => {
      const { q, r } = prod.building.hex;
      const gColor = GROUND_COLORS[prod.id] || 0xb9cd98;
      buildHexIsland(prod.id, q, r, gColor);
    });

    // 6. Connecting Bridges & Light Rail Tracks (高雄輕軌與拱橋)
    const bridgeDeckMat = new THREE.MeshStandardMaterial({ color: 0xb48560, roughness: 0.7 });
    const bridgeRailingMat = new THREE.MeshStandardMaterial({ color: 0xfff8f4, roughness: 0.4 });
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });

    const adjacentPairs: [string, string][] = [
      ['hub', 'cam'],
      ['hub', 'vpc'],
      ['hub', 'fico'],
      ['hub', 'fibo'],
      ['hub', 'lbs'],
      ['hub', 'cis'],
      ['hub', 'kms'],
      ['hub', 'fiwo'],
      ['hub', 'bds'],
      ['hub', 'meter'],
      ['cam', 'fico'],
      ['cam', 'vpc'],
      ['vpc', 'lbs'],
      ['fico', 'fibo'],
      ['fibo', 'cis'],
      ['lbs', 'kms'],
      ['kms', 'fiwo'],
      ['fiwo', 'meter'],
      ['cis', 'meter'],
      ['fiwo', 'bds']
    ];

    adjacentPairs.forEach(([idA, idB]) => {
      const posA = islandCenters.get(idA);
      const posB = islandCenters.get(idB);
      if (!posA || !posB) return;

      const midX = (posA.x + posB.x) / 2;
      const midZ = (posA.z + posB.z) / 2;
      const dist = Math.hypot(posB.x - posA.x, posB.z - posA.z);
      const bridgeLen = dist * 0.48;

      const bridgeGroup = new THREE.Group();
      bridgeGroup.position.set(midX, 0.65, midZ);
      bridgeGroup.lookAt(posB.x, 0.65, posB.z);

      // Deck
      const deckGeo = new THREE.BoxGeometry(2.2, 0.16, bridgeLen);
      const deck = new THREE.Mesh(deckGeo, bridgeDeckMat);
      deck.castShadow = true;
      deck.receiveShadow = true;
      bridgeGroup.add(deck);

      // Left & Right Railings with white posts
      for (const side of [-1.1, 1.1]) {
        const railGeo = new THREE.BoxGeometry(0.08, 0.08, bridgeLen);
        const rail = new THREE.Mesh(railGeo, bridgeRailingMat);
        rail.position.set(side, 0.42, 0);
        rail.castShadow = true;
        bridgeGroup.add(rail);

        for (let p = -1; p <= 1; p++) {
          const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.45, 8);
          const post = new THREE.Mesh(postGeo, bridgeRailingMat);
          post.position.set(side, 0.22, (p * bridgeLen) / 2.3);
          post.castShadow = true;
          bridgeGroup.add(post);
        }
      }

      // Light Rail Tracks embedded on some bridges
      if (idA === 'hub' || idB === 'hub') {
        for (const rx of [-0.4, 0.4]) {
          const railTrack = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, bridgeLen), trackMat);
          railTrack.position.set(rx, 0.09, 0);
          bridgeGroup.add(railTrack);
        }
      }

      islandsGroup.add(bridgeGroup);
    });

    // Animated Kaohsiung Light Rail Tram (高雄輕軌電車模型)
    const lrtGroup = new THREE.Group();
    const lrtBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.1, 2.6), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }));
    lrtBody.position.y = 0.65;
    lrtGroup.add(lrtBody);

    const lrtStripe = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.25, 2.62), new THREE.MeshStandardMaterial({ color: 0x10b981 })); // Green line
    lrtStripe.position.y = 0.55;
    lrtGroup.add(lrtStripe);

    const lrtGlass = new THREE.Mesh(new THREE.BoxGeometry(1.21, 0.45, 2.0), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1 }));
    lrtGlass.position.y = 0.85;
    lrtGroup.add(lrtGlass);
    scene.add(lrtGroup);

    // Collision check: Island and Bridges
    const distToSegment = (px: number, pz: number, ax: number, az: number, bx: number, bz: number) => {
      const dx = bx - ax;
      const dz = bz - az;
      const l2 = dx * dx + dz * dz;
      if (l2 === 0) return Math.hypot(px - ax, pz - az);
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / l2));
      const projX = ax + t * dx;
      const projZ = az + t * dz;
      return Math.hypot(px - projX, pz - projZ);
    };

    const isWalkable = (px: number, pz: number): boolean => {
      // Inside any hexagon island
      for (const center of islandCenters.values()) {
        if (Math.hypot(px - center.x, pz - center.z) <= HEX_R - 0.25) {
          return true;
        }
      }

      // On any connecting bridge
      for (const [idA, idB] of adjacentPairs) {
        const posA = islandCenters.get(idA);
        const posB = islandCenters.get(idB);
        if (posA && posB) {
          if (distToSegment(px, pz, posA.x, posA.z, posB.x, posB.z) <= 1.45) {
            return true;
          }
        }
      }

      return false;
    };

    // 7. Kaohsiung Bay Tropical Scenery (Palm Trees, Sea Lamp Posts)
    const decorGroup = new THREE.Group();
    scene.add(decorGroup);

    const palmTrunkMat = new THREE.MeshStandardMaterial({ color: 0x8a6a4e, roughness: 0.8 });
    const palmLeafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5, side: THREE.DoubleSide });

    const addPalmTree = (x: number, y: number, z: number, scale = 1.0) => {
      const p = new THREE.Group();
      p.position.set(x, y, z);
      p.scale.setScalar(scale);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, 2.6, 8), palmTrunkMat);
      trunk.position.y = 1.3;
      trunk.castShadow = true;
      p.add(trunk);

      for (let i = 0; i < 6; i++) {
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 1.4), palmLeafMat);
        const a = (i / 6) * Math.PI * 2;
        leaf.position.set(Math.cos(a) * 0.6, 2.6, Math.sin(a) * 0.6);
        leaf.rotation.set(0.3, a, 0);
        leaf.castShadow = true;
        p.add(leaf);
      }
      decorGroup.add(p);
    };

    islandCenters.forEach((pos, key) => {
      if (key === 'hub') {
        // High-tech Kaohsiung Software Park palm avenue
        addPalmTree(pos.x - 4.5, 0.65, pos.z - 3.8, 1.1);
        addPalmTree(pos.x + 4.5, 0.65, pos.z - 3.8, 1.1);
        addPalmTree(pos.x - 4.8, 0.65, pos.z + 4.2, 1.05);
        addPalmTree(pos.x + 4.8, 0.65, pos.z + 4.2, 1.05);
      } else {
        addPalmTree(pos.x - 4.6, 0.65, pos.z - 3.4, 0.95);
        addPalmTree(pos.x + 4.8, 0.65, pos.z + 3.8, 0.9);
      }
    });

    // 8. CENTRAL HUB: 高雄軟體科技園區 · 鴻海軟體研發大樓 (Foxconn KSP Software R&D Tower)
    const kspHubGroup = new THREE.Group();
    kspHubGroup.position.set(0, 0.65, 0);

    const foxconnTowerMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.15,
      metalness: 0.4
    });
    const whiteFacadeMat = new THREE.MeshStandardMaterial({ color: 0xfff8f4, roughness: 0.4 });
    const greenLedMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.7 });

    // Main Curved R&D Glass Tower
    const kspTower = new THREE.Mesh(new THREE.BoxGeometry(4.8, 8.2, 3.4), foxconnTowerMat);
    kspTower.position.set(0, 4.1, -1.2);
    kspTower.castShadow = true;
    kspHubGroup.add(kspTower);

    // Architectural White Fin Surrounds
    const kspFinL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 8.6, 3.8), whiteFacadeMat);
    kspFinL.position.set(-2.5, 4.3, -1.2);
    kspFinL.castShadow = true;
    kspHubGroup.add(kspFinL);

    const kspFinR = new THREE.Mesh(new THREE.BoxGeometry(0.6, 8.6, 3.8), whiteFacadeMat);
    kspFinR.position.set(2.5, 4.3, -1.2);
    kspFinR.castShadow = true;
    kspHubGroup.add(kspFinR);

    // Green Energy LED Stripes on Facade
    for (let f = 1; f <= 4; f++) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(4.82, 0.12, 0.05), greenLedMat);
      stripe.position.set(0, f * 1.6, 0.52);
      kspHubGroup.add(stripe);
    }

    // Entrance Glass Lobby
    const kspLobby = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.4, 1.8), whiteFacadeMat);
    kspLobby.position.set(0, 0.7, 1.2);
    kspLobby.castShadow = true;
    kspHubGroup.add(kspLobby);

    // Water Fountain in front of KSP
    const fountainWater = new THREE.Mesh(
      new THREE.CylinderGeometry(2.0, 2.0, 0.15, 24),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.2 })
    );
    fountainWater.position.set(0, 0.1, 2.8);
    kspHubGroup.add(fountainWater);

    scene.add(kspHubGroup);

    // 9. HIGH-DETAIL 3D ARCHITECTURAL PAVILIONS (Kaohsiung Software Park / 亞灣科技聚落)
    const buildingMeshes: { product: FixoProduct; group: THREE.Group; beacon: THREE.Mesh }[] = [];

    const createPillSprite = (text: string, iconSymbol: string, colorHex: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 380;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(255, 248, 244, 0.94)';
        ctx.strokeStyle = colorHex;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(8, 8, 364, 104, 52);
        ctx.fill();
        ctx.stroke();

        ctx.font = '38px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(iconSymbol, 64, 72);

        ctx.font = 'bold 30px "Noto Sans TC", sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'left';
        ctx.fillText(text, 110, 72);
      }
      const tex = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(4.6, 1.45, 1);
      return sprite;
    };

    products.forEach((prod) => {
      const pos = islandCenters.get(prod.id);
      if (!pos) return;

      const bGroup = new THREE.Group();
      bGroup.position.set(pos.x, 0.65, pos.z);
      scene.add(bGroup);

      const colorInt = parseInt(prod.color.primary.replace('#', '0x'), 16);

      // Shared Materials
      const wallMat = new THREE.MeshStandardMaterial({ color: 0xfff8f4, roughness: 0.45 });
      const roofMat = new THREE.MeshStandardMaterial({ color: colorInt, roughness: 0.35 });
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
      const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.35 });

      // Ground Interactive Ring Beacon
      const ringGeo = new THREE.RingGeometry(3.6, 4.2, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorInt,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
      });
      const beacon = new THREE.Mesh(ringGeo, ringMat);
      beacon.rotation.x = -Math.PI / 2;
      beacon.position.y = 0.05;
      bGroup.add(beacon);

      // High-Detail Kaohsiung Bay Inspired Architecture
      if (prod.id === 'cam') {
        // CAM: 高軟園區行政總署 (KSP Admin Center)
        const base = new THREE.Mesh(new THREE.BoxGeometry(4.4, 3.4, 3.6), wallMat);
        base.position.y = 1.7;
        base.castShadow = true;
        bGroup.add(base);

        const pediment = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.6, 4), roofMat);
        pediment.rotation.y = Math.PI / 4;
        pediment.position.y = 4.2;
        pediment.castShadow = true;
        bGroup.add(pediment);
      } else if (prod.id === 'vpc') {
        // VPC: 亞灣跨海光纖中樞 (Cross-Harbor Peering Hub)
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, 2.4, 6), wallMat);
        hub.position.y = 1.2;
        hub.castShadow = true;
        bGroup.add(hub);

        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.24, 5.2, 8), metalMat);
        mast.position.set(0, 4.2, 0);
        mast.castShadow = true;
        bGroup.add(mast);
      } else if (prod.id === 'fico') {
        // FiCo: 鴻海高軟 AI 超算中心 (Foxconn Supercomputing Twin Towers)
        const t1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6.2, 2.4), wallMat);
        t1.position.set(-1.2, 3.1, 0);
        t1.castShadow = true;
        bGroup.add(t1);

        const t2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6.2, 2.4), wallMat);
        t2.position.set(1.2, 3.1, 0);
        t2.castShadow = true;
        bGroup.add(t2);

        const bridge = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 1.2), glassMat);
        bridge.position.set(0, 4.4, 0);
        bGroup.add(bridge);
      } else if (prod.id === 'fibo') {
        // FiBo: 高雄港數據深水海港 (Kaohsiung Harbor S3 Depot)
        const warehouse = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.8, 3.4), wallMat);
        warehouse.position.y = 1.4;
        warehouse.castShadow = true;
        bGroup.add(warehouse);

        for (const sx of [-1.5, 1.5]) {
          const silo = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 3.8, 16), metalMat);
          silo.position.set(sx, 1.9, 1.4);
          silo.castShadow = true;
          bGroup.add(silo);
        }
      } else if (prod.id === 'lbs') {
        // LBS: 亞灣航標智慧分流塔 (Bay Traffic Lighthouse)
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.6, 6.4, 16), wallMat);
        tower.position.y = 3.2;
        tower.castShadow = true;
        bGroup.add(tower);

        const lantern = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 1.2, 16), glassMat);
        lantern.position.y = 7.0;
        bGroup.add(lantern);
      } else if (prod.id === 'cis') {
        // CIS: 旅運中心海神容器碼頭 (Cruise Terminal Container Dock)
        const dock = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.4, 2.8), wallMat);
        dock.position.y = 1.2;
        dock.castShadow = true;
        bGroup.add(dock);

        const container = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.4, 1.8), roofMat);
        container.position.set(0, 3.0, 0);
        container.castShadow = true;
        bGroup.add(container);
      } else if (prod.id === 'kms') {
        // KMS: 亞灣金融密鑰金庫 (FinTech Vault)
        const bunker = new THREE.Mesh(new THREE.BoxGeometry(4.4, 3.2, 4.2), wallMat);
        bunker.position.y = 1.6;
        bunker.castShadow = true;
        bGroup.add(bunker);

        const vaultDoor = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.3, 24), metalMat);
        vaultDoor.rotation.x = Math.PI / 2;
        vaultDoor.position.set(0, 1.6, 2.2);
        bGroup.add(vaultDoor);
      } else if (prod.id === 'fiwo') {
        // FiWo: 高軟創新雲端工作站 (KSP Cloud Workspace)
        const villa = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.8, 3.4), wallMat);
        villa.position.y = 1.4;
        villa.castShadow = true;
        bGroup.add(villa);

        const glassWall = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.0, 0.1), glassMat);
        glassWall.position.set(0, 1.4, 1.72);
        bGroup.add(glassWall);
      } else if (prod.id === 'bds') {
        // BDS: 音浪大數據觀測站 (Wave Big Data Analytics)
        const drum = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 2.4, 16), wallMat);
        drum.position.y = 1.2;
        drum.castShadow = true;
        bGroup.add(drum);

        const dish = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 0.2, 0.6, 16), metalMat);
        dish.position.set(1.4, 4.5, 0);
        dish.rotation.z = Math.PI / 4;
        bGroup.add(dish);
      } else {
        // Meter: 綠能智慧港灣計量站 (Green Port Energy Telemetry)
        const station = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.4, 3.2), wallMat);
        station.position.y = 1.2;
        station.castShadow = true;
        bGroup.add(station);

        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 5.2, 8), metalMat);
        mast.position.set(0, 4.6, 0);
        mast.castShadow = true;
        bGroup.add(mast);

        const turbineHub = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), roofMat);
        turbineHub.position.set(0, 7.2, 0.2);
        turbineHub.name = 'turbine_hub';
        bGroup.add(turbineHub);
      }

      // Floating Title Pill Badge
      const pillSprite = createPillSprite(prod.name, prod.building.symbol, prod.color.primary);
      pillSprite.position.set(0, 7.2, 0);
      bGroup.add(pillSprite);

      buildingMeshes.push({ product: prod, group: bGroup, beacon });
    });

    // 10. AUTHENTIC 3D PROCEDURAL CHIBI CHARACTER (NO PHOTO)
    const characterGroup = new THREE.Group();
    characterGroup.position.set(playerStateRef.current.x, 0.65, playerStateRef.current.z);
    scene.add(characterGroup);

    // Dynamic Soft Circular Drop Shadow
    const shadowGeo = new THREE.CircleGeometry(0.85, 20);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x2a2018,
      transparent: true,
      opacity: 0.28
    });
    const playerShadow = new THREE.Mesh(shadowGeo, shadowMat);
    playerShadow.rotation.x = -Math.PI / 2;
    playerShadow.position.y = 0.02;
    characterGroup.add(playerShadow);

    // Character Mesh Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf3cfae, roughness: 0.7 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x2e2522, roughness: 0.8 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xdb6a41, roughness: 0.6 }); // Heart Island Coral Polo
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x3b3a42, roughness: 0.7 }); // Navy trousers
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0xf6f4ef, roughness: 0.4 }); // White trainers
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x221c1c });
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xf2a1a1 });

    // Legs
    const legL = new THREE.Group();
    legL.position.set(-0.24, 0.65, 0);
    characterGroup.add(legL);

    const legLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.6, 0.26), pantsMat);
    legLMesh.position.y = -0.3;
    legLMesh.castShadow = true;
    legL.add(legLMesh);

    const shoeLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.42), shoeMat);
    shoeLMesh.position.set(0, -0.55, 0.07);
    shoeLMesh.castShadow = true;
    legL.add(shoeLMesh);

    const legR = new THREE.Group();
    legR.position.set(0.24, 0.65, 0);
    characterGroup.add(legR);

    const legRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.6, 0.26), pantsMat);
    legRMesh.position.y = -0.3;
    legRMesh.castShadow = true;
    legR.add(legRMesh);

    const shoeRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.42), shoeMat);
    shoeRMesh.position.set(0, -0.55, 0.07);
    shoeRMesh.castShadow = true;
    legR.add(shoeRMesh);

    // Upper Body
    const upperBody = new THREE.Group();
    upperBody.position.y = 0.65;
    characterGroup.add(upperBody);

    const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.75, 0.44), shirtMat);
    torsoMesh.position.y = 0.38;
    torsoMesh.castShadow = true;
    upperBody.add(torsoMesh);

    // Arms
    const armL = new THREE.Group();
    armL.position.set(-0.45, 0.68, 0);
    upperBody.add(armL);

    const armLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.55, 0.2), shirtMat);
    armLMesh.position.y = -0.25;
    armLMesh.castShadow = true;
    armL.add(armLMesh);

    const armR = new THREE.Group();
    armR.position.set(0.45, 0.68, 0);
    upperBody.add(armR);

    const armRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.55, 0.2), shirtMat);
    armRMesh.position.y = -0.25;
    armRMesh.castShadow = true;
    armR.add(armRMesh);

    // Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.25, 0);
    upperBody.add(headGroup);

    const headBase = new THREE.Mesh(new THREE.SphereGeometry(0.52, 16, 14), skinMat);
    headBase.castShadow = true;
    headGroup.add(headBase);

    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.56, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
      hairMat
    );
    hairCap.rotation.x = -0.2;
    hairCap.position.set(0, 0.05, -0.05);
    headGroup.add(hairCap);

    // 3D Chibi Face Eyes, Blush & Smile
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), eyeMat);
    eyeL.position.set(-0.16, 0.04, 0.49);
    headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), eyeMat);
    eyeR.position.set(0.16, 0.04, 0.49);
    headGroup.add(eyeR);

    const blushL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), blushMat);
    blushL.position.set(-0.25, -0.06, 0.45);
    headGroup.add(blushL);

    const blushR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), blushMat);
    blushR.position.set(0.25, -0.06, 0.45);
    headGroup.add(blushR);

    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.018, 6, 12, Math.PI), eyeMat);
    smile.rotation.x = Math.PI;
    smile.position.set(0, -0.1, 0.5);
    headGroup.add(smile);

    // Raycaster for clicking buildings
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (event: MouseEvent) => {
      pointerDownPos = { x: event.clientX, y: event.clientY };
    };

    const onPointerUp = (event: MouseEvent) => {
      if (activeProductRef.current) return;
      const dx = Math.abs(event.clientX - pointerDownPos.x);
      const dy = Math.abs(event.clientY - pointerDownPos.y);
      if (dx > 5 || dy > 5) return; // Ignore drag/orbit

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      for (const bm of buildingMeshes) {
        const hits = raycaster.intersectObjects(bm.group.children, true);
        if (hits.length > 0) {
          sound.playInteract();
          onOpenProductRef.current(bm.product);
          return;
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // 11. SILKY-SMOOTH DELTA-TIME ANIMATION & ORBIT CONTROLS FOLLOW
    const clock = new THREE.Clock();
    let animationId: number;
    let ticks = 0;
    let lastUiSyncTime = performance.now();
    const lastSyncedPos = { x: playerStateRef.current.x, z: playerStateRef.current.z };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.08); // Delta time capped at 80ms
      ticks++;
      const p = playerStateRef.current;
      const keys = keysRef.current;

      // Keyboard input vector
      let inputX = 0;
      let inputZ = 0;

      if (!activeProductRef.current) {
        if (keys['up']) inputZ -= 1;
        if (keys['down']) inputZ += 1;
        if (keys['left']) inputX -= 1;
        if (keys['right']) inputX += 1;

        const jv = joystickVectorRef.current;
        if (jv.x !== 0 || jv.y !== 0) {
          inputX = jv.x;
          inputZ = jv.y;
        }
      }

      const hasInput = inputX !== 0 || inputZ !== 0;
      p.isMoving = hasInput;

      // Camera-relative direction vector
      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir);
      camDir.y = 0;
      camDir.normalize();
      const camRight = new THREE.Vector3(-camDir.z, 0, camDir.x).normalize();

      let targetVx = 0;
      let targetVz = 0;
      const moveSpeed = 13.5; // units per second

      if (hasInput) {
        const moveDir = new THREE.Vector3()
          .addScaledVector(camRight, inputX)
          .addScaledVector(camDir, -inputZ)
          .normalize();

        targetVx = moveDir.x * moveSpeed;
        targetVz = moveDir.z * moveSpeed;

        p.targetRotationY = Math.atan2(moveDir.x, moveDir.z);
      }

      // Smooth acceleration & deceleration (Eliminates abrupt stutter)
      p.vx += (targetVx - p.vx) * 0.28;
      p.vz += (targetVz - p.vz) * 0.28;

      let nextX = p.x + p.vx * delta;
      let nextZ = p.z + p.vz * delta;

      // Soft Repel around KSP Central Fountain (Prevents getting stuck at spawn)
      const fountainDist = Math.hypot(nextX, nextZ - 2.8);
      if (fountainDist < 1.7) {
        const angle = Math.atan2(nextZ - 2.8, nextX);
        nextX = Math.cos(angle) * 1.7;
        nextZ = 2.8 + Math.sin(angle) * 1.7;
      }

      // Smooth Collision Check (Island & Bridges with Wall Sliding)
      if (isWalkable(nextX, nextZ)) {
        p.x = nextX;
        p.z = nextZ;
      } else if (isWalkable(nextX, p.z)) {
        p.x = nextX;
        p.vz = 0;
      } else if (isWalkable(p.x, nextZ)) {
        p.z = nextZ;
        p.vx = 0;
      } else {
        p.vx = 0;
        p.vz = 0;
      }

      // Character Rotation & Limb Animations
      if (p.isMoving || Math.hypot(p.vx, p.vz) > 0.5) {
        let diff = p.targetRotationY - p.rotationY;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        p.rotationY += diff * 0.25;

        p.walkTimer += delta * 12;
        const swing = Math.sin(p.walkTimer) * 0.65;
        legL.rotation.x = swing;
        legR.rotation.x = -swing;
        armL.rotation.x = -swing * 0.7;
        armR.rotation.x = swing * 0.7;
        upperBody.position.y = 0.65 + Math.abs(Math.sin(p.walkTimer)) * 0.1;

        p.stepTimer += delta * 60;
        if (p.stepTimer >= 18) {
          p.stepTimer = 0;
          sound.playStep();
        }
      } else {
        legL.rotation.x = 0;
        legR.rotation.x = 0;
        armL.rotation.x = 0;
        armR.rotation.x = 0;
        upperBody.position.y = 0.65 + Math.sin(ticks * 0.05) * 0.02;
      }

      characterGroup.position.set(p.x, 0.65, p.z);
      characterGroup.rotation.y = p.rotationY;

      // JITTER-FREE CAMERA FOLLOW:
      // Slide controls target toward player smoothly, preserving user's OrbitControls orientation
      const targetPos = new THREE.Vector3(p.x, 1.2, p.z);
      const camShift = targetPos.clone().sub(controls.target).multiplyScalar(0.12);
      controls.target.add(camShift);
      camera.position.add(camShift);
      controls.update();

      // Throttle React state update to 250ms (ONLY if player actually moved > 0.15 units)
      const now = performance.now();
      if (now - lastUiSyncTime > 250) {
        lastUiSyncTime = now;
        if (Math.hypot(p.x - lastSyncedPos.x, p.z - lastSyncedPos.z) > 0.15) {
          lastSyncedPos.x = p.x;
          lastSyncedPos.z = p.z;
          setPlayerPosRef.current({ x: p.x, z: p.z });
        }
      }

      // Animated Kaohsiung Light Rail Tram (輕軌巡迴動畫)
      const lrtTime = ticks * 0.008;
      const lrtTrackX = Math.sin(lrtTime) * 18;
      const lrtTrackZ = Math.cos(lrtTime) * 14;
      lrtGroup.position.set(lrtTrackX, 0.72, lrtTrackZ);
      lrtGroup.rotation.y = lrtTime + Math.PI / 2;

      // Animated Harbor Sailboats Gentle Bobbing
      boats.forEach((b, idx) => {
        b.position.y = Math.sin(ticks * 0.04 + idx) * 0.12;
        b.rotation.z = Math.sin(ticks * 0.03 + idx) * 0.04;
      });

      // Check proximity to buildings
      let currentNearby: FixoProduct | null = null;
      for (const bm of buildingMeshes) {
        const pos = islandCenters.get(bm.product.id);
        if (!pos) continue;
        const dist = Math.hypot(p.x - pos.x, p.z - pos.z);
        const isClose = dist < INTERACTION_DIST;
        if (isClose) {
          currentNearby = bm.product;
        }

        const pulse = isClose ? Math.sin(ticks * 0.15) * 0.3 + 0.8 : 0.45;
        (bm.beacon.material as THREE.MeshBasicMaterial).opacity = pulse;
        bm.beacon.scale.setScalar(isClose ? 1.15 : 1.0);

        const turbine = bm.group.getObjectByName('turbine_hub');
        if (turbine) {
          turbine.rotation.z += 0.08;
        }
      }

      // ONLY update state if proximity target actually changed
      if (currentNearby?.id !== nearbyProductRef.current?.id) {
        nearbyProductRef.current = currentNearby;
        setNearbyProduct(currentNearby);
      }

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full select-none">
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none" />

      {/* Heart Island Floating Interaction Card */}
      {nearbyProduct && !activeProduct && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-auto z-30 animate-in fade-in slide-in-from-top-4 duration-200">
          <button
            type="button"
            onClick={() => {
              sound.playInteract();
              onOpenProduct(nearbyProduct);
            }}
            className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#fff8f4]/95 border-2 border-[#db6a41] shadow-2xl backdrop-blur-md text-slate-800 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span className="text-2xl">{nearbyProduct.building.symbol}</span>
            <div className="text-left">
              <div className="text-[11px] font-mono font-bold text-[#db6a41] flex items-center gap-1.5">
                <span>[SPACE / E] 或 點擊互動</span>
                <span className="w-2 h-2 rounded-full bg-[#db6a41] animate-ping" />
              </div>
              <div className="text-sm font-bold text-slate-900">
                檢視 {nearbyProduct.name}
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
