import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float } from "@react-three/drei";
import * as THREE from "three";

interface BeadProps {
  position: [number, number, number];
  isActive: boolean;
  isCounted: boolean;
  index: number;
}

const Bead = ({ position, isActive, isCounted, index }: BeadProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle breathing animation
      const scale = isActive 
        ? 1.3 + Math.sin(state.clock.elapsedTime * 4) * 0.1
        : isCounted 
          ? 1.0 
          : 0.9;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const color = useMemo(() => {
    if (isActive) return "#fbbf24"; // Amber for active
    if (isCounted) return "#34d399"; // Emerald for counted
    return "#0d9488"; // Teal for uncounted
  }, [isActive, isCounted]);

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <sphereGeometry args={[0.35, 32, 32]} />
      <meshStandardMaterial
        color={color}
        roughness={0.2}
        metalness={0.8}
        envMapIntensity={1.5}
      />
    </mesh>
  );
};

interface StringSegmentProps {
  start: [number, number, number];
  end: [number, number, number];
}

const StringSegment = ({ start, end }: StringSegmentProps) => {
  const ref = useRef<THREE.Line>(null);
  
  const lineGeometry = useMemo(() => {
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [start, end]);

  const lineMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({ 
      color: "#a78bfa", 
      transparent: true, 
      opacity: 0.6 
    });
  }, []);

  return <primitive ref={ref} object={new THREE.Line(lineGeometry, lineMaterial)} />;
};

interface TasbihMalaProps {
  count: number;
  totalBeads: number;
}

const TasbihMala = ({ count, totalBeads }: TasbihMalaProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);
  const lastCount = useRef(0);
  
  // Calculate rotation step per bead
  const rotationPerBead = (Math.PI * 2) / totalBeads;
  
  useEffect(() => {
    if (count !== lastCount.current) {
      // Rotate to next bead position when count changes
      const diff = count - lastCount.current;
      targetRotation.current += rotationPerBead * diff;
      lastCount.current = count;
    }
  }, [count, rotationPerBead]);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Smooth interpolation to target rotation
      const speed = 5;
      currentRotation.current = THREE.MathUtils.lerp(
        currentRotation.current,
        targetRotation.current,
        delta * speed
      );
      groupRef.current.rotation.y = -currentRotation.current;
    }
  });

  const beadPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const radius = 4.5;
    
    for (let i = 0; i < totalBeads; i++) {
      const angle = (i / totalBeads) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(angle * 2) * 0.4; // Subtle wave
      positions.push([x, y, z]);
    }
    
    return positions;
  }, [totalBeads]);

  const activeBeadIndex = count % totalBeads;

  return (
    <group ref={groupRef}>
      {/* Beads */}
      {beadPositions.map((pos, index) => (
        <Bead
          key={index}
          position={pos}
          index={index}
          isActive={index === activeBeadIndex && count > 0}
          isCounted={index < (count % totalBeads) || Math.floor(count / totalBeads) > 0}
        />
      ))}
      
      {/* String connections */}
      {beadPositions.map((pos, index) => {
        const nextIndex = (index + 1) % totalBeads;
        return (
          <StringSegment
            key={`string-${index}`}
            start={pos}
            end={beadPositions[nextIndex]}
          />
        );
      })}
      
      {/* Center tassel/pendant */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[0, -1.5, 0]} castShadow>
          <coneGeometry args={[0.4, 1.2, 8]} />
          <meshStandardMaterial
            color="#fbbf24"
            roughness={0.3}
            metalness={0.9}
          />
        </mesh>
        <mesh position={[0, -0.8, 0]} castShadow>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial
            color="#fbbf24"
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>
      </Float>
    </group>
  );
};

interface TasbihBeads3DProps {
  count: number;
  totalBeads?: number;
}

const TasbihBeads3D = ({ count, totalBeads = 33 }: TasbihBeads3DProps) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 40 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#a78bfa" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.8}
          castShadow
          color="#fbbf24"
        />
        
        <TasbihMala count={count} totalBeads={totalBeads} />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default TasbihBeads3D;