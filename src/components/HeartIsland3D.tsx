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

const HEX_R = 8.2;
const SQ3 = Math.sqrt(3);
const INTERACTION_DIST = 4.6;
const MOVE_SPEED = 0.24;

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

  // Character internal physics state
  const playerStateRef = useRef({
    x: playerPos.x,
    z: playerPos.z,
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
      setPlayerPos({ x: teleportTarget.x, z: teleportTarget.z });
      sound.playTeleport();

      // Smoothly glide camera to target
      if (controlsRef.current && cameraRef.current) {
        const controls = controlsRef.current;
        const cam = cameraRef.current;
        const offset = isBirdEye ? new THREE.Vector3(0, 48, 2) : new THREE.Vector3(0, 26, 26);
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
      cam.position.set(px, 58, pz + 4);
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

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (activeProduct) return;
      const key = (e.key || '').toLowerCase();
      const code = (e.code || '').toLowerCase();

      if (key === 'w' || code === 'keyw' || key === 'arrowup' || code === 'arrowup') keysRef.current['up'] = true;
      if (key === 's' || code === 'keys' || key === 'arrowdown' || code === 'arrowdown') keysRef.current['down'] = true;
      if (key === 'a' || code === 'keya' || key === 'arrowleft' || code === 'arrowleft') keysRef.current['left'] = true;
      if (key === 'd' || code === 'keyd' || key === 'arrowright' || code === 'arrowright') keysRef.current['right'] = true;

      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key) ||
          ['keyw', 'keys', 'keya', 'keyd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(code)) {
        // prevent page scrolling
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
        }
      }

      if ((e.key === ' ' || code === 'space' || key === 'e' || code === 'keye') && nearbyProduct) {
        e.preventDefault();
        sound.playInteract();
        onOpenProduct(nearbyProduct);
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
  }, [nearbyProduct, activeProduct, onOpenProduct]);

  // Main Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf4eee3, 55, 180);

    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 26, 28);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // Orbit Controls (Mouse rotates view, pans, zooms!)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera sinking under water
    controls.minDistance = 12;
    controls.maxDistance = 120;
    controls.target.set(0, 1.2, 0);
    controlsRef.current = controls;

    // 2. Lighting (Heart Island Golden Sunlight & Sky Light)
    const hemiLight = new THREE.HemisphereLight(0xeef6fa, 0x8f8270, 1.35);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff1de, 2.6);
    sunLight.position.set(38, 55, 32);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 140;
    const sd = 45;
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

    // 3. Sky Dome & Sparkling Pastel Water Plane
    const skyGeo = new THREE.SphereGeometry(220, 32, 16);
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

    // Water Plane
    const waterGeo = new THREE.PlaneGeometry(500, 500, 32, 32);
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

    // 4. Low-poly Floating Clouds
    const cloudGroup = new THREE.Group();
    scene.add(cloudGroup);
    const clouds: THREE.Group[] = [];
    const createCloud = () => {
      const g = new THREE.Group();
      const puffMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true });
      const n = 5 + Math.floor(Math.random() * 4);
      for (let i = 0; i < n; i++) {
        const r = 2.2 + Math.random() * 2.2;
        const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), puffMat);
        puff.position.set((i - n / 2) * 2.6, Math.random() * 1.2, (Math.random() - 0.5) * 2.5);
        g.add(puff);
      }
      return g;
    };
    for (let c = 0; c < 8; c++) {
      const cl = createCloud();
      cl.position.set((Math.random() - 0.5) * 160, 24 + Math.random() * 12, (Math.random() - 0.5) * 160);
      cl.scale.setScalar(0.75 + Math.random() * 0.5);
      cloudGroup.add(cl);
      clouds.push(cl);
    }

    // 5. Hexagonal Archipelago Generation
    const islandCenters = new Map<string, { x: number; z: number }>();
    const islandsGroup = new THREE.Group();
    scene.add(islandsGroup);

    // Island Ground Style Tones (Heart Island Palette)
    const GROUND_COLORS: Record<string, number> = {
      hub: 0xf4f1ec, // Central Granite Plaza
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
    const buildHexIsland = (id: string, q: number, r: number, groundColor: number, _name?: string) => {
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

    // Build Central Hub
    buildHexIsland('hub', 0, 0, GROUND_COLORS.hub, 'FiXo 核心大會堂');

    // Build 10 Product Hex Islands
    products.forEach((prod) => {
      const { q, r } = prod.building.hex;
      const gColor = GROUND_COLORS[prod.id] || 0xb9cd98;
      buildHexIsland(prod.id, q, r, gColor, prod.name);
    });

    // 6. Connecting Bridges & Collision Path Definition
    const bridgeDeckMat = new THREE.MeshStandardMaterial({ color: 0xb48560, roughness: 0.7 });
    const bridgeRailingMat = new THREE.MeshStandardMaterial({ color: 0xfff8f4, roughness: 0.4 });

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
      const bridgeLen = dist * 0.44;

      const bridgeGroup = new THREE.Group();
      bridgeGroup.position.set(midX, 0.65, midZ);
      bridgeGroup.lookAt(posB.x, 0.65, posB.z);

      // Deck
      const deckGeo = new THREE.BoxGeometry(1.8, 0.16, bridgeLen);
      const deck = new THREE.Mesh(deckGeo, bridgeDeckMat);
      deck.castShadow = true;
      deck.receiveShadow = true;
      bridgeGroup.add(deck);

      // Left & Right Railings with white posts
      for (const side of [-0.9, 0.9]) {
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

      islandsGroup.add(bridgeGroup);
    });

    // COLLISION TEST FUNCTION: keeps Sean on the islands and bridges!
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
      // 1. Inside any hexagon island
      for (const center of islandCenters.values()) {
        const d = Math.hypot(px - center.x, pz - center.z);
        if (d <= HEX_R - 0.2) {
          return true;
        }
      }

      // 2. On any bridge
      for (const [idA, idB] of adjacentPairs) {
        const posA = islandCenters.get(idA);
        const posB = islandCenters.get(idB);
        if (posA && posB) {
          if (distToSegment(px, pz, posA.x, posA.z, posB.x, posB.z) <= 1.4) {
            return true;
          }
        }
      }

      return false; // Open water
    };

    // 7. Low-Poly Scenery: Trees, Benches, Street Lamps
    const decorGroup = new THREE.Group();
    scene.add(decorGroup);

    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x8a6a4e, roughness: 0.8 });
    const leafMats = [
      new THREE.MeshStandardMaterial({ color: 0x9cc27a, roughness: 0.7, flatShading: true }),
      new THREE.MeshStandardMaterial({ color: 0x8db86f, roughness: 0.7, flatShading: true }),
      new THREE.MeshStandardMaterial({ color: 0x71806a, roughness: 0.7, flatShading: true })
    ];

    const addRoundTree = (x: number, y: number, z: number, scale = 1.0) => {
      const t = new THREE.Group();
      t.position.set(x, y, z);
      t.scale.setScalar(scale);

      const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 1.4, 8);
      const trunk = new THREE.Mesh(trunkGeo, treeTrunkMat);
      trunk.position.y = 0.7;
      trunk.castShadow = true;
      t.add(trunk);

      const leafGeo = new THREE.DodecahedronGeometry(1.25, 1);
      const mat = leafMats[Math.floor(Math.random() * leafMats.length)];
      const foliage = new THREE.Mesh(leafGeo, mat);
      foliage.position.y = 1.9;
      foliage.castShadow = true;
      t.add(foliage);

      decorGroup.add(t);
    };

    const addPineTree = (x: number, y: number, z: number, scale = 1.0) => {
      const t = new THREE.Group();
      t.position.set(x, y, z);
      t.scale.setScalar(scale);

      const trunkGeo = new THREE.CylinderGeometry(0.15, 0.22, 1.2, 8);
      const trunk = new THREE.Mesh(trunkGeo, treeTrunkMat);
      trunk.position.y = 0.6;
      trunk.castShadow = true;
      t.add(trunk);

      for (let i = 0; i < 3; i++) {
        const coneGeo = new THREE.ConeGeometry(1.2 - i * 0.25, 1.1, 7);
        const cone = new THREE.Mesh(coneGeo, leafMats[2]);
        cone.position.y = 1.3 + i * 0.65;
        cone.castShadow = true;
        t.add(cone);
      }
      decorGroup.add(t);
    };

    const addStreetLamp = (x: number, y: number, z: number) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      const postGeo = new THREE.CylinderGeometry(0.06, 0.08, 2.2, 8);
      const postMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.y = 1.1;
      post.castShadow = true;
      g.add(post);

      const bulbGeo = new THREE.SphereGeometry(0.2, 12, 12);
      const bulbMat = new THREE.MeshStandardMaterial({
        color: 0xffedd5,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.95
      });
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.y = 2.2;
      g.add(bulb);
      decorGroup.add(g);
    };

    islandCenters.forEach((pos, key) => {
      if (key === 'hub') {
        addRoundTree(pos.x - 4.5, 0.65, pos.z - 4.2, 0.9);
        addRoundTree(pos.x + 4.5, 0.65, pos.z - 4.2, 0.9);
        addPineTree(pos.x - 4.8, 0.65, pos.z + 4.0, 0.95);
        addPineTree(pos.x + 4.8, 0.65, pos.z + 4.0, 0.95);
        addStreetLamp(pos.x - 3.2, 0.65, pos.z);
        addStreetLamp(pos.x + 3.2, 0.65, pos.z);
      } else {
        addRoundTree(pos.x - 4.8, 0.65, pos.z - 3.6, 0.85);
        addPineTree(pos.x + 5.0, 0.65, pos.z - 3.2, 0.9);
        addRoundTree(pos.x + 4.2, 0.65, pos.z + 4.4, 0.8);
        addStreetLamp(pos.x, 0.65, pos.z + 5.2);
      }
    });

    // 8. Central Hub Fountain & Monument
    const fountainGroup = new THREE.Group();
    fountainGroup.position.set(0, 0.65, 0);

    const basinGeo = new THREE.CylinderGeometry(2.8, 3.2, 0.6, 24);
    const basinMat = new THREE.MeshStandardMaterial({ color: 0xfff8f4, roughness: 0.3 });
    const basin = new THREE.Mesh(basinGeo, basinMat);
    basin.position.y = 0.3;
    basin.receiveShadow = true;
    fountainGroup.add(basin);

    const fountainWater = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 2.6, 0.1, 24),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.2 })
    );
    fountainWater.position.y = 0.55;
    fountainGroup.add(fountainWater);

    const centerPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.8, 2.8, 12),
      basinMat
    );
    centerPillar.position.y = 1.6;
    centerPillar.castShadow = true;
    fountainGroup.add(centerPillar);

    const crestCube = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.2, 1.2),
      new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.65,
        roughness: 0.2
      })
    );
    crestCube.position.y = 3.6;
    crestCube.castShadow = true;
    fountainGroup.add(crestCube);
    scene.add(fountainGroup);

    // 9. HIGH-DETAIL 3D MINIATURE ARCHITECTURAL PAVILIONS
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
      const trimMat = new THREE.MeshStandardMaterial({ color: 0x8a6a4e, roughness: 0.6 });
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

      // Procedural High-Detail Architecture
      if (prod.id === 'cam') {
        // CAM: Grand Neoclassical Townhall with Columns & Golden Clock Pediment
        const steps = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.3, 4.4), wallMat);
        steps.position.y = 0.15;
        bGroup.add(steps);

        const body = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.2, 3.6), wallMat);
        body.position.y = 1.9;
        body.castShadow = true;
        bGroup.add(body);

        // Columns in front
        for (const cx of [-1.5, -0.5, 0.5, 1.5]) {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 3.2, 12), wallMat);
          col.position.set(cx, 1.9, 2.0);
          col.castShadow = true;
          bGroup.add(col);
        }

        // Roof Pediment
        const roof = new THREE.Mesh(new THREE.ConeGeometry(3.4, 1.8, 4), roofMat);
        roof.rotation.y = Math.PI / 4;
        roof.position.y = 4.4;
        roof.castShadow = true;
        bGroup.add(roof);

        // Clock tower dome
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), trimMat);
        dome.position.y = 5.2;
        dome.castShadow = true;
        bGroup.add(dome);
      } else if (prod.id === 'vpc') {
        // VPC: High-Tech Relay Station with Lattice Towers & Conduits
        const base = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, 2.2, 6), wallMat);
        base.position.y = 1.1;
        base.castShadow = true;
        bGroup.add(base);

        const roof = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.6, 0.6, 6), roofMat);
        roof.position.y = 2.5;
        bGroup.add(roof);

        // Lattice towers
        for (const tx of [-1.4, 1.4]) {
          const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.22, 4.8, 8), metalMat);
          mast.position.set(tx, 3.8, 0);
          mast.castShadow = true;
          bGroup.add(mast);

          const tipLight = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), glassMat);
          tipLight.position.set(tx, 6.2, 0);
          bGroup.add(tipLight);
        }
      } else if (prod.id === 'fico') {
        // FiCo: Twin Server Skyscrapers with Skybridge & Penthouse Roofs
        const t1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 5.6, 2.4), wallMat);
        t1.position.set(-1.2, 2.8, 0);
        t1.castShadow = true;
        bGroup.add(t1);

        const t2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 5.6, 2.4), wallMat);
        t2.position.set(1.2, 2.8, 0);
        t2.castShadow = true;
        bGroup.add(t2);

        // Skybridge
        const bridge = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 1.2), glassMat);
        bridge.position.set(0, 4.2, 0);
        bGroup.add(bridge);

        // Server Penthouse Roofs
        for (const rx of [-1.2, 1.2]) {
          const r = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.4, 4), roofMat);
          r.rotation.y = Math.PI / 4;
          r.position.set(rx, 6.3, 0);
          r.castShadow = true;
          bGroup.add(r);
        }
      } else if (prod.id === 'fibo') {
        // FiBo: Maritime Storage Depot with Gantry Crane & Cylindrical Silos
        const depot = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.6, 3.2), wallMat);
        depot.position.y = 1.3;
        depot.castShadow = true;
        bGroup.add(depot);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.4, 4), roofMat);
        roof.rotation.y = Math.PI / 4;
        roof.position.y = 3.3;
        bGroup.add(roof);

        // Silos
        for (const [sx, sz] of [[1.8, 1.4], [1.8, -1.4]]) {
          const silo = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 3.6, 16), metalMat);
          silo.position.set(sx, 1.8, sz);
          silo.castShadow = true;
          bGroup.add(silo);
        }
      } else if (prod.id === 'lbs') {
        // LBS: Striped Seaside Lighthouse with Rotating Spotlight
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.6, 6.4, 16), wallMat);
        tower.position.y = 3.2;
        tower.castShadow = true;
        bGroup.add(tower);

        // Red stripes
        for (const sy of [2.0, 4.2]) {
          const stripe = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.4, 0.9, 16), roofMat);
          stripe.position.y = sy;
          bGroup.add(stripe);
        }

        const gallery = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.2, 16), metalMat);
        gallery.position.y = 6.5;
        bGroup.add(gallery);

        const lantern = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 1.2, 16), glassMat);
        lantern.position.y = 7.2;
        bGroup.add(lantern);

        const cap = new THREE.Mesh(new THREE.ConeGeometry(1.3, 1.2, 16), roofMat);
        cap.position.y = 8.3;
        bGroup.add(cap);
      } else if (prod.id === 'cis') {
        // CIS: Container Port Terminal with Stacked Shipping Containers
        const terminal = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 2.4), wallMat);
        terminal.position.set(-0.6, 1.1, 0);
        terminal.castShadow = true;
        bGroup.add(terminal);

        // Containers
        const c1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.2, 1.6), roofMat);
        c1.position.set(0.6, 0.6, 1.2);
        c1.castShadow = true;
        bGroup.add(c1);

        const c2 = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.2, 1.5), trimMat);
        c2.position.set(0.5, 1.8, 1.2);
        c2.castShadow = true;
        bGroup.add(c2);
      } else if (prod.id === 'kms') {
        // KMS: Granite Bunker Vault with Heavy Circular Steel Vault Door
        const bunker = new THREE.Mesh(new THREE.BoxGeometry(4.4, 3.2, 4.2), wallMat);
        bunker.position.y = 1.6;
        bunker.castShadow = true;
        bGroup.add(bunker);

        const battlement = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.6, 4.4), roofMat);
        battlement.position.y = 3.4;
        bGroup.add(battlement);

        // Bank Vault Door
        const doorFrame = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.3, 24), metalMat);
        doorFrame.rotation.x = Math.PI / 2;
        doorFrame.position.set(0, 1.7, 2.15);
        bGroup.add(doorFrame);

        const spoke = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.15, 8, 16), roofMat);
        spoke.position.set(0, 1.7, 2.3);
        bGroup.add(spoke);
      } else if (prod.id === 'fiwo') {
        // FiWo: Cantilevered Modern Glass Studio with Rooftop Terrace
        const base = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.6, 3.4), wallMat);
        base.position.y = 1.3;
        base.castShadow = true;
        bGroup.add(base);

        const glassWall = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.0, 0.1), glassMat);
        glassWall.position.set(0, 1.3, 1.72);
        bGroup.add(glassWall);

        const roofCanopy = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.3, 3.8), roofMat);
        roofCanopy.position.y = 2.75;
        bGroup.add(roofCanopy);
      } else if (prod.id === 'bds') {
        // BDS: Astronomical Observatory Dome & Giant Tilted Radar Dish
        const drum = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 2.4, 16), wallMat);
        drum.position.y = 1.2;
        drum.castShadow = true;
        bGroup.add(drum);

        const dome = new THREE.Mesh(new THREE.SphereGeometry(2.3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), roofMat);
        dome.position.y = 2.4;
        dome.castShadow = true;
        bGroup.add(dome);

        // Tilted dish antenna
        const dish = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 0.2, 0.6, 16), metalMat);
        dish.position.set(1.4, 4.5, 0);
        dish.rotation.z = Math.PI / 4;
        bGroup.add(dish);
      } else {
        // Meter: Eco-Station with Rotating Wind Turbine & Power Battery
        const station = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.4, 3.2), wallMat);
        station.position.y = 1.2;
        station.castShadow = true;
        bGroup.add(station);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.2, 4), roofMat);
        roof.rotation.y = Math.PI / 4;
        roof.position.y = 3.0;
        bGroup.add(roof);

        // Wind Turbine
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

    // 10. REAL 3D CHIBI SEAN AVATAR (Puma/Heart Island Procedural Chibi Model with Sean's Face)
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

    // A. Left & Right Legs
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

    // B. Upper Body (Hips, Torso, Arms, Head)
    const upperBody = new THREE.Group();
    upperBody.position.y = 0.65;
    characterGroup.add(upperBody);

    // Torso / Shirt
    const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.75, 0.44), shirtMat);
    torsoMesh.position.y = 0.38;
    torsoMesh.castShadow = true;
    upperBody.add(torsoMesh);

    // Left & Right Arms
    const armL = new THREE.Group();
    armL.position.set(-0.45, 0.68, 0);
    upperBody.add(armL);

    const armLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.55, 0.2), shirtMat);
    armLMesh.position.y = -0.25;
    armLMesh.castShadow = true;
    armL.add(armLMesh);

    const handL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), skinMat);
    handL.position.y = -0.55;
    armL.add(handL);

    const armR = new THREE.Group();
    armR.position.set(0.45, 0.68, 0);
    upperBody.add(armR);

    const armRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.55, 0.2), shirtMat);
    armRMesh.position.y = -0.25;
    armRMesh.castShadow = true;
    armR.add(armRMesh);

    const handR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), skinMat);
    handR.position.y = -0.55;
    armR.add(handR);

    // Head Group
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.25, 0);
    upperBody.add(headGroup);

    // Head Base
    const headBase = new THREE.Mesh(new THREE.SphereGeometry(0.52, 16, 14), skinMat);
    headBase.castShadow = true;
    headGroup.add(headBase);

    // Hair Cap
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.56, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
      hairMat
    );
    hairCap.rotation.x = -0.2;
    hairCap.position.set(0, 0.05, -0.05);
    headGroup.add(hairCap);

    // Heart Island 3D Chibi Face (Eyes, Blush, Smile)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x221c1c });
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xf2a1a1 });

    // Left and Right Eyes
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), eyeMat);
    eyeL.position.set(-0.16, 0.04, 0.49);
    headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), eyeMat);
    eyeR.position.set(0.16, 0.04, 0.49);
    headGroup.add(eyeR);

    // Cute Cheek Blush
    const blushL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), blushMat);
    blushL.position.set(-0.25, -0.06, 0.45);
    headGroup.add(blushL);

    const blushR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), blushMat);
    blushR.position.set(0.25, -0.06, 0.45);
    headGroup.add(blushR);

    // Cute Smile
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.018, 6, 12, Math.PI), eyeMat);
    smile.rotation.x = Math.PI;
    smile.position.set(0, -0.1, 0.5);
    headGroup.add(smile);

    // Raycasting for clicking buildings (NOT clicking ground to move)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (event: MouseEvent) => {
      pointerDownPos = { x: event.clientX, y: event.clientY };
    };

    const onPointerUp = (event: MouseEvent) => {
      if (activeProduct) return;
      const dx = Math.abs(event.clientX - pointerDownPos.x);
      const dy = Math.abs(event.clientY - pointerDownPos.y);
      // If mouse was dragged more than 5px, it was camera orbit, ignore
      if (dx > 5 || dy > 5) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check click on building
      for (const bm of buildingMeshes) {
        const hits = raycaster.intersectObjects(bm.group.children, true);
        if (hits.length > 0) {
          sound.playInteract();
          onOpenProduct(bm.product);
          return;
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // 11. Animation, Collision Physics & Camera Follow Loop
    let animationId: number;
    let ticks = 0;
    let lastPlayerX = playerStateRef.current.x;
    let lastPlayerZ = playerStateRef.current.z;

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      ticks++;
      const p = playerStateRef.current;
      const keys = keysRef.current;

      // 1. Calculate Keyboard Movement (Relative to Camera orientation)
      let inputX = 0;
      let inputZ = 0;

      if (!activeProduct) {
        if (keys['up']) inputZ -= 1;
        if (keys['down']) inputZ += 1;
        if (keys['left']) inputX -= 1;
        if (keys['right']) inputX += 1;

        if (joystickVector.x !== 0 || joystickVector.y !== 0) {
          inputX = joystickVector.x;
          inputZ = joystickVector.y;
        }
      }

      const hasInput = inputX !== 0 || inputZ !== 0;
      p.isMoving = hasInput;

      if (hasInput) {
        // Project movement onto camera ground plane
        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);
        camDir.y = 0;
        camDir.normalize();

        const camRight = new THREE.Vector3(-camDir.z, 0, camDir.x).normalize();

        const moveDir = new THREE.Vector3()
          .addScaledVector(camRight, inputX)
          .addScaledVector(camDir, -inputZ)
          .normalize();

        let targetX = p.x + moveDir.x * MOVE_SPEED;
        let targetZ = p.z + moveDir.z * MOVE_SPEED;

        // Fountain soft collision repel (fountain center is at (0, 0))
        const fountainDist = Math.hypot(targetX, targetZ);
        if (fountainDist < 1.6) {
          const pushAngle = Math.atan2(targetZ, targetX);
          targetX = Math.cos(pushAngle) * 1.6;
          targetZ = Math.sin(pushAngle) * 1.6;
        }

        // COLLISION DETECTION: Wall-sliding response
        if (isWalkable(targetX, targetZ)) {
          p.x = targetX;
          p.z = targetZ;
        } else if (isWalkable(targetX, p.z)) {
          p.x = targetX;
        } else if (isWalkable(p.x, targetZ)) {
          p.z = targetZ;
        }

        // Smooth rotation to face moving direction
        p.targetRotationY = Math.atan2(moveDir.x, moveDir.z);

        p.walkTimer += 0.25;
        p.stepTimer++;
        if (p.stepTimer % 20 === 0) {
          sound.playStep();
        }

        if (ticks % 6 === 0) {
          setPlayerPos({ x: p.x, z: p.z });
        }
      }

      // Smoothly rotate character toward target direction
      // Handle angular wrap around
      let diff = p.targetRotationY - p.rotationY;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      p.rotationY += diff * 0.25;

      characterGroup.position.set(p.x, 0.65, p.z);
      characterGroup.rotation.y = p.rotationY;

      // Walking Limb Animations
      if (p.isMoving) {
        const swing = Math.sin(p.walkTimer) * 0.65;
        legL.rotation.x = swing;
        legR.rotation.x = -swing;
        armL.rotation.x = -swing * 0.7;
        armR.rotation.x = swing * 0.7;
        upperBody.position.y = 0.65 + Math.abs(Math.sin(p.walkTimer)) * 0.1;
      } else {
        // Idle breathing
        legL.rotation.x = 0;
        legR.rotation.x = 0;
        armL.rotation.x = 0;
        armR.rotation.x = 0;
        upperBody.position.y = 0.65 + Math.sin(ticks * 0.05) * 0.02;
      }

      // 2. Camera Follows Player Position (Preserving user's Orbit rotation)
      const deltaX = p.x - lastPlayerX;
      const deltaZ = p.z - lastPlayerZ;
      if (deltaX !== 0 || deltaZ !== 0) {
        camera.position.x += deltaX;
        camera.position.z += deltaZ;
        controls.target.x += deltaX;
        controls.target.z += deltaZ;
      }
      lastPlayerX = p.x;
      lastPlayerZ = p.z;

      // 3. Clouds Animation
      clouds.forEach((cl, i) => {
        cl.position.x += 0.035 + (i % 3) * 0.01;
        if (cl.position.x > 90) cl.position.x = -90;
      });

      // 4. Rotating Elements
      crestCube.rotation.y += 0.015;
      crestCube.rotation.x += 0.008;

      // 5. Proximity Detection
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

        // Sub-elements rotation
        const turbine = bm.group.getObjectByName('turbine_hub');
        if (turbine) {
          turbine.rotation.z += 0.08;
        }
      }
      setNearbyProduct(currentNearby);

      controls.update();
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
  }, [products, activeProduct, joystickVector, setPlayerPos, onOpenProduct]);

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
