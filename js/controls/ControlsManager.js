import { DeviceDetector } from '../utils/DeviceDetector.js';
import { DesktopControls } from './DesktopControls.js';
import { MobileControls } from './MobileControls.js';

// Controls manager that handles device detection and control switching
export class ControlsManager {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        
        // Detect device type
        this.isMobile = DeviceDetector.isMobile();
        
        // Current active controls
        this.activeControls = null;
        
        // Initialize appropriate controls
        this.initializeControls();
        
        // Setup resize listener for device changes
        this.setupResizeListener();
    }
    
    initializeControls() {
        // Clean up existing controls if any
        if (this.activeControls) {
            this.activeControls.dispose();
        }
        
        if (this.isMobile) {
            // Show mobile controls UI
            const mobileControlsUI = document.getElementById('mobile-controls');
            if (mobileControlsUI) {
                mobileControlsUI.classList.remove('hidden');
            }
            
            // Hide desktop instructions
            const desktopInstructions = document.querySelector('.desktop-instructions');
            const mobileInstructions = document.querySelector('.mobile-instructions');
            if (desktopInstructions) desktopInstructions.style.display = 'none';
            if (mobileInstructions) mobileInstructions.style.display = 'block';
            
            // Create mobile controls
            this.activeControls = new MobileControls(this.camera, this.domElement);
        } else {
            // Hide mobile controls UI
            const mobileControlsUI = document.getElementById('mobile-controls');
            if (mobileControlsUI) {
                mobileControlsUI.classList.add('hidden');
            }
            
            // Show desktop instructions
            const desktopInstructions = document.querySelector('.desktop-instructions');
            const mobileInstructions = document.querySelector('.mobile-instructions');
            if (desktopInstructions) desktopInstructions.style.display = 'block';
            if (mobileInstructions) mobileInstructions.style.display = 'none';
            
            // Create desktop controls
            this.activeControls = new DesktopControls(this.camera, this.domElement);
        }
    }
    
    setupResizeListener() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Re-detect device type on resize
                const wasMobile = this.isMobile;
                this.isMobile = DeviceDetector.isMobile();
                
                // If device type changed, reinitialize controls
                if (wasMobile !== this.isMobile) {
                    const currentPosition = this.activeControls.getPosition();
                    this.initializeControls();
                    this.activeControls.setPosition(
                        currentPosition.x,
                        currentPosition.y,
                        currentPosition.z
                    );
                }
            }, 250);
        });
    }
    
    update(deltaTime) {
        if (this.activeControls) {
            this.activeControls.update(deltaTime);
        }
    }
    
    getPosition() {
        return this.activeControls ? this.activeControls.getPosition() : this.camera.position;
    }
    
    setPosition(x, y, z) {
        if (this.activeControls) {
            this.activeControls.setPosition(x, y, z);
        } else {
            this.camera.position.set(x, y, z);
        }
    }
    
    enable() {
        if (this.activeControls) {
            this.activeControls.enable();
        }
    }
    
    disable() {
        if (this.activeControls) {
            this.activeControls.disable();
        }
    }
    
    dispose() {
        if (this.activeControls) {
            this.activeControls.dispose();
        }
    }
    
    // Force switch to specific control type (useful for debugging)
    forceControlType(type) {
        this.isMobile = (type === 'mobile');
        this.initializeControls();
    }
}