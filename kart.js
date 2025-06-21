import * as THREE from 'three';

export class Kart {
  constructor(scene) {
    this.scene = scene;
    this.mesh = this.createKart();
    this.scene.add(this.mesh);
    
    // Physics properties
    this.velocity = new THREE.Vector3();
    this.acceleration = 0;
    this.maxSpeed = 25;
    this.speed = 0;
    this.turnSpeed = 0;
    this.maxTurnSpeed = 2;
    
    // Abilities
    this.abilities = {
      boost: { active: false, cooldown: 0, duration: 0 },
      jump: { active: false, cooldown: 0 },
      shield: { active: false, cooldown: 0, duration: 0 }
    };
    
    // Effects
    this.particles = this.createParticleSystem();
    this.shakeIntensity = 0;
  }
  
  createKart() {
    const kart = new THREE.Group();
    
    // Main body - blue and colorful like the reference
    const bodyGeometry = new THREE.BoxGeometry(1.2, 0.4, 2);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x00aaff });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    kart.add(body);
    
    // Side panels - bright accent colors
    const leftPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.3, 1.5),
      new THREE.MeshLambertMaterial({ color: 0xff3366 })
    );
    leftPanel.position.set(-0.6, 0.6, 0);
    kart.add(leftPanel);
    
    const rightPanel = leftPanel.clone();
    rightPanel.position.x = 0.6;
    kart.add(rightPanel);
    
    // Front nose
    const noseGeometry = new THREE.ConeGeometry(0.3, 0.6, 8);
    const noseMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 0.6, 1.2);
    nose.rotation.x = Math.PI / 2;
    kart.add(nose);
    
    // Wheels
    for (let i = 0; i < 4; i++) {
      const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12);
      const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      
      const x = i % 2 === 0 ? -0.8 : 0.8;
      const z = i < 2 ? 0.8 : -0.8;
      wheel.position.set(x, 0.3, z);
      wheel.rotation.z = Math.PI / 2;
      kart.add(wheel);
    }
    
    kart.position.y = 0.75;
    return kart;
  }
  
  createParticleSystem() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(100 * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0x00aaff,
      size: 0.1,
      transparent: true,
      opacity: 0.6
    });
    
    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
    return particles;
  }
  
  handleKeyDown(keyCode) {
    // Boost ability
    if (keyCode === 'ShiftLeft' || keyCode === 'ShiftRight') {
      this.activateBoost();
    }
    
    // Jump ability
    if (keyCode === 'Space' && (keyCode === 'ControlLeft' || keyCode === 'ControlRight')) {
      this.activateJump();
    }
    
    // Shield ability
    if (keyCode === 'KeyE') {
      this.activateShield();
    }
  }
  
  handleKeyUp(keyCode) {
    // Handle key releases if needed
  }
  
  activateBoost() {
    if (this.abilities.boost.cooldown <= 0) {
      this.abilities.boost.active = true;
      this.abilities.boost.duration = 2.0;
      this.abilities.boost.cooldown = 5.0;
      
      // Visual effect
      this.particles.material.color.setHex(0xff6600);
      this.shakeIntensity = 0.02;
    }
  }
  
  activateJump() {
    if (this.abilities.jump.cooldown <= 0) {
      this.abilities.jump.active = true;
      this.abilities.jump.cooldown = 3.0;
      this.velocity.y = 12;
      
      // Visual effect
      this.shakeIntensity = 0.03;
    }
  }
  
  activateShield() {
    if (this.abilities.shield.cooldown <= 0) {
      this.abilities.shield.active = true;
      this.abilities.shield.duration = 3.0;
      this.abilities.shield.cooldown = 8.0;
      
      // Create shield visual
      if (!this.shieldMesh) {
        const shieldGeometry = new THREE.SphereGeometry(2, 16, 16);
        const shieldMaterial = new THREE.MeshLambertMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.3
        });
        this.shieldMesh = new THREE.Mesh(shieldGeometry, shieldMaterial);
        this.mesh.add(this.shieldMesh);
      }
      this.shieldMesh.visible = true;
    }
  }
  
  update(deltaTime, keys) {
    // Handle movement input
    let accelerationInput = 0;
    let turnInput = 0;
    
    if (keys['KeyW'] || keys['ArrowUp']) accelerationInput = 1;
    if (keys['KeyS'] || keys['ArrowDown']) accelerationInput = -0.5;
    if (keys['KeyA'] || keys['ArrowLeft']) turnInput = -1;
    if (keys['KeyD'] || keys['ArrowRight']) turnInput = 1;
    
    // Update abilities
    this.updateAbilities(deltaTime);
    
    // Apply boost
    let speedMultiplier = 1;
    if (this.abilities.boost.active) {
      speedMultiplier = 2.0;
    }
    
    // Update physics
    this.acceleration = accelerationInput * 15 * speedMultiplier;
    this.speed += this.acceleration * deltaTime;
    this.speed = Math.max(0, Math.min(this.speed, this.maxSpeed * speedMultiplier));
    
    // Natural deceleration
    if (accelerationInput === 0) {
      this.speed *= 0.95;
    }
    
    // Turning (only when moving)
    if (this.speed > 0.1) {
      this.turnSpeed = turnInput * this.maxTurnSpeed * (this.speed / this.maxSpeed);
      this.mesh.rotation.y += this.turnSpeed * deltaTime;
    }
    
    // Move forward
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(this.mesh.quaternion);
    
    this.velocity.x = forward.x * this.speed;
    this.velocity.z = forward.z * this.speed;
    
    // Apply gravity and jumping
    if (this.mesh.position.y > 0.75) {
      this.velocity.y -= 25 * deltaTime;
    } else {
      this.mesh.position.y = 0.75;
      this.velocity.y = 0;
      this.abilities.jump.active = false;
    }
    
    // Update position
    this.mesh.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    
    // Update camera shake
    if (this.shakeIntensity > 0) {
      this.shakeIntensity *= 0.9;
      if (this.shakeIntensity < 0.001) this.shakeIntensity = 0;
    }
    
    // Update particle effects
    this.updateParticles();
  }
  
  updateAbilities(deltaTime) {
    // Update boost
    if (this.abilities.boost.active) {
      this.abilities.boost.duration -= deltaTime;
      if (this.abilities.boost.duration <= 0) {
        this.abilities.boost.active = false;
        this.particles.material.color.setHex(0x00aaff);
      }
    }
    if (this.abilities.boost.cooldown > 0) {
      this.abilities.boost.cooldown -= deltaTime;
    }
    
    // Update jump cooldown
    if (this.abilities.jump.cooldown > 0) {
      this.abilities.jump.cooldown -= deltaTime;
    }
    
    // Update shield
    if (this.abilities.shield.active) {
      this.abilities.shield.duration -= deltaTime;
      if (this.abilities.shield.duration <= 0) {
        this.abilities.shield.active = false;
        if (this.shieldMesh) this.shieldMesh.visible = false;
      }
    }
    if (this.abilities.shield.cooldown > 0) {
      this.abilities.shield.cooldown -= deltaTime;
    }
  }
  
  updateParticles() {
    // Update particle positions for trail effect
    const positions = this.particles.geometry.attributes.position.array;
    
    for (let i = positions.length - 3; i >= 3; i -= 3) {
      positions[i] = positions[i - 3];
      positions[i + 1] = positions[i - 2];
      positions[i + 2] = positions[i - 1];
    }
    
    // Add new particle at kart position
    positions[0] = this.mesh.position.x + (Math.random() - 0.5) * 0.5;
    positions[1] = this.mesh.position.y + 0.2;
    positions[2] = this.mesh.position.z + (Math.random() - 0.5) * 0.5;
    
    this.particles.geometry.attributes.position.needsUpdate = true;
  }
}