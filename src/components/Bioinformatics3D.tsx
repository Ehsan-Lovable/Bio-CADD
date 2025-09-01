import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Bioinformatics3D = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(400, 400);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    canvasRef.current.innerHTML = '';
    canvasRef.current.appendChild(renderer.domElement);

    // Custom liquid metaball shader
    const liquidVertexShader = `
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      
      void main() {
        vPosition = position;
        vNormal = normal;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const liquidFragmentShader = `
      uniform float time;
      uniform vec2 mouse;
      uniform vec3 color1;
      uniform vec3 color2;
      uniform vec3 color3;
      uniform vec3 color4;
      
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      
      // Liquid metaball function with fluid-like behavior
      float liquidMetaball(vec3 pos, vec3 center, float radius, float intensity, float wobble) {
        float dist = distance(pos, center);
        float wobbleEffect = sin(time * wobble) * 0.2;
        float adjustedRadius = radius + wobbleEffect;
        return intensity / (1.0 + dist * dist / (adjustedRadius * adjustedRadius));
      }
      
      // Noise function for organic liquid movement
      float noise(vec3 p) {
        return sin(p.x * 10.0 + time) * sin(p.y * 10.0 + time * 0.5) * sin(p.z * 10.0 + time * 0.3) * 0.5 + 0.5;
      }
      
      void main() {
        vec3 pos = vPosition;
        
        // Create 4 liquid metaballs with different sizes and behaviors
        float metaball1 = liquidMetaball(pos, vec3(sin(time * 0.3) * 3.0, cos(time * 0.4) * 2.0, sin(time * 0.6) * 1.5), 2.5, 3.0, 1.2);
        float metaball2 = liquidMetaball(pos, vec3(cos(time * 0.5) * 2.5, sin(time * 0.7) * 2.5, cos(time * 0.3) * 2.0), 1.8, 2.5, 0.8);
        float metaball3 = liquidMetaball(pos, vec3(sin(time * 0.8) * 1.5, cos(time * 0.6) * 1.8, sin(time * 0.4) * 2.5), 1.2, 2.0, 1.5);
        float metaball4 = liquidMetaball(pos, vec3(cos(time * 0.2) * 2.0, sin(time * 0.9) * 1.5, cos(time * 0.7) * 1.8), 1.5, 2.2, 1.0);
        
        // Mouse interaction metaball (liquid follows cursor)
        float mouseMetaball = liquidMetaball(pos, vec3(mouse.x * 4.0, -mouse.y * 4.0, 0.0), 1.0, 1.8, 2.0);
        
        // Add organic noise for fluid-like surface
        float organicNoise = noise(pos * 0.5 + time * 0.1) * 0.3;
        
        // Combine all metaballs with organic noise
        float total = metaball1 + metaball2 + metaball3 + metaball4 + mouseMetaball + organicNoise;
        
        // Create smooth liquid surface with fluid dynamics
        float surface = smoothstep(1.2, 2.0, total);
        
        // Color blending based on metaball influence and fluid mixing
        vec3 color = mix(color1, color2, metaball1 / total);
        color = mix(color, color3, metaball2 / total);
        color = mix(color, color4, metaball3 / total);
        
        // Add fluid-like color variations
        color += sin(time * 0.5) * 0.1 * metaball4 / total;
        
        // Enhanced glow effect for liquid appearance
        float glow = smoothstep(1.0, 1.8, total);
        color += glow * 0.4;
        
        // Fresnel effect for liquid surface
        float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
        color += fresnel * 0.3;
        
        // Add subtle color variations based on position for organic feel
        color += sin(pos.x * 2.0 + time) * 0.05;
        color += cos(pos.y * 2.0 + time * 0.7) * 0.05;
        
        gl_FragColor = vec4(color, surface * 0.9);
      }
    `;

    // Create liquid metaball material
    const liquidMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        mouse: { value: new THREE.Vector2(0.0, 0.0) },
        color1: { value: new THREE.Color(0x8B5CF6) }, // Purple
        color2: { value: new THREE.Color(0x6366F1) }, // Blue
        color3: { value: new THREE.Color(0xA78BFA) }, // Light purple
        color4: { value: new THREE.Color(0x7C3AED) }  // Darker purple
      },
      vertexShader: liquidVertexShader,
      fragmentShader: liquidFragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    });

    // Create liquid metaball geometry (larger sphere for better liquid effect)
    const liquidGeometry = new THREE.SphereGeometry(8, 128, 128); // Increased detail and size
    const liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
    scene.add(liquidMesh);

    // Add floating particles around liquid metaballs
    const particleCount = 150; // Increased for liquid atmosphere
    const particles = new THREE.Group();
    
    for (let i = 0; i < particleCount; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.04, 4, 4); // Larger particles
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.7, 0.8, 0.6), // Purple-blue range
        transparent: true,
        opacity: 0.5
      });
      
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.set(
        (Math.random() - 0.5) * 20, // Increased spread
        (Math.random() - 0.5) * 20, // Increased spread
        (Math.random() - 0.5) * 20  // Increased spread
      );
      
      particles.add(particle);
    }
    
    scene.add(particles);

    // Add DNA helix structure (smaller to not interfere with liquid)
    const dnaGroup = new THREE.Group();
    const dnaRadius = 2.0;
    const dnaHeight = 6;
    const segments = 16;
    
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 3;
      const height = (i / segments) * dnaHeight - dnaHeight / 2;
      
      // Helix strands
      const strandGeometry = new THREE.SphereGeometry(0.1, 6, 6);
      const strandMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x8B5CF6,
        transparent: true,
        opacity: 0.7,
        emissive: 0x4C1D95,
        emissiveIntensity: 0.3
      });
      
      const strand1 = new THREE.Mesh(strandGeometry, strandMaterial);
      strand1.position.set(
        Math.cos(angle) * dnaRadius,
        height,
        Math.sin(angle) * dnaRadius
      );
      
      const strand2 = new THREE.Mesh(strandGeometry, strandMaterial);
      strand2.position.set(
        Math.cos(angle + Math.PI) * dnaRadius,
        height,
        Math.sin(angle + Math.PI) * dnaRadius
      );
      
      dnaGroup.add(strand1);
      dnaGroup.add(strand2);
      
      // Base pairs
      if (i % 2 === 0) {
        const baseGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 6);
        const baseMaterial = new THREE.MeshPhongMaterial({ 
          color: 0xA78BFA,
          transparent: true,
          opacity: 0.6,
          emissive: 0x7C3AED,
          emissiveIntensity: 0.2
        });
        
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(0, height, 0);
        base.rotation.z = Math.PI / 2;
        dnaGroup.add(base);
      }
    }
    
    dnaGroup.position.set(0, 0, -4); // Positioned behind liquid
    scene.add(dnaGroup);

    // Add network nodes (smaller and positioned around liquid)
    const networkGroup = new THREE.Group();
    const nodeCount = 30; // More nodes for liquid-like network
    const networkNodes: THREE.Mesh[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      const nodeGeometry = new THREE.SphereGeometry(0.12, 8, 8);
      const nodeMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x8B5CF6,
        emissive: 0x4C1D95,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8
      });
      
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.set(
        (Math.random() - 0.5) * 18, // Spread around liquid
        (Math.random() - 0.5) * 18, // Spread around liquid
        (Math.random() - 0.5) * 18  // Spread around liquid
      );
      
      networkNodes.push(node);
      networkGroup.add(node);
    }
    
    // Connect nearby nodes with liquid-like connections
    for (let i = 0; i < networkNodes.length; i++) {
      for (let j = i + 1; j < networkNodes.length; j++) {
        const distance = networkNodes[i].position.distanceTo(networkNodes[j].position);
        if (distance < 5) { // Increased connection distance
          const edgeGeometry = new THREE.BufferGeometry().setFromPoints([
            networkNodes[i].position,
            networkNodes[j].position
          ]);
          const edgeMaterial = new THREE.LineBasicMaterial({ 
            color: 0xA78BFA,
            transparent: true,
            opacity: 0.4
          });
          const edge = new THREE.Line(edgeGeometry, edgeMaterial);
          networkGroup.add(edge);
        }
      }
    }
    
    networkGroup.position.set(0, 0, 4); // Positioned in front of liquid
    scene.add(networkGroup);

    camera.position.z = 22; // Increased to accommodate larger liquid scene

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    
    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = (event.clientY / window.innerHeight) * 2 - 1;
      
      // Update shader uniform
      liquidMaterial.uniforms.mouse.value.set(mouseX, mouseY);
    };
    
    document.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let time = 0;
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      time += 0.01;
      
      // Update shader time uniform
      liquidMaterial.uniforms.time.value = time;
      
      // Rotate liquid mesh with fluid-like movement
      liquidMesh.rotation.y += 0.001;
      liquidMesh.rotation.x += 0.0005;
      
      // Animate DNA
      dnaGroup.rotation.y += 0.003;
      dnaGroup.position.y = Math.sin(time * 0.4) * 0.2;
      
      // Animate network with liquid-like flow
      networkGroup.rotation.y += 0.002;
      networkGroup.position.y = Math.sin(time * 0.6) * 0.15;
      
      // Animate particles with fluid dynamics
      particles.children.forEach((particle, index) => {
        // Fluid-like particle movement
        particle.position.y += Math.sin(time + index * 0.1) * 0.03;
        particle.position.x += Math.cos(time + index * 0.1) * 0.03;
        particle.position.z += Math.sin(time * 0.5 + index * 0.05) * 0.02;
        particle.rotation.y += 0.02;
        
        // Reset particles that go too far
        if (particle.position.length() > 15) {
          particle.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
          );
        }
      });
      
      // Interactive scene rotation based on mouse (liquid follows cursor)
      const targetRotationX = mouseY * 0.2;
      const targetRotationY = mouseX * 0.2;
      
      scene.rotation.x += (targetRotationX - scene.rotation.x) * 0.03;
      scene.rotation.y += (targetRotationY - scene.rotation.y) * 0.03;
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Handle window resize
    const handleResize = () => {
      const width = canvasRef.current?.clientWidth || 400;
      const height = canvasRef.current?.clientHeight || 400;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-96 h-96" ref={canvasRef}>
      {/* Interactive liquid metaballs with fluid dynamics will be rendered here */}
    </div>
  );
};

export default Bioinformatics3D;
