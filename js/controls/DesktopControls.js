import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { WORLD_CONSTANTS } from '../utils/Constants.js';

// Desktop controls with PointerLock and WASD movement
export class DesktopControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        
        // Movement state
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        
        // Movement speed
        this.movementSpeed = WORLD_CONSTANTS.WALK_SPEED;
        
        // Velocity for smooth movement
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        // Initialize PointerLockControls
        this.controls = new PointerLockControls(camera, domElement);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Locked state
        this.isLocked = false;
    }
    
    setupEventListeners() {
        // Pointer lock events
        this.controls.addEventListener('lock', () => {
            this.isLocked = true;
            document.getElementById('instructions').classList.add('hidden');
        });
        
        this.controls.addEventListener('unlock', () => {
            this.isLocked = false;
            document.getElementById('instructions').classList.remove('hidden');
        });
        
        // Click to lock
        this.domElement.addEventListener('click', () => {
            if (!this.isLocked) {
                this.controls.lock();
            }
        });
        
        // Keyboard events
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        document.addEventListener('keyup', (event) => this.onKeyUp(event));
    }
    
    onKeyDown(event) {
        if (!this.isLocked) return;
        
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveForward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.moveBackward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.moveLeft = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.moveRight = true;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.movementSpeed = WORLD_CONSTANTS.SPRINT_SPEED;
                break;
        }
    }
    
    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveForward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.moveBackward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.moveLeft = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.moveRight = false;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.movementSpeed = WORLD_CONSTANTS.WALK_SPEED;
                break;
        }
    }
    
    update(deltaTime) {
        if (!this.isLocked) return;
        
        // Apply friction
        this.velocity.x -= this.velocity.x * 10.0 * deltaTime;
        this.velocity.z -= this.velocity.z * 10.0 * deltaTime;
        
        // Calculate movement direction
        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();
        
        // Apply movement
        if (this.moveForward || this.moveBackward) {
            this.velocity.z -= this.direction.z * this.movementSpeed * deltaTime;
        }
        if (this.moveLeft || this.moveRight) {
            this.velocity.x -= this.direction.x * this.movementSpeed * deltaTime;
        }
        
        // Move the controls (camera)
        this.controls.moveRight(-this.velocity.x * deltaTime);
        this.controls.moveForward(-this.velocity.z * deltaTime);
    }
    
    getPosition() {
        return this.camera.position;
    }
    
    setPosition(x, y, z) {
        this.camera.position.set(x, y, z);
    }
    
    dispose() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        this.controls.dispose();
    }
    
    enable() {
        this.controls.enabled = true;
    }
    
    disable() {
        this.controls.enabled = false;
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
    }
}