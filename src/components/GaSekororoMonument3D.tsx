import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Box, Sliders, RotateCw, Sparkles, Eye, ChevronUp, ChevronDown } from "lucide-react";

export const GaSekororoMonument3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("Valley Overview");
  const [timeOfDay, setTimeOfDay] = useState<"day" | "sunset" | "night">("sunset");
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const monumentGroupRef = useRef<THREE.Group | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const fogRef = useRef<THREE.FogExp2 | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 600;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const fog = new THREE.FogExp2(0x1a2e3b, 0.015);
    scene.fog = fog;
    fogRef.current = fog;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 12, 28);
    cameraRef.current = camera;

    // 3. Renderer setup
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Environment Reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xfffaed, 0x083344, 0.8);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xffedd5, 2.2);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = !isHeadless;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 60;
    const d = 25;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // 6. Terrain / Valley Ground
    const groundGeo = new THREE.PlaneGeometry(120, 120, 64, 64);
    const posAttribute = groundGeo.attributes.position;
    for (let i = 0; i < posAttribute.count; i++) {
      const vx = posAttribute.getX(i);
      const vy = posAttribute.getY(i);
      // Gentle valley hills procedural noise
      const z = Math.sin(vx * 0.1) * Math.cos(vy * 0.1) * 1.5 + Math.sin(vx * 0.03) * 2.0;
      posAttribute.setZ(i, z);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x223a28,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // 7. Composite 3-12 Part Procedural Monument & Village Center
    const monumentGroup = new THREE.Group();
    scene.add(monumentGroup);
    monumentGroupRef.current = monumentGroup;

    // Part 1: Central Stone Plinth (Base)
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.7, metalness: 0.2 });
    const plinthMesh = new THREE.Mesh(new THREE.CylinderGeometry(5, 5.8, 1.2, 8), plinthMat);
    plinthMesh.position.y = 0.6;
    plinthMesh.castShadow = true;
    plinthMesh.receiveShadow = true;
    monumentGroup.add(plinthMesh);

    // Part 2: Traditional Lekgotla Ring / Circular Seating Stones (8 stones)
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9, metalness: 0.1 });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 7.5;
      const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 1), stoneMat);
      stone.position.set(Math.cos(angle) * radius, 0.45, Math.sin(angle) * radius);
      stone.rotation.set(Math.random(), Math.random(), 0);
      stone.castShadow = true;
      monumentGroup.add(stone);
    }

    // Part 3: Central Heritage Totem Pole / Pillar (Composite Extruded/Cylinder)
    const totemMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6, metalness: 0.3 });
    const totemMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 8, 12), totemMat);
    totemMesh.position.y = 5;
    totemMesh.castShadow = true;
    monumentGroup.add(totemMesh);

    // Part 4: Decorative Copper Ring Accents on Totem
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.9 });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.12, 16, 32), ringMat);
    ring1.position.y = 3;
    ring1.rotation.x = Math.PI / 2;
    monumentGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.12, 16, 32), ringMat);
    ring2.position.y = 6.5;
    ring2.rotation.x = Math.PI / 2;
    monumentGroup.add(ring2);

    // Part 5: Top Sun Symbol / Crown
    const crownMesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.6, 0), ringMat);
    crownMesh.position.y = 9.8;
    crownMesh.castShadow = true;
    monumentGroup.add(crownMesh);

    // Part 6 & 7: Procedural Baobab Trees around the clearing (Instanced or Group)
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x42382f, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });

    const createBaobab = (x: number, z: number, scale = 1) => {
      const treeGroup = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.8 * scale, 1.6 * scale, 6 * scale, 7), trunkMat);
      trunk.position.y = 3 * scale;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      for (let j = 0; j < 4; j++) {
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(2 * scale, 7, 7), foliageMat);
        const ang = (j / 4) * Math.PI * 2;
        sphere.position.set(Math.cos(ang) * 1.5 * scale, (5.5 + j * 0.5) * scale, Math.sin(ang) * 1.5 * scale);
        sphere.castShadow = true;
        treeGroup.add(sphere);
      }
      treeGroup.position.set(x, 0, z);
      monumentGroup.add(treeGroup);
    };

    createBaobab(14, 10, 1.2);
    createBaobab(-16, -12, 1.0);
    createBaobab(-12, 14, 0.9);
    createBaobab(15, -14, 1.1);

    // Part 8: Ground Contact Shadow Plane
    const shadowGeo = new THREE.CircleGeometry(10, 32);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x051008, transparent: true, opacity: 0.5 });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.02;
    monumentGroup.add(contactShadow);

    // 8. Animation & Render Loop (60fps with exponential damping)
    let animationFrameId: number;
    let targetRotationY = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoRotate && monumentGroupRef.current) {
        targetRotationY += delta * 0.25;
      }
      if (monumentGroupRef.current) {
        monumentGroupRef.current.rotation.y = THREE.MathUtils.damp(
          monumentGroupRef.current.rotation.y,
          targetRotationY,
          4,
          delta
        );
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 600;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
        container.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // Update lighting & time of day presets
  useEffect(() => {
    if (!dirLightRef.current || !hemiLightRef.current || !sceneRef.current || !fogRef.current) return;

    if (timeOfDay === "day") {
      dirLightRef.current.color.setHex(0xffedd5);
      dirLightRef.current.intensity = 2.2;
      dirLightRef.current.position.set(15, 25, 15);
      hemiLightRef.current.color.setHex(0xfffaed);
      hemiLightRef.current.groundColor.setHex(0x1e3a8a);
      sceneRef.current.background = new THREE.Color(0x38bdf8);
      fogRef.current.color.setHex(0x38bdf8);
    } else if (timeOfDay === "sunset") {
      dirLightRef.current.color.setHex(0xf97316);
      dirLightRef.current.intensity = 2.5;
      dirLightRef.current.position.set(25, 12, 15);
      hemiLightRef.current.color.setHex(0xfde047);
      hemiLightRef.current.groundColor.setHex(0x451a03);
      sceneRef.current.background = new THREE.Color(0x7c2d12);
      fogRef.current.color.setHex(0x7c2d12);
    } else {
      // Night
      dirLightRef.current.color.setHex(0x93c5fd);
      dirLightRef.current.intensity = 0.6;
      dirLightRef.current.position.set(10, 25, 10);
      hemiLightRef.current.color.setHex(0x1e1b4b);
      hemiLightRef.current.groundColor.setHex(0x0f172a);
      sceneRef.current.background = new THREE.Color(0x090d16);
      fogRef.current.color.setHex(0x090d16);
    }
  }, [timeOfDay]);

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    if (!cameraRef.current) return;
    const cam = cameraRef.current;
    if (preset === "Valley Overview") {
      cam.position.set(0, 12, 28);
    } else if (preset === "Close-up Totem") {
      cam.position.set(0, 6, 12);
    } else if (preset === "Lekgotla Circle") {
      cam.position.set(12, 4, 12);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      {/* 3D Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Title Overlay */}
      <div className="absolute top-6 left-6 z-10 bg-slate-900/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-700 text-white shadow-xl max-w-sm pointer-events-none">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-0.5">
          <Sparkles className="w-3.5 h-3.5" />
          Interactive 3D Valley Scene
        </div>
        <h2 className="text-lg font-bold">Ga-Sekororo Cultural Monument</h2>
        <p className="text-xs text-slate-300 mt-1">
          Procedural 3D digital preservation of the valley heritage center & Lekgotla meeting grounds.
        </p>
      </div>

      {/* Unified Collapsible Bottom Control Dock */}
      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[94vw] max-w-4xl transition-all duration-300 ${isDockCollapsed ? "translate-y-24 opacity-80" : "translate-y-0 opacity-100"}`}>
        <div className="relative bg-slate-900/90 backdrop-blur-lg border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-white">
          {/* Collapse / Expand Toggle Button */}
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-800 border border-slate-600 rounded-full text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-1 shadow-md"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> Show Controls
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> Hide Controls
              </>
            )}
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Camera View Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-400" /> Camera Perspective
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {["Valley Overview", "Close-up Totem", "Lekgotla Circle"].map(preset => (
                  <button
                    key={preset}
                    onClick={() => handlePresetChange(preset)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-center truncate ${
                      selectedPreset === preset
                        ? "bg-emerald-600 text-white font-semibold"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Lighting / Time of Day */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" /> Time of Day
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "day", label: "Daytime" },
                  { id: "sunset", label: "Sunset" },
                  { id: "night", label: "Night" },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTimeOfDay(t.id as any)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-center ${
                      timeOfDay === t.id
                        ? "bg-amber-600 text-white font-semibold"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Animation Controls */}
            <div className="space-y-2 flex flex-col justify-between">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-teal-400" /> Scene Rotation
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    autoRotate 
                      ? "bg-teal-600 text-white" 
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {autoRotate ? "Auto-Rotation Active" : "Rotation Paused"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
