"use client";

import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { setCursorLabel } from "./Cursor";

/*
  Ana sahne: "ooo" — MOOOTION'daki üç O'dan türeyen, iç içe geçmiş üç halka ve
  ortada nefes alan sıvı bir çekirdek.
  Etkileşimler: sürükle = döndür (ataletli) · tıkla = malzeme modunu değiştir
  · üzerine gel = halka şişer · fare = hafif kamera paralaksı.

  Kendi Cinema 4D modelini koymak için: modeli /public/models/hero.glb olarak kaydet,
  <Rings /> yerine useGLTF("/models/hero.glb") ile yüklenen sahneyi kullan.
*/

type Mode = { name: string; ring: (i: number) => Partial<THREE.MeshPhysicalMaterialParameters>; core: string };

const MODES: Mode[] = [
  {
    name: "Chrome",
    ring: () => ({ color: "#d9d9d9", metalness: 1, roughness: 0.08, iridescence: 0, clearcoat: 1 }),
    core: "#ff5b1f",
  },
  {
    name: "Iridescent",
    ring: () => ({ color: "#ffffff", metalness: 0.35, roughness: 0.12, iridescence: 1, iridescenceIOR: 1.6, clearcoat: 1 }),
    core: "#2d6bff",
  },
  {
    name: "Pop",
    ring: (i) => ({ color: ["#ff5b1f", "#ffd400", "#2d6bff"][i], metalness: 0.05, roughness: 0.28, iridescence: 0, clearcoat: 1 }),
    core: "#f4f3f0",
  },
];

function Rings({ mode, onHover, onCycle }: { mode: number; onHover: (h: boolean) => void; onCycle: () => void }) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { size, gl } = useThree();

  // sürükleme durumu
  const drag = useRef({ down: false, x: 0, y: 0, vx: 0, vy: 0, rx: 0.25, ry: -0.4 });
  const intro = useRef(0);
  const introStarted = useRef(false);

  useEffect(() => {
    const start = () => (introStarted.current = true);
    window.addEventListener("app:intro", start);
    // preloader zaten bittiyse (sayfa geçişlerinde)
    const t = setTimeout(start, 6000);
    return () => {
      window.removeEventListener("app:intro", start);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    const el = gl.domElement;
    const down = (e: PointerEvent) => {
      if (!isHome) return;
      e.preventDefault();
      drag.current.down = true;
      drag.current.x = e.clientX;
      drag.current.y = e.clientY;
    };
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d.down) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      d.x = e.clientX;
      d.y = e.clientY;
      d.vy = dx * 0.006;
      d.vx = dy * 0.006;
    };
    const up = () => (drag.current.down = false);
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [gl, isHome]);

  const materials = useMemo(
    () => [0, 1, 2].map(() => new THREE.MeshPhysicalMaterial({ envMapIntensity: 1.2 })),
    []
  );
  const coreMat = useMemo(() => new THREE.MeshPhysicalMaterial({ roughness: 0.15, clearcoat: 1, metalness: 0.1 }), []);
  const target = useMemo(() => ({ ring: materials.map(() => new THREE.Color()), core: new THREE.Color() }), [materials]);

  useEffect(() => {
    const m = MODES[mode];
    materials.forEach((mat, i) => {
      const p = m.ring(i);
      mat.metalness = p.metalness ?? 0;
      mat.roughness = p.roughness ?? 0.2;
      mat.iridescence = p.iridescence ?? 0;
      mat.iridescenceIOR = p.iridescenceIOR ?? 1.3;
      mat.clearcoat = p.clearcoat ?? 0;
      target.ring[i].set(p.color as string);
    });
    target.core.set(m.core);
  }, [mode, materials, target]);

  // çekirdeğin "nefes alan" deformasyonu için orijinal pozisyonlar
  const coreGeo = useMemo(() => new THREE.IcosahedronGeometry(0.62, 18), []);
  const basePos = useMemo(() => Float32Array.from(coreGeo.attributes.position.array), [coreGeo]);

  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const d = drag.current;

    // giriş animasyonu ve rota durumu
    const goal = introStarted.current && isHome ? 1 : 0;
    intro.current = THREE.MathUtils.damp(intro.current, goal, goal ? 2.6 : 5, dt);
    const s = intro.current * (size.width < 760 ? 0.5 : 0.82);
    g.scale.setScalar(Math.max(s, 0.0001));
    g.visible = intro.current > 0.002;

    // atalet + boşta dönüş
    if (!d.down) {
      d.vx *= 0.94;
      d.vy *= 0.94;
    }
    d.rx += d.vx;
    d.ry += d.vy + dt * 0.12;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, d.rx + Math.sin(t * 0.4) * 0.08, 6, dt);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, d.ry, 6, dt);
    g.position.y = Math.sin(t * 0.8) * 0.06 + (1 - intro.current) * -0.6;

    // halkalar kendi eksenlerinde
    rings.current.forEach((r, i) => {
      if (!r) return;
      r.rotation.z += dt * (0.15 + i * 0.07) * (i % 2 ? -1 : 1);
      const k = hovered === i ? 1.08 : 1;
      r.scale.setScalar(THREE.MathUtils.damp(r.scale.x, k, 8, dt));
      (r.material as THREE.MeshPhysicalMaterial).color.lerp(target.ring[i], 1 - Math.exp(-dt * 6));
    });
    coreMat.color.lerp(target.core, 1 - Math.exp(-dt * 6));

    // çekirdek deformasyonu (görünür değilse atla)
    if (!g.visible) return;
    const pos = coreGeo.attributes.position as THREE.BufferAttribute;
    const v = tmp;
    for (let i = 0; i < pos.count; i++) {
      v.set(basePos[i * 3], basePos[i * 3 + 1], basePos[i * 3 + 2]);
      const n = Math.sin(v.x * 4 + t * 1.6) * Math.sin(v.y * 4 + t * 1.3) * Math.sin(v.z * 4 + t);
      v.multiplyScalar(1 + n * 0.12);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    pos.needsUpdate = true;
    coreGeo.computeVertexNormals();
    if (core.current) core.current.rotation.y -= dt * 0.3;

    // kamera paralaksı
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, state.pointer.x * 0.35, 3, dt);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, state.pointer.y * 0.25, 3, dt);
    cam.lookAt(0, 0, 0);
  });

  const over = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(i);
    onHover(true);
  };
  const out = () => {
    setHovered(null);
    onHover(false);
  };

  const ringDefs: { r: number; t: number; rot: [number, number, number] }[] = [
    { r: 1.35, t: 0.13, rot: [0, 0, 0] },
    { r: 1.35, t: 0.13, rot: [Math.PI / 2, 0, 0] },
    { r: 1.35, t: 0.13, rot: [0, Math.PI / 2, Math.PI / 4] },
  ];

  return (
    <group ref={group}>
      {ringDefs.map((d, i) => (
        <group key={i} rotation={d.rot}>
          <mesh
            ref={(m) => {
              rings.current[i] = m;
            }}
            material={materials[i]}
            onPointerOver={over(i)}
            onPointerOut={out}
            onClick={(e) => { e.stopPropagation(); if (e.delta < 6) onCycle(); }}
            castShadow
          >
            <torusGeometry args={[d.r, d.t, 64, 200]} />
          </mesh>
        </group>
      ))}
      <mesh ref={core} geometry={coreGeo} material={coreMat} castShadow onPointerOver={over(-1)} onPointerOut={out} onClick={(e) => { e.stopPropagation(); if (e.delta < 6) onCycle(); }} />
    </group>
  );
}

export function Scene() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [mode, setMode] = useState(0);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("scene:mode", { detail: MODES[mode].name }));
  }, [mode]);

  useEffect(() => {
    if (!isHome) {
      setHover(false);
      return;
    }
    setCursorLabel(hover ? "Drag / Click" : null);
  }, [hover, isHome]);

  return (
    <div className="webgl" data-interactive={isHome ? "true" : "false"} aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        style={{ cursor: isHome ? (hover ? "grab" : "default") : "default" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 5, 4]} intensity={1.6} castShadow />
        <Rings mode={mode} onHover={setHover} onCycle={() => setMode((m) => (m + 1) % MODES.length)} />
        <ContactShadows position={[0, -1.85, 0]} opacity={isHome ? 0.35 : 0} scale={9} blur={2.6} far={3} />
        <Environment resolution={256}>
          <color attach="background" args={["#d8d6d2"]} />
          <Lightformer form="rect" intensity={3} position={[0, 4, -2]} scale={[10, 2, 1]} />
          <Lightformer form="rect" intensity={2} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
          <Lightformer form="rect" intensity={2} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
          <Lightformer form="ring" color="#ff5b1f" intensity={4} position={[2, -2, 3]} scale={2} />
          <Lightformer form="ring" color="#2d6bff" intensity={3} position={[-3, 2, 3]} scale={1.5} />
        </Environment>
      </Canvas>
    </div>
  );
}
