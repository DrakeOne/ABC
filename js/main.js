import * as THREE from 'three';
import { WORLD_CONSTANTS, RENDER_CONSTANTS } from './utils/Constants.js';
import { DeviceDetector } from './utils/DeviceDetector.js';
import { MaterialManager } from './rendering/MaterialManager.js';
import { World } from './world/World.js';
import { ControlsManager } from './controls/ControlsManager.js';

// Main game class
class VoxelGame {
    constructor() {
        this.clock = new THREE.Clock();
        this.isRunning = false;
        
        // Initialize Three.js components
        this.initRenderer();
        this.initScene();
        this.initCamera();
        this.initLights();
        
        // Initialize game systems
        this.initMaterials();
        this.initWorld();
        this.initControls();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start the game
        this.start();
    }
    
    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: !DeviceDetector.isLowEndDevice(),
            powerPreference: DeviceDetector.isLowEndDevice() ? 'low-power' : 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = false; // Disabled for performance initially
        
        // Set clear color to sky blue
        this.renderer.setClearColor(0x87CEEB);
    }
    
    initScene() {
        this.scene = new THREE.Scene();
        
        // Add fog for depth
        this.scene.fog = new THREE.Fog(
            0x87CEEB,
            RENDER_CONSTANTS.FOG_NEAR,
            RENDER_CONSTANTS.FOG_FAR
        );
    }
    
    initCamera() {
        this.camera = new THREE.PerspectiveCamera(
            WORLD_CONSTANTS.FOV,
            window.innerWidth / window.innerHeight,
            WORLD_CONSTANTS.NEAR_PLANE,
            WORLD_CONSTANTS.FAR_PLANE
        );
        
        // Set initial camera position (spawn point)
        this.camera.position.set(
            WORLD_CONSTANTS.CHUNK_SIZE / 2,
            65 + WORLD_CONSTANTS.PLAYER_EYE_HEIGHT, // Ground level + eye height
            WORLD_CONSTANTS.CHUNK_SIZE / 2
        );
    }
    
    initLights() {
        // Ambient light for base illumination
        const ambientLight = new THREE.AmbientLight(
            0xffffff,
            RENDER_CONSTANTS.AMBIENT_LIGHT_INTENSITY
        );
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(
            0xffffff,
            RENDER_CONSTANTS.DIRECTIONAL_LIGHT_INTENSITY
        );
        directionalLight.position.set(1, 1, 0.5).normalize();
        this.scene.add(directionalLight);
    }
    
    initMaterials() {
        this.materialManager = new MaterialManager();
        
        // Set quality based on device
        const quality = DeviceDetector.getRecommendedQuality();
        this.materialManager.setQuality(quality);
    }
    
    initWorld() {
        this.world = new World(this.scene, this.materialManager);
        this.world.initialize();
    }
    
    initControls() {
        this.controls = new ControlsManager(this.camera, this.renderer.domElement);
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Visibility change (pause when tab is hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    start() {
        this.isRunning = true;
        this.animate();
    }
    
    pause() {
        this.isRunning = false;
    }
    
    resume() {
        this.isRunning = true;
        this.clock.getDelta(); // Reset delta
        this.animate();
    }
    
    animate() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        
        // Update systems
        this.update(deltaTime);
        
        // Render
        this.render();
    }
    
    update(deltaTime) {
        // Update controls
        this.controls.update(deltaTime);
        
        // Update world based on player position
        const position = this.controls.getPosition();
        this.world.updatePlayerPosition(position.x, position.z);
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    dispose() {
        this.pause();
        this.controls.dispose();
        this.world.dispose();
        this.materialManager.dispose();
        this.renderer.dispose();
    }
}

// Initialize game when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.game = new VoxelGame();
    });
} else {
    window.game = new VoxelGame();
}