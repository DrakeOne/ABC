import * as THREE from 'three';
import { WORLD_CONSTANTS } from '../utils/Constants.js';

// Mobile touch controls with virtual joystick and look area
export class MobileControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        
        // Camera rotation
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        this.rotation.y = camera.rotation.y;
        this.rotation.x = camera.rotation.x;
        
        // Movement
        this.moveVector = new THREE.Vector2();
        this.movementSpeed = WORLD_CONSTANTS.WALK_SPEED;
        
        // Touch tracking
        this.touches = new Map();
        this.joystickTouch = null;
        this.lookTouch = null;
        
        // UI Elements
        this.joystickBase = document.querySelector('.joystick-base');
        this.joystickStick = document.getElementById('movement-stick');
        this.lookArea = document.getElementById('look-area');
        
        // Joystick properties
        this.joystickRadius = 60; // Half of the base size
        this.joystickCenter = { x: 0, y: 0 };
        
        // Setup
        this.setupEventListeners();
        this.updateJoystickCenter();
    }
    
    setupEventListeners() {
        // Touch events
        this.domElement.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.domElement.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        this.domElement.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
        this.domElement.addEventListener('touchcancel', (e) => this.onTouchEnd(e), { passive: false });
        
        // Window resize
        window.addEventListener('resize', () => this.updateJoystickCenter());
        
        // Prevent context menu on long press
        this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    updateJoystickCenter() {
        if (this.joystickBase) {
            const rect = this.joystickBase.getBoundingClientRect();
            this.joystickCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
        }
    }
    
    onTouchStart(event) {
        event.preventDefault();
        
        for (const touch of event.changedTouches) {
            this.touches.set(touch.identifier, touch);
            
            // Check if touch is on joystick
            if (this.isTouchOnJoystick(touch) && !this.joystickTouch) {
                this.joystickTouch = touch.identifier;
                this.handleJoystickMove(touch);
            }
            // Check if touch is in look area
            else if (this.isTouchInLookArea(touch) && !this.lookTouch) {
                this.lookTouch = touch.identifier;
                this.lastLookX = touch.clientX;
                this.lastLookY = touch.clientY;
            }
        }
    }
    
    onTouchMove(event) {
        event.preventDefault();
        
        for (const touch of event.changedTouches) {
            this.touches.set(touch.identifier, touch);
            
            if (touch.identifier === this.joystickTouch) {
                this.handleJoystickMove(touch);
            } else if (touch.identifier === this.lookTouch) {
                this.handleLookMove(touch);
            }
        }
    }
    
    onTouchEnd(event) {
        event.preventDefault();
        
        for (const touch of event.changedTouches) {
            this.touches.delete(touch.identifier);
            
            if (touch.identifier === this.joystickTouch) {
                this.joystickTouch = null;
                this.resetJoystick();
            } else if (touch.identifier === this.lookTouch) {
                this.lookTouch = null;
            }
        }
    }
    
    isTouchOnJoystick(touch) {
        const dx = touch.clientX - this.joystickCenter.x;
        const dy = touch.clientY - this.joystickCenter.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.joystickRadius * 1.5; // Slightly larger hit area
    }
    
    isTouchInLookArea(touch) {
        const rect = this.lookArea.getBoundingClientRect();
        return touch.clientX >= rect.left && 
               touch.clientX <= rect.right && 
               touch.clientY >= rect.top && 
               touch.clientY <= rect.bottom;
    }
    
    handleJoystickMove(touch) {
        const dx = touch.clientX - this.joystickCenter.x;
        const dy = touch.clientY - this.joystickCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Limit to joystick radius
        const limitedDistance = Math.min(distance, this.joystickRadius);
        const angle = Math.atan2(dy, dx);
        
        // Calculate limited position
        const limitedX = Math.cos(angle) * limitedDistance;
        const limitedY = Math.sin(angle) * limitedDistance;
        
        // Update stick position
        this.joystickStick.style.transform = `translate(${limitedX}px, ${limitedY}px)`;
        
        // Calculate movement vector (normalized to -1 to 1)
        if (distance > this.joystickRadius * WORLD_CONSTANTS.JOYSTICK_DEAD_ZONE) {
            this.moveVector.x = limitedX / this.joystickRadius;
            this.moveVector.y = -limitedY / this.joystickRadius; // Invert Y
        } else {
            this.moveVector.set(0, 0);
        }
    }
    
    handleLookMove(touch) {
        const deltaX = touch.clientX - this.lastLookX;
        const deltaY = touch.clientY - this.lastLookY;
        
        // Apply rotation
        this.rotation.y -= deltaX * WORLD_CONSTANTS.TOUCH_SENSITIVITY;
        this.rotation.x -= deltaY * WORLD_CONSTANTS.TOUCH_SENSITIVITY;
        
        // Clamp vertical rotation
        this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
        
        // Update camera rotation
        this.camera.rotation.x = this.rotation.x;
        this.camera.rotation.y = this.rotation.y;
        
        this.lastLookX = touch.clientX;
        this.lastLookY = touch.clientY;
    }
    
    resetJoystick() {
        this.joystickStick.style.transform = 'translate(0, 0)';
        this.moveVector.set(0, 0);
    }
    
    update(deltaTime) {
        if (this.moveVector.length() > 0) {
            // Calculate forward and right vectors based on camera rotation
            const forward = new THREE.Vector3(0, 0, -1);
            const right = new THREE.Vector3(1, 0, 0);
            
            forward.applyEuler(new THREE.Euler(0, this.rotation.y, 0));
            right.applyEuler(new THREE.Euler(0, this.rotation.y, 0));
            
            // Apply movement
            const movement = new THREE.Vector3();
            movement.addScaledVector(forward, this.moveVector.y * this.movementSpeed * deltaTime);
            movement.addScaledVector(right, this.moveVector.x * this.movementSpeed * deltaTime);
            
            this.camera.position.add(movement);
        }
    }
    
    getPosition() {
        return this.camera.position;
    }
    
    setPosition(x, y, z) {
        this.camera.position.set(x, y, z);
    }
    
    dispose() {
        this.domElement.removeEventListener('touchstart', this.onTouchStart);
        this.domElement.removeEventListener('touchmove', this.onTouchMove);
        this.domElement.removeEventListener('touchend', this.onTouchEnd);
        this.domElement.removeEventListener('touchcancel', this.onTouchEnd);
        window.removeEventListener('resize', this.updateJoystickCenter);
    }
    
    enable() {
        // Mobile controls are always enabled when visible
    }
    
    disable() {
        this.resetJoystick();
        this.moveVector.set(0, 0);
    }
}