import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { FixoProduct } from '../types/product';
import { sound } from '../utils/audio';

interface ThreeCanvasProps {
  products: FixoProduct[];
  activeProduct: FixoProduct | null;
  onOpenProduct: (product: FixoProduct) => void;
  playerPos3D: { x: number; z: number };
  setPlayerPos3D: React.Dispatch<React.SetStateAction<{ x: number; z: number }>>;
  joystickVector: { x: number; y: number };
  teleportTarget: { x: number; z: number } | null;
  clearTeleport: () => void;
}

const INTERACTION_DIST = 5.2;
const MOVE_SPEED = 0.28;
const ISLAND_RADIUS = 36;

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  products,
  activeProduct,
  onOpenProduct,
  playerPos3D,
  setPlayerPos3D,
  joystickVector,
  teleportTarget,
  clearTeleport
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const clickTargetRef = useRef<THREE.Vector3 | null>(null);

  const [nearbyProduct, setNearbyProduct] = useState<FixoProduct | null>(null);

  // References to pass into the animation loop without re-triggering useEffect
  const playerStateRef = useRef({
    x: playerPos3D.x,
    z: playerPos3D.z,
    isMoving: false,
    facingLeft: false,
    walkTimer: 0,
    stepSoundTimer: 0
  });

  // Handle teleport
  useEffect(() => {
    if (teleportTarget) {
      playerStateRef.current.x = teleportTarget.x;
      playerStateRef.current.z = teleportTarget.z;
      clickTargetRef.current = null;
      setPlayerPos3D({ x: teleportTarget.x, z: teleportTarget.z });
      sound.playTeleport();
      clearTeleport();
    }
  }, [teleportTarget, clearTeleport, setPlayerPos3D]);

  // Key listeners
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
    scene.background = new THREE.Color(0x030712);
    scene.fog = new THREE.FogExp2(0x060d24, 0.009);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // Initial isometric perspective
    camera.position.set(0, 26, 26);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const hemiLight = new THREE.HemisphereLight(0xbfdbfe, 0x1e1b4b, 0.85);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    dirLight.position.set(30, 45, 25);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 120;
    const d = 45;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const cyanRimLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    cyanRimLight.position.set(-25, 20, -35);
    scene.add(cyanRimLight);

    // 3. Floating Island Landmass
    const islandGroup = new THREE.Group();
    scene.add(islandGroup);

    // Top Island Turf (cylinder with bevel/faceted sides)
    const turfGeo = new THREE.CylinderGeometry(40, 36, 4.5, 36);
    const turfMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7,
      metalness: 0.2
    });
    const turfMesh = new THREE.Mesh(turfGeo, turfMat);
    turfMesh.position.y = -2.25;
    turfMesh.receiveShadow = true;
    islandGroup.add(turfMesh);

    // Island Top Surface Plate (Cyber green / slate ground)
    const topPlateGeo = new THREE.CylinderGeometry(39.8, 39.8, 0.4, 36);
    const topPlateMat = new THREE.MeshStandardMaterial({
      color: 0x091428,
      roughness: 0.4,
      metalness: 0.3
    });
    const topPlateMesh = new THREE.Mesh(topPlateGeo, topPlateMat);
    topPlateMesh.position.y = 0.05;
    topPlateMesh.receiveShadow = true;
    islandGroup.add(topPlateMesh);

    // Island Bottom Inverted Rocky Spire (Floating crystal cone)
    const bottomGeo = new THREE.ConeGeometry(36, 32, 16);
    const bottomMat = new THREE.MeshStandardMaterial({
      color: 0x030712,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true
    });
    const bottomMesh = new THREE.Mesh(bottomGeo, bottomMat);
    bottomMesh.position.y = -20.5;
    bottomMesh.rotation.x = Math.PI;
    islandGroup.add(bottomMesh);

    // Floating Satellite mini rocks around the main island
    const miniRocks: THREE.Mesh[] = [];
    const rockGeo = new THREE.DodecahedronGeometry(1.4, 0);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      flatShading: true
    });
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2;
      const dist = 45 + (i % 3) * 6;
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(Math.cos(angle) * dist, -5 + (i % 4) * 2, Math.sin(angle) * dist);
      rock.scale.setScalar(0.7 + (i % 3) * 0.4);
      scene.add(rock);
      miniRocks.push(rock);
    }

    // Outer Digital Ocean Wave Plane (Transparent grid under the island)
    const seaGeo = new THREE.PlaneGeometry(350, 350, 40, 40);
    const seaMat = new THREE.MeshBasicMaterial({
      color: 0x0369a1,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const seaMesh = new THREE.Mesh(seaGeo, seaMat);
    seaMesh.rotation.x = -Math.PI / 2;
    seaMesh.position.y = -35;
    scene.add(seaMesh);

    // 4. Central Grand Plaza & Cyber Roads
    const plazaGeo = new THREE.CylinderGeometry(5.5, 5.5, 0.1, 24);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.35,
      metalness: 0.5,
      roughness: 0.3
    });
    const plazaMesh = new THREE.Mesh(plazaGeo, plazaMat);
    plazaMesh.position.y = 0.1;
    plazaMesh.receiveShadow = true;
    islandGroup.add(plazaMesh);

    // Rotating Holographic FiXo Core Symbol at Center Plaza
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 3, 0);
    scene.add(coreGroup);

    const coreCubeGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const coreCubeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.8,
      wireframe: true
    });
    const coreCube = new THREE.Mesh(coreCubeGeo, coreCubeMat);
    coreGroup.add(coreCube);

    const innerCoreGeo = new THREE.OctahedronGeometry(0.9, 0);
    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x9333ea,
      emissiveIntensity: 0.9,
      roughness: 0.2
    });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    coreGroup.add(innerCore);

    // Central core light
    const coreLight = new THREE.PointLight(0x38bdf8, 2.5, 18);
    coreLight.position.set(0, 3, 0);
    scene.add(coreLight);

    // Cyber Pathways connecting all buildings to Center
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0x034a75,
      emissive: 0x0284c7,
      emissiveIntensity: 0.3,
      roughness: 0.3
    });
    for (const prod of products) {
      const p3d = prod.building.pos3D;
      const dist = Math.hypot(p3d.x, p3d.z);
      const roadGeo = new THREE.BoxGeometry(1.6, 0.05, dist);
      const roadMesh = new THREE.Mesh(roadGeo, pathMat);
      roadMesh.position.set(p3d.x / 2, 0.08, p3d.z / 2);
      roadMesh.lookAt(p3d.x, 0.08, p3d.z);
      roadMesh.receiveShadow = true;
      islandGroup.add(roadMesh);
    }

    // 5. Build 10 3D Architectural Product Pavilions
    const buildingMeshes: { product: FixoProduct; group: THREE.Group; beacon: THREE.Mesh }[] = [];

    // Helper: create text sprite for building title
    const createTitleSprite = (text: string, sub: string, colorHex: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 380;
      canvas.height = 140;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(3, 7, 18, 0.85)';
        ctx.strokeStyle = colorHex;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(8, 8, 364, 124, 20);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 36px "Noto Sans TC", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(text, 190, 58);

        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = colorHex;
        ctx.fillText(sub, 190, 102);
      }
      const tex = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(4.5, 1.6, 1);
      return sprite;
    };

    products.forEach((prod) => {
      const { x, y, z } = prod.building.pos3D;
      const bGroup = new THREE.Group();
      bGroup.position.set(x, y, z);
      scene.add(bGroup);

      const colorInt = parseInt(prod.color.primary.replace('#', '0x'), 16);

      // A. Ground Pad Ring
      const padGeo = new THREE.CylinderGeometry(4.2, 4.2, 0.2, 24);
      const padMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: colorInt,
        emissiveIntensity: 0.25,
        roughness: 0.4
      });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.y = 0.1;
      pad.receiveShadow = true;
      bGroup.add(pad);

      // B. Beacon interaction halo ring on floor
      const ringGeo = new THREE.RingGeometry(3.6, 4.1, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorInt,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      });
      const beacon = new THREE.Mesh(ringGeo, ringMat);
      beacon.rotation.x = -Math.PI / 2;
      beacon.position.y = 0.22;
      bGroup.add(beacon);

      // C. Stylized 3D Pavilion Structures
      const mainMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.3,
        metalness: 0.6
      });
      const accentMat = new THREE.MeshStandardMaterial({
        color: colorInt,
        emissive: colorInt,
        emissiveIntensity: 0.5,
        roughness: 0.2
      });

      if (prod.id === 'cam') {
        // CAM Citadel: dome with cyber columns
        const domeGeo = new THREE.SphereGeometry(2.5, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const dome = new THREE.Mesh(domeGeo, accentMat);
        dome.position.y = 3.5;
        dome.castShadow = true;
        bGroup.add(dome);

        for (let c = 0; c < 6; c++) {
          const ca = (c / 6) * Math.PI * 2;
          const colGeo = new THREE.CylinderGeometry(0.28, 0.28, 3.5, 12);
          const col = new THREE.Mesh(colGeo, mainMat);
          col.position.set(Math.cos(ca) * 2.2, 1.75, Math.sin(ca) * 2.2);
          col.castShadow = true;
          bGroup.add(col);
        }
      } else if (prod.id === 'vpc') {
        // VPC Network Hub: Floating router crystal with rotating rings
        const baseBox = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.2, 3.2), mainMat);
        baseBox.position.y = 0.6;
        baseBox.castShadow = true;
        bGroup.add(baseBox);

        const routerCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(1.6, 0), accentMat);
        routerCrystal.position.y = 3.6;
        routerCrystal.name = 'rotating_crystal';
        bGroup.add(routerCrystal);
      } else if (prod.id === 'fico') {
        // FiCo Supercomputing Towers: Twin Blade Server Skyscrapers
        const towerGeo = new THREE.BoxGeometry(1.4, 6.5, 2.2);
        const tower1 = new THREE.Mesh(towerGeo, mainMat);
        tower1.position.set(-1.1, 3.25, 0);
        tower1.castShadow = true;
        bGroup.add(tower1);

        const tower2 = new THREE.Mesh(towerGeo, mainMat);
        tower2.position.set(1.1, 3.25, 0);
        tower2.castShadow = true;
        bGroup.add(tower2);

        const bridge = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 1.2), accentMat);
        bridge.position.set(0, 4.5, 0);
        bGroup.add(bridge);
      } else if (prod.id === 'fibo') {
        // FiBo Object Storage Port: Storage Containers & Tanks
        const tankGeo = new THREE.CylinderGeometry(1.3, 1.3, 4, 16);
        const tank = new THREE.Mesh(tankGeo, accentMat);
        tank.position.set(-1.2, 2, 0);
        tank.castShadow = true;
        bGroup.add(tank);

        const crateGeo = new THREE.BoxGeometry(2.2, 2.8, 2.2);
        const crate = new THREE.Mesh(crateGeo, mainMat);
        crate.position.set(1.2, 1.4, 0);
        crate.castShadow = true;
        bGroup.add(crate);
      } else if (prod.id === 'lbs') {
        // LBS Lighthouse: Slender tower with spotlight
        const towerGeo = new THREE.CylinderGeometry(0.9, 1.6, 6.5, 16);
        const tower = new THREE.Mesh(towerGeo, mainMat);
        tower.position.y = 3.25;
        tower.castShadow = true;
        bGroup.add(tower);

        const topLamp = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), accentMat);
        topLamp.position.y = 6.8;
        topLamp.name = 'rotating_lamp';
        bGroup.add(topLamp);
      } else if (prod.id === 'cis') {
        // CIS Container Dock: Stacked modular containers
        const c1 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.4, 1.8), accentMat);
        c1.position.set(0, 0.7, 0);
        c1.castShadow = true;
        bGroup.add(c1);

        const c2 = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.4, 1.6), mainMat);
        c2.position.set(0, 2.1, 0);
        c2.castShadow = true;
        bGroup.add(c2);

        const topTrident = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.2, 4), accentMat);
        topTrident.position.set(0, 3.9, 0);
        bGroup.add(topTrident);
      } else if (prod.id === 'kms') {
        // KMS Vault: Hexagonal armored fortress
        const vault = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.2, 3.8, 6), mainMat);
        vault.position.y = 1.9;
        vault.castShadow = true;
        bGroup.add(vault);

        const vaultLock = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.35, 12, 24), accentMat);
        vaultLock.position.set(0, 2.2, 2.8);
        bGroup.add(vaultLock);
      } else if (prod.id === 'fiwo') {
        // FiWo Modern Workspace Pavilion: Sleek glass structure
        const pod = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.4, 3.2), mainMat);
        pod.position.y = 1.2;
        pod.castShadow = true;
        bGroup.add(pod);

        const screen = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.8, 0.1), accentMat);
        screen.position.set(0, 3.0, 0);
        bGroup.add(screen);
      } else if (prod.id === 'bds') {
        // BDS Big Data Observatory: Satellite dish pointing to sky
        const base = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.5, 2, 16), mainMat);
        base.position.y = 1.0;
        bGroup.add(base);

        const dish = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 0.2, 1.2, 16), accentMat);
        dish.position.set(0, 3.6, 0);
        dish.rotation.x = Math.PI / 4;
        dish.name = 'rotating_dish';
        bGroup.add(dish);
      } else {
        // Meter Telemetry Radar
        const base = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 3.2), mainMat);
        base.position.y = 1.1;
        bGroup.add(base);

        const radarArm = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.4, 0.4), accentMat);
        radarArm.position.y = 3.2;
        radarArm.name = 'rotating_radar';
        bGroup.add(radarArm);
      }

      // Floating Title Sprite above pavilion
      const titleSprite = createTitleSprite(prod.name, `${prod.chapter} · ${prod.badge}`, prod.color.primary);
      titleSprite.position.set(0, 8.2, 0);
      bGroup.add(titleSprite);

      buildingMeshes.push({ product: prod, group: bGroup, beacon });
    });

    // 6. Sean Avatar Character (Using sean.png)
    const textureLoader = new THREE.TextureLoader();
    const seanTexture = textureLoader.load('./sean.png');
    seanTexture.magFilter = THREE.NearestFilter;
    seanTexture.minFilter = THREE.LinearMipMapLinearFilter;

    // Sean Billboard mesh
    const seanHeight = 2.8;
    const seanWidth = 2.35;
    const seanGeo = new THREE.PlaneGeometry(seanWidth, seanHeight);
    const seanMat = new THREE.MeshStandardMaterial({
      map: seanTexture,
      transparent: true,
      alphaTest: 0.1,
      roughness: 0.3,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const playerMesh = new THREE.Mesh(seanGeo, seanMat);
    playerMesh.position.set(playerStateRef.current.x, seanHeight / 2, playerStateRef.current.z);
    playerMesh.castShadow = true;
    scene.add(playerMesh);

    // Player Soft Drop Shadow on floor
    const shadowGeo = new THREE.CircleGeometry(1.1, 20);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45
    });
    const playerShadow = new THREE.Mesh(shadowGeo, shadowMat);
    playerShadow.rotation.x = -Math.PI / 2;
    playerShadow.position.y = 0.06;
    scene.add(playerShadow);

    // Click destination target ring in 3D
    const targetRingGeo = new THREE.RingGeometry(0.8, 1.1, 24);
    const targetRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const targetRing = new THREE.Mesh(targetRingGeo, targetRingMat);
    targetRing.rotation.x = -Math.PI / 2;
    targetRing.position.y = 0.12;
    targetRing.visible = false;
    scene.add(targetRing);

    // 7. Raycaster for click-to-move & direct building click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: MouseEvent) => {
      if (activeProduct) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check if clicked directly on any building
      for (const bm of buildingMeshes) {
        const intersects = raycaster.intersectObjects(bm.group.children, true);
        if (intersects.length > 0) {
          sound.playInteract();
          onOpenProduct(bm.product);
          return;
        }
      }

      // Check ground click
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const hitPoint = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(groundPlane, hitPoint)) {
        // Clamp inside island
        const distFromCenter = Math.hypot(hitPoint.x, hitPoint.z);
        if (distFromCenter <= ISLAND_RADIUS) {
          clickTargetRef.current = hitPoint;
          targetRing.position.set(hitPoint.x, 0.12, hitPoint.z);
          targetRing.visible = true;
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    // 8. Animation & Game Loop
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

      // --- Character Movement Calculation ---
      let moveX = 0;
      let moveZ = 0;

      if (!activeProduct) {
        if (keys['w'] || keys['arrowup']) moveZ -= 1;
        if (keys['s'] || keys['arrowdown']) moveZ += 1;
        if (keys['a'] || keys['arrowleft']) moveX -= 1;
        if (keys['d'] || keys['arrowright']) moveX += 1;

        // Joystick override
        if (joystickVector.x !== 0 || joystickVector.y !== 0) {
          moveX = joystickVector.x;
          moveZ = joystickVector.y;
          clickTargetRef.current = null;
          targetRing.visible = false;
        }

        // Click-to-move handling
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
        const length = Math.hypot(moveX, moveZ);
        const normX = (moveX / length) * MOVE_SPEED;
        const normZ = (moveZ / length) * MOVE_SPEED;

        const nextX = p.x + normX;
        const nextZ = p.z + normZ;

        // Island boundaries check
        if (Math.hypot(nextX, nextZ) < ISLAND_RADIUS) {
          p.x = nextX;
          p.z = nextZ;
        }

        // Horizontal flip based on moving direction
        if (moveX < -0.05) p.facingLeft = true;
        else if (moveX > 0.05) p.facingLeft = false;

        p.walkTimer += 0.22;

        p.stepSoundTimer++;
        if (p.stepSoundTimer % 22 === 0) {
          sound.playStep();
        }

        // Sync to React state throttled
        if (ticks % 6 === 0) {
          setPlayerPos3D({ x: p.x, z: p.z });
        }
      }

      // --- Update Sean Avatar Mesh ---
      playerMesh.scale.x = p.facingLeft ? -1 : 1;
      const walkBob = p.isMoving ? Math.sin(p.walkTimer) * 0.18 : Math.sin(ticks * 0.06) * 0.06;
      playerMesh.position.set(p.x, (seanHeight / 2) + walkBob, p.z);
      // Billboard Sean to face the camera
      playerMesh.rotation.y = camera.rotation.y;
      playerShadow.position.set(p.x, 0.06, p.z);

      // Target ring animation
      if (targetRing.visible) {
        targetRing.scale.setScalar(1 + Math.sin(ticks * 0.15) * 0.15);
      }

      // --- Camera Smooth Tracking (Isometric follow) ---
      const camTargetX = p.x;
      const camTargetY = 22;
      const camTargetZ = p.z + 24;

      camera.position.x += (camTargetX - camera.position.x) * 0.08;
      camera.position.y += (camTargetY - camera.position.y) * 0.08;
      camera.position.z += (camTargetZ - camera.position.z) * 0.08;
      camera.lookAt(p.x, 1.5, p.z);

      // --- Central Core Rotation ---
      coreGroup.rotation.y += 0.015;
      coreCube.rotation.x += 0.01;
      innerCore.rotation.z += 0.02;

      // --- Satellite Mini Rocks Floating Animation ---
      miniRocks.forEach((rock, idx) => {
        rock.position.y += Math.sin(ticks * 0.03 + idx) * 0.015;
        rock.rotation.y += 0.005;
      });

      // --- Check Proximity to Buildings ---
      let currentNearby: FixoProduct | null = null;
      for (const bm of buildingMeshes) {
        const p3d = bm.product.building.pos3D;
        const dist = Math.hypot(p.x - p3d.x, p.z - p3d.z);

        const isClose = dist < INTERACTION_DIST;
        if (isClose) {
          currentNearby = bm.product;
        }

        // Pulse beacon ring
        const pulse = isClose ? (Math.sin(ticks * 0.15) * 0.3 + 0.8) : 0.4;
        (bm.beacon.material as THREE.MeshBasicMaterial).opacity = pulse;
        bm.beacon.scale.setScalar(isClose ? 1.15 : 1.0);

        // Sub-elements rotation
        const rotating = bm.group.getObjectByName('rotating_crystal') ||
                         bm.group.getObjectByName('rotating_lamp') ||
                         bm.group.getObjectByName('rotating_dish') ||
                         bm.group.getObjectByName('rotating_radar');
        if (rotating) {
          rotating.rotation.y += 0.02;
        }
      }
      setNearbyProduct(currentNearby);

      // --- Render Frame ---
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
  }, [products, activeProduct, joystickVector, setPlayerPos3D, onOpenProduct]);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="absolute inset-0 cursor-crosshair touch-none" />

      {/* Floating 3D Interaction HUD Prompt */}
      {nearbyProduct && !activeProduct && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 pointer-events-auto z-30 animate-in fade-in slide-in-from-top-4 duration-200">
          <button
            type="button"
            onClick={() => {
              sound.playInteract();
              onOpenProduct(nearbyProduct);
            }}
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900/90 border border-sky-400/80 shadow-[0_0_25px_rgba(56,189,248,0.4)] backdrop-blur-md text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span className="text-2xl">{nearbyProduct.building.symbol}</span>
            <div className="text-left">
              <div className="text-[11px] font-mono font-bold text-sky-400 flex items-center gap-1.5">
                <span>[SPACE / E] 或 點擊互動</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="text-sm font-bold text-white">
                檢視 {nearbyProduct.name}
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
