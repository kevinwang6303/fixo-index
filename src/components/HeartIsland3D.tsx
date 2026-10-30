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
const INTERACTION_DIST = 4.8;
const MOVE_SPEED = 0.28;

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
  const clickTargetRef = useRef<THREE.Vector3 | null>(null);
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
    isMoving: false,
    facingLeft: false,
    walkTimer: 0,
    stepTimer: 0
  });

  // Handle external teleport / dock fly-to
  useEffect(() => {
    if (teleportTarget) {
      playerStateRef.current.x = teleportTarget.x;
      playerStateRef.current.z = teleportTarget.z;
      clickTargetRef.current = null;
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
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(key)) {
        keysRef.current[key] = true;
      }
      if ((e.key === ' ' || key === 'e') && nearbyProduct) {
        e.preventDefault();
        sound.playInteract();
        onOpenProduct(nearbyProduct);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
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

    // Orbit Controls with damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera sinking under water
    controls.minDistance = 12;
    controls.maxDistance = 110;
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
    // Sky Dome
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

    // Island Ground Style Tones
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

      // A. Top Beveled Hexagon Ground Surface (y = 0.2)
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

      // B. Sandstone Cliff Strata Underneath (Tapers into water)
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

      // C. Shallow Water Lagoon Shelf Contour
      const lagoonGeo = new THREE.CylinderGeometry(HEX_R * 1.15, HEX_R * 1.15, 0.12, 6);
      const lagoonMat = new THREE.MeshBasicMaterial({
        color: 0xa4d4da,
        transparent: true,
        opacity: 0.52
      });
      const lagoon = new THREE.Mesh(lagoonGeo, lagoonMat);
      lagoon.position.y = -0.15;
      g.add(lagoon);

      // D. Inner Walking Ring Tile Promenade (Heart Island signature promenade)
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

    // 6. Build Connecting Bridges Between Adjacent Hex Islands
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
      const bridgeLen = dist * 0.38;

      const bridgeGroup = new THREE.Group();
      bridgeGroup.position.set(midX, 0.65, midZ);
      bridgeGroup.lookAt(posB.x, 0.65, posB.z);

      // Deck
      const deckGeo = new THREE.BoxGeometry(1.5, 0.15, bridgeLen);
      const deck = new THREE.Mesh(deckGeo, bridgeDeckMat);
      deck.castShadow = true;
      deck.receiveShadow = true;
      bridgeGroup.add(deck);

      // Left & Right Railings with white posts
      for (const side of [-0.75, 0.75]) {
        const railGeo = new THREE.BoxGeometry(0.08, 0.08, bridgeLen);
        const rail = new THREE.Mesh(railGeo, bridgeRailingMat);
        rail.position.set(side, 0.4, 0);
        rail.castShadow = true;
        bridgeGroup.add(rail);

        for (let p = -1; p <= 1; p++) {
          const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.45, 8);
          const post = new THREE.Mesh(postGeo, bridgeRailingMat);
          post.position.set(side, 0.22, (p * bridgeLen) / 2.4);
          post.castShadow = true;
          bridgeGroup.add(post);
        }
      }

      islandsGroup.add(bridgeGroup);
    });

    // 7. Low-Poly Handcrafted Scenery: Trees, Benches, Street Lamps
    const decorGroup = new THREE.Group();
    scene.add(decorGroup);

    // Tree creation helpers
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

    // Scatter trees & lamps across the islands
    islandCenters.forEach((pos, key) => {
      if (key === 'hub') {
        addRoundTree(pos.x - 3.8, 0.65, pos.z - 3.6, 0.9);
        addRoundTree(pos.x + 3.8, 0.65, pos.z - 3.6, 0.9);
        addPineTree(pos.x - 4.2, 0.65, pos.z + 3.4, 0.95);
        addPineTree(pos.x + 4.2, 0.65, pos.z + 3.4, 0.95);
        addStreetLamp(pos.x - 2.8, 0.65, pos.z);
        addStreetLamp(pos.x + 2.8, 0.65, pos.z);
      } else {
        // Scatter around outer perimeter
        addRoundTree(pos.x - 4.2, 0.65, pos.z - 3.2, 0.85);
        addPineTree(pos.x + 4.4, 0.65, pos.z - 2.8, 0.9);
        addRoundTree(pos.x + 3.5, 0.65, pos.z + 3.8, 0.8);
        addStreetLamp(pos.x, 0.65, pos.z + 4.5);
      }
    });

    // 8. Build Central Hub Monument: Grand Fountain & Holographic FiXo Crest
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

    // Rotating FiXo Crest Cube at Fountain
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

    // 9. Build 10 Distinct Low-Poly Miniature Architectural Pavilions
    const buildingMeshes: { product: FixoProduct; group: THREE.Group; beacon: THREE.Mesh }[] = [];

    // Helper: create cute floating pill label
    const createPillSprite = (text: string, iconSymbol: string, colorHex: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 380;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Pill background (Heart Island Cream Pill)
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

      // Building Wall & Roof Materials (Heart Island Warm Palette)
      const wallMat = new THREE.MeshStandardMaterial({ color: 0xfff8f4, roughness: 0.5 });
      const roofMat = new THREE.MeshStandardMaterial({ color: colorInt, roughness: 0.4 });
      const woodTrimMat = new THREE.MeshStandardMaterial({ color: 0x8a6a4e, roughness: 0.6 });
      const windowMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.4 });

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

      // Procedural Miniature Low-Poly Architecture per product
      if (prod.id === 'cam') {
        // CAM Citadel: Town hall with clock pediment & columns
        const base = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.2, 3.6), wallMat);
        base.position.y = 1.6;
        base.castShadow = true;
        bGroup.add(base);

        const pediment = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.6, 4), roofMat);
        pediment.rotation.y = Math.PI / 4;
        pediment.position.y = 3.9;
        pediment.castShadow = true;
        bGroup.add(pediment);
      } else if (prod.id === 'vpc') {
        // VPC Network Station: Twin antenna towers & data hub
        const base = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.6, 3.2), wallMat);
        base.position.y = 1.3;
        base.castShadow = true;
        bGroup.add(base);

        for (const side of [-1.4, 1.4]) {
          const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.16, 4.2, 8), woodTrimMat);
          mast.position.set(side, 3.4, 0);
          mast.castShadow = true;
          bGroup.add(mast);
        }
      } else if (prod.id === 'fico') {
        // FiCo Supercomputing Center: Dual gabled high-tech center
        const base = new THREE.Mesh(new THREE.BoxGeometry(4.6, 4.2, 3.4), wallMat);
        base.position.y = 2.1;
        base.castShadow = true;
        bGroup.add(base);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(3.5, 2.2, 4), roofMat);
        roof.rotation.y = Math.PI / 4;
        roof.position.y = 5.2;
        roof.castShadow = true;
        bGroup.add(roof);
      } else if (prod.id === 'fibo') {
        // FiBo Storage Port: Warehouse with storage bay
        const warehouse = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.8, 3.6), wallMat);
        warehouse.position.y = 1.4;
        warehouse.castShadow = true;
        bGroup.add(warehouse);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(3.3, 1.5, 4), roofMat);
        roof.rotation.y = Math.PI / 4;
        roof.position.y = 3.5;
        roof.castShadow = true;
        bGroup.add(roof);
      } else if (prod.id === 'lbs') {
        // LBS Lighthouse: Striped maritime lighthouse
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.6, 6.2, 12), wallMat);
        tower.position.y = 3.1;
        tower.castShadow = true;
        bGroup.add(tower);

        const lampRoom = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 1.2, 12), windowMat);
        lampRoom.position.y = 6.4;
        lampRoom.castShadow = true;
        bGroup.add(lampRoom);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.4, 12), roofMat);
        roof.position.y = 7.6;
        roof.castShadow = true;
        bGroup.add(roof);
      } else if (prod.id === 'cis') {
        // CIS Harbor Dock: Modular container terminal
        const c1 = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.6, 2.2), roofMat);
        c1.position.set(0, 0.8, 0);
        c1.castShadow = true;
        bGroup.add(c1);

        const c2 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.4, 1.8), wallMat);
        c2.position.set(0, 2.2, 0);
        c2.castShadow = true;
        bGroup.add(c2);
      } else if (prod.id === 'kms') {
        // KMS Vault: Fortified stone fortress with heavy archway
        const vault = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.8, 3.4, 6), wallMat);
        vault.position.y = 1.7;
        vault.castShadow = true;
        bGroup.add(vault);

        const lockWheel = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.2, 8, 16), roofMat);
        lockWheel.position.set(0, 1.8, 2.4);
        bGroup.add(lockWheel);
      } else if (prod.id === 'fiwo') {
        // FiWo Modern Workspace Studio: Glass pavilion
        const studio = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.8, 3.4), wallMat);
        studio.position.y = 1.4;
        studio.castShadow = true;
        bGroup.add(studio);

        const glassFront = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.0, 0.1), windowMat);
        glassFront.position.set(0, 1.4, 1.72);
        bGroup.add(glassFront);
      } else if (prod.id === 'bds') {
        // BDS Observatory: Astronomical dome
        const base = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.5, 2.2, 16), wallMat);
        base.position.y = 1.1;
        base.castShadow = true;
        bGroup.add(base);

        const dome = new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), roofMat);
        dome.position.y = 2.2;
        dome.castShadow = true;
        bGroup.add(dome);
      } else {
        // Meter Telemetry Station: Wind turbine tower
        const base = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 3.2), wallMat);
        base.position.y = 1.2;
        base.castShadow = true;
        bGroup.add(base);

        const turbineMast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 4.2, 8), woodTrimMat);
        turbineMast.position.set(0, 4.2, 0);
        turbineMast.castShadow = true;
        bGroup.add(turbineMast);
      }

      // Cute Floating Title Pill above building
      const pillSprite = createPillSprite(prod.name, prod.building.symbol, prod.color.primary);
      pillSprite.position.set(0, 6.8, 0);
      bGroup.add(pillSprite);

      buildingMeshes.push({ product: prod, group: bGroup, beacon });
    });

    // 10. Sean Character Avatar (Using sean.png)
    const textureLoader = new THREE.TextureLoader();
    const seanTexture = textureLoader.load('./sean.png');
    seanTexture.magFilter = THREE.NearestFilter;
    seanTexture.minFilter = THREE.LinearMipMapLinearFilter;

    const seanHeight = 2.6;
    const seanWidth = 2.18;
    const seanGeo = new THREE.PlaneGeometry(seanWidth, seanHeight);
    const seanMat = new THREE.MeshStandardMaterial({
      map: seanTexture,
      transparent: true,
      alphaTest: 0.1,
      roughness: 0.3,
      side: THREE.DoubleSide
    });
    const playerMesh = new THREE.Mesh(seanGeo, seanMat);
    playerMesh.position.set(playerStateRef.current.x, 0.65 + seanHeight / 2, playerStateRef.current.z);
    playerMesh.castShadow = true;
    scene.add(playerMesh);

    // Dynamic Soft Circular Drop Shadow
    const shadowGeo = new THREE.CircleGeometry(0.95, 20);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x292524,
      transparent: true,
      opacity: 0.35
    });
    const playerShadow = new THREE.Mesh(shadowGeo, shadowMat);
    playerShadow.rotation.x = -Math.PI / 2;
    playerShadow.position.y = 0.67;
    scene.add(playerShadow);

    // Click Destination Ripple Target
    const targetRingGeo = new THREE.RingGeometry(0.6, 0.9, 24);
    const targetRingMat = new THREE.MeshBasicMaterial({
      color: 0xdb6a41, // Heart Island Coral
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const targetRing = new THREE.Mesh(targetRingGeo, targetRingMat);
    targetRing.rotation.x = -Math.PI / 2;
    targetRing.position.y = 0.68;
    targetRing.visible = false;
    scene.add(targetRing);

    // Raycasting for clicking ground or buildings
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: MouseEvent) => {
      if (activeProduct) return;
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

      // Check click on ground / islands
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.65);
      const hitPoint = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(groundPlane, hitPoint)) {
        clickTargetRef.current = hitPoint;
        targetRing.position.set(hitPoint.x, 0.68, hitPoint.z);
        targetRing.visible = true;
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    // 11. Animation & Physics Loop
    let animationId: number;
    let ticks = 0;

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

      // Character Movement
      let moveX = 0;
      let moveZ = 0;

      if (!activeProduct) {
        if (keys['w'] || keys['arrowup']) moveZ -= 1;
        if (keys['s'] || keys['arrowdown']) moveZ += 1;
        if (keys['a'] || keys['arrowleft']) moveX -= 1;
        if (keys['d'] || keys['arrowright']) moveX += 1;

        if (joystickVector.x !== 0 || joystickVector.y !== 0) {
          moveX = joystickVector.x;
          moveZ = joystickVector.y;
          clickTargetRef.current = null;
          targetRing.visible = false;
        }

        if (clickTargetRef.current && moveX === 0 && moveZ === 0) {
          const dx = clickTargetRef.current.x - p.x;
          const dz = clickTargetRef.current.z - p.z;
          const dist = Math.hypot(dx, dz);
          if (dist > 0.4) {
            moveX = dx / dist;
            moveZ = dz / dist;
          } else {
            clickTargetRef.current = null;
            targetRing.visible = false;
          }
        }
      }

      const isMoving = moveX !== 0 || moveZ !== 0;
      p.isMoving = isMoving;

      if (isMoving) {
        const len = Math.hypot(moveX, moveZ);
        p.x += (moveX / len) * MOVE_SPEED;
        p.z += (moveZ / len) * MOVE_SPEED;

        if (moveX < -0.05) p.facingLeft = true;
        else if (moveX > 0.05) p.facingLeft = false;

        p.walkTimer += 0.24;
        p.stepTimer++;
        if (p.stepTimer % 20 === 0) {
          sound.playStep();
        }

        if (ticks % 6 === 0) {
          setPlayerPos({ x: p.x, z: p.z });
        }
      }

      // Update Sean avatar mesh
      playerMesh.scale.x = p.facingLeft ? -1 : 1;
      const bob = p.isMoving ? Math.sin(p.walkTimer) * 0.16 : Math.sin(ticks * 0.05) * 0.04;
      playerMesh.position.set(p.x, 0.65 + seanHeight / 2 + bob, p.z);
      // Billboard Sean to face the camera
      playerMesh.rotation.y = camera.rotation.y;
      playerShadow.position.set(p.x, 0.67, p.z);

      if (targetRing.visible) {
        targetRing.scale.setScalar(1 + Math.sin(ticks * 0.15) * 0.15);
      }

      // Floating clouds animation
      clouds.forEach((cl, i) => {
        cl.position.x += 0.035 + (i % 3) * 0.01;
        if (cl.position.x > 90) cl.position.x = -90;
      });

      // Rotating Fountain Core
      crestCube.rotation.y += 0.015;
      crestCube.rotation.x += 0.008;

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
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [products, activeProduct, joystickVector, setPlayerPos, onOpenProduct]);

  return (
    <div className="relative w-full h-full select-none">
      <div ref={mountRef} className="absolute inset-0 cursor-crosshair touch-none" />

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
