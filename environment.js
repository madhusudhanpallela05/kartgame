import * as THREE from 'three';

export class Environment {
  constructor(scene) {
    this.scene = scene;
    this.createSky();
    this.createMountains();
    this.setupLighting();
    this.createAtmosphere();
  }
  
  createSky() {
    // Create gradient sky matching the reference image
    const skyGeometry = new THREE.SphereGeometry(400, 32, 32);
    
    // Create custom gradient material
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x2a1845) }, // Deep purple
        horizonColor: { value: new THREE.Color(0x8B4B8C) }, // Purple-pink
        bottomColor: { value: new THREE.Color(0xFF6B47) }, // Orange-pink
        offset: { value: 0.1 },
        exponent: { value: 0.6 }
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
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          
          if (h > 0.3) {
            gl_FragColor = vec4(mix(horizonColor, topColor, pow(max(h - 0.3, 0.0) / 0.7, exponent)), 1.0);
          } else {
            gl_FragColor = vec4(mix(bottomColor, horizonColor, pow(max(h, 0.0) / 0.3, exponent)), 1.0);
          }
        }
      `,
      side: THREE.BackSide
    });
    
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(sky);
  }
  
  createMountains() {
    // Create silhouetted mountains in the background
    const mountainColors = [0x1a0f2e, 0x2a1845, 0x3a2855]; // Various dark purples
    
    // Background mountain layers
    for (let layer = 0; layer < 3; layer++) {
      const mountainGroup = new THREE.Group();
      
      for (let i = 0; i < 8; i++) {
        const mountain = this.createMountain(mountainColors[layer]);
        mountain.position.x = (i - 4) * 80 + (Math.random() - 0.5) * 30;
        mountain.position.z = -150 - layer * 50;
        mountain.position.y = -10;
        mountain.scale.y = 0.8 + Math.random() * 0.4;
        mountain.scale.x = 0.6 + Math.random() * 0.8;
        mountainGroup.add(mountain);
      }
      
      this.scene.add(mountainGroup);
    }
  }
  
  createMountain(color) {
    // Create irregular mountain shape
    const points = [];
    const segments = 12;
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI;
      const radius = 40 + Math.random() * 20;
      const height = Math.sin(angle) * (30 + Math.random() * 40);
      
      points.push(new THREE.Vector2(
        Math.cos(angle) * radius,
        height
      ));
    }
    
    const mountainGeometry = new THREE.LatheGeometry(points, 16);
    const mountainMaterial = new THREE.MeshLambertMaterial({ 
      color: color,
      transparent: true,
      opacity: 0.8
    });
    
    return new THREE.Mesh(mountainGeometry, mountainMaterial);
  }
  
  setupLighting() {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x4a3870, 0.6);
    this.scene.add(ambientLight);
    
    // Main directional light (sunset lighting)
    const directionalLight = new THREE.DirectionalLight(0xffa500, 0.8);
    directionalLight.position.set(-50, 30, -20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    this.scene.add(directionalLight);
    
    // Additional warm light for atmosphere
    const warmLight = new THREE.DirectionalLight(0xff6b47, 0.4);
    warmLight.position.set(30, 20, 10);
    this.scene.add(warmLight);
    
    // Cool blue light for contrast
    const coolLight = new THREE.DirectionalLight(0x4a70ff, 0.3);
    coolLight.position.set(0, 50, 100);
    this.scene.add(coolLight);
  }
  
  createAtmosphere() {
    // Add fog for depth and atmosphere
    this.scene.fog = new THREE.Fog(0x6b4b8c, 50, 300);
    
    // Create floating particles for atmosphere
    this.createAtmosphericParticles();
  }
  
  createAtmosphericParticles() {
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 1] = Math.random() * 100 + 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
    }
    
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(particles);
    
    // Animate particles
    this.animateParticles(particles);
  }
  
  animateParticles(particles) {
    const animate = () => {
      const positions = particles.geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.01;
        positions[i + 1] += 0.02;
        
        if (positions[i + 1] > 120) {
          positions[i + 1] = 20;
        }
      }
      
      particles.geometry.attributes.position.needsUpdate = true;
      requestAnimationFrame(animate);
    };
    
    animate();
  }
}