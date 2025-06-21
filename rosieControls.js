import * as THREE from 'three';

export class FirstPersonCameraController {
  constructor(camera, targetObject, domElement, options = {}) {
    this.camera = camera;
    this.target = targetObject;
    this.domElement = domElement;
    this.eyeHeight = options.eyeHeight || 1.2;
    this.mouseSensitivity = options.mouseSensitivity || 0.002;

    this.enabled = false;
    this.pitch = 0;
    this.yaw = 0;

    this.pointerLock = this.pointerLock.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  enable() {
    this.domElement.addEventListener('click', this.pointerLock);
    document.addEventListener('mousemove', this.onMouseMove, false);
    this.enabled = true;
  }

  disable() {
    document.removeEventListener('mousemove', this.onMouseMove);
    this.enabled = false;
  }

  pointerLock() {
    if (this.domElement.requestPointerLock) {
      this.domElement.requestPointerLock();
    }
  }

  onMouseMove(event) {
    if (!this.enabled || document.pointerLockElement !== this.domElement) return;

    this.yaw -= event.movementX * this.mouseSensitivity;
    this.pitch -= event.movementY * this.mouseSensitivity;
    this.pitch = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, this.pitch));
  }

  update() {
    if (!this.enabled) return;

    const offset = new THREE.Vector3(0, this.eyeHeight, 0);
    const position = new THREE.Vector3().copy(this.target.position).add(offset);

    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(this.pitch, this.yaw + this.target.rotation.y, 0, 'YXZ'));

    this.camera.position.copy(position);
    this.camera.quaternion.copy(quaternion);
  }
}
