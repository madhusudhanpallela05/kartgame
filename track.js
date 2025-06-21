import * as THREE from 'three';

export class Track {
  constructor(scene) {
    this.scene = scene;
    this.createTrack();
    this.createBarriers();
    this.createEnvironmentDetails();
  }
  
  createTrack() {
    // Main track surface
    const trackGeometry = new THREE.PlaneGeometry(100, 500);
    const trackMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x4a4a4a,
      transparent: true,
      opacity: 0.9
    });
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    this.scene.add(track);
    
    // Track lane markings - yellow center lines
    this.createLaneMarkings();
    
    // Track borders
    const borderMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    
    const leftBorder = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 500),
      borderMaterial
    );
    leftBorder.rotation.x = -Math.PI / 2;
    leftBorder.position.x = -51;
    this.scene.add(leftBorder);
    
    const rightBorder = leftBorder.clone();
    rightBorder.position.x = 51;
    this.scene.add(rightBorder);
  }
  
  createLaneMarkings() {
    const markingMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
    
    // Center dashed line
    for (let i = -240; i < 240; i += 20) {
      const marking = new THREE.Mesh(
        new THREE.PlaneGeometry(0.3, 8),
        markingMaterial
      );
      marking.rotation.x = -Math.PI / 2;
      marking.position.set(0, 0.01, i);
      this.scene.add(marking);
    }
    
    // Side lines
    const leftLine = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 500),
      markingMaterial
    );
    leftLine.rotation.x = -Math.PI / 2;
    leftLine.position.set(-25, 0.01, 0);
    this.scene.add(leftLine);
    
    const rightLine = leftLine.clone();
    rightLine.position.x = 25;
    this.scene.add(rightLine);
  }
  
  createBarriers() {
    // Red and white striped barriers like in the reference image
    const barrierGroup = new THREE.Group();
    
    for (let side = -1; side <= 1; side += 2) {
      for (let i = -250; i < 250; i += 10) {
        const barrier = this.createStripedBarrier();
        barrier.position.set(side * 35, 1, i);
        this.scene.add(barrier);
      }
    }
  }
  
  createStripedBarrier() {
    const barrier = new THREE.Group();
    
    // Create striped pattern
    const stripeColors = [0xff0000, 0xffffff]; // Red and white
    
    for (let i = 0; i < 10; i++) {
      const stripeGeometry = new THREE.BoxGeometry(2, 2, 1);
      const stripeMaterial = new THREE.MeshLambertMaterial({ 
        color: stripeColors[i % 2] 
      });
      const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
      stripe.position.z = i - 4.5;
      barrier.add(stripe);
    }
    
    return barrier;
  }
  
  createEnvironmentDetails() {
    // Power line poles in the distance (like in reference)
    for (let i = -200; i < 200; i += 40) {
      const pole = this.createPowerPole();
      pole.position.set(-80 + Math.random() * 20, 0, i);
      this.scene.add(pole);
      
      const pole2 = this.createPowerPole();
      pole2.position.set(80 + Math.random() * 20, 0, i);
      this.scene.add(pole2);
    }
    
    // Additional track details
    this.createTrackSigns();
  }
  
  createPowerPole() {
    const pole = new THREE.Group();
    
    // Main pole
    const poleGeometry = new THREE.CylinderGeometry(0.2, 0.3, 15);
    const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const mainPole = new THREE.Mesh(poleGeometry, poleMaterial);
    mainPole.position.y = 7.5;
    pole.add(mainPole);
    
    // Cross beam
    const beamGeometry = new THREE.BoxGeometry(4, 0.3, 0.3);
    const beam = new THREE.Mesh(beamGeometry, poleMaterial);
    beam.position.y = 12;
    pole.add(beam);
    
    return pole;
  }
  
  createTrackSigns() {
    // Simple track signs for visual interest
    for (let i = -150; i < 150; i += 80) {
      const sign = new THREE.Group();
      
      const signPost = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 3),
        new THREE.MeshLambertMaterial({ color: 0x666666 })
      );
      signPost.position.y = 1.5;
      sign.add(signPost);
      
      const signBoard = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1, 0.1),
        new THREE.MeshLambertMaterial({ color: 0x0066cc })
      );
      signBoard.position.y = 2.5;
      sign.add(signBoard);
      
      sign.position.set(-45, 0, i);
      this.scene.add(sign);
      
      const sign2 = sign.clone();
      sign2.position.x = 45;
      this.scene.add(sign2);
    }
  }
}