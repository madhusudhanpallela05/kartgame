
import * as THREE from 'three';
import { FirstPersonCameraController } from './rosieControls.js';
import { Kart } from './kart.js';
import { Track } from './track.js';
import { Environment } from './environment.js';
import { UI } from './ui.js';

class TwilightKartRacer {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.clock = new THREE.Clock();
    
    this.setupRenderer();
    this.createWorld();
    this.setupControls();
    this.setupEventListeners();
    
    this.gameLoop();
  }
  
  setupRenderer() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x2a1845);
    document.getElementById('gameContainer').appendChild(this.renderer.domElement);
  }
  
  createWorld() {
    // Create environment first for proper lighting
    this.environment = new Environment(this.scene);
    
    // Create track
    this.track = new Track(this.scene);
    
    // Create kart
    this.kart = new Kart(this.scene);
    
    // Create UI
    this.ui = new UI();
    
    // Position camera inside kart
    this.camera.position.set(0, 1.2, 0);
  }
  
  setupControls() {
    // Use first-person controller for cockpit view
    this.cameraController = new FirstPersonCameraController(
      this.camera, 
      this.kart.mesh, 
      this.renderer.domElement,
      {
        eyeHeight: 1.2,
        mouseSensitivity: 0.001
      }
    );
    this.cameraController.enable();
  }
  
  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());
    
    // Kart controls
    this.keys = {};
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      this.kart.handleKeyDown(e.code);
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      this.kart.handleKeyUp(e.code);
    });
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  gameLoop() {
    requestAnimationFrame(() => this.gameLoop());
    
    const deltaTime = this.clock.getDelta();
    
    // Update kart physics and abilities
    this.kart.update(deltaTime, this.keys);
    
    // Update camera
    this.cameraController.update();
    
    // Update UI
    this.ui.update(this.kart.speed, this.kart.abilities);
    
    // Render
    this.renderer.render(this.scene, this.camera);
  }
}

// Start the game
new TwilightKartRacer();