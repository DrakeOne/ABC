import { WORLD_CONSTANTS } from '../utils/Constants.js';
import { BLOCK_TYPES } from './BlockTypes.js';

// Chunk class for spatial organization
export class Chunk {
    constructor(x, z) {
        this.x = x; // Chunk X coordinate (in chunk units, not blocks)
        this.z = z; // Chunk Z coordinate
        this.size = WORLD_CONSTANTS.CHUNK_SIZE;
        this.height = WORLD_CONSTANTS.WORLD_HEIGHT;
        
        console.log(`[Chunk] Creating chunk at (${x}, ${z})`);
        
        // 3D array to store block data
        // Using Uint8Array for memory efficiency
        this.blocks = new Uint8Array(this.size * this.height * this.size);
        
        // Mesh references for rendering
        this.meshes = [];
        
        // Dirty flag for regeneration
        this.isDirty = true;
        
        // Initialize with flat world
        this.generateFlatTerrain();
    }
    
    // Generate a flat world with grass
    generateFlatTerrain() {
        console.log(`[Chunk] Generating flat terrain for chunk (${this.x}, ${this.z})`);
        
        const groundLevel = 64; // Standard Minecraft sea level
        let blockCount = 0;
        
        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                // Only generate a single layer of grass for debugging
                this.setBlock(x, groundLevel, z, BLOCK_TYPES.GRASS.id);
                blockCount++;
                
                // Add some variety for testing
                if ((x + z) % 4 === 0 && x > 0 && z > 0 && x < this.size - 1 && z < this.size - 1) {
                    this.setBlock(x, groundLevel + 1, z, BLOCK_TYPES.STONE.id);
                    blockCount++;
                }
            }
        }
        
        console.log(`[Chunk] Generated ${blockCount} blocks in chunk (${this.x}, ${this.z})`);
    }
    
    // Get block at local chunk coordinates
    getBlock(x, y, z) {
        if (this.isValidPosition(x, y, z)) {
            return this.blocks[this.getIndex(x, y, z)];
        }
        return BLOCK_TYPES.AIR.id;
    }
    
    // Set block at local chunk coordinates
    setBlock(x, y, z, blockId) {
        if (this.isValidPosition(x, y, z)) {
            this.blocks[this.getIndex(x, y, z)] = blockId;
            this.isDirty = true;
        }
    }
    
    // Convert 3D coordinates to 1D array index
    getIndex(x, y, z) {
        return y * this.size * this.size + z * this.size + x;
    }
    
    // Check if position is within chunk bounds
    isValidPosition(x, y, z) {
        return x >= 0 && x < this.size &&
               y >= 0 && y < this.height &&
               z >= 0 && z < this.size;
    }
    
    // Get world position from local chunk position
    getWorldPosition(localX, localY, localZ) {
        return {
            x: this.x * this.size + localX,
            y: localY,
            z: this.z * this.size + localZ
        };
    }
    
    // Get local position from world position
    getLocalPosition(worldX, worldY, worldZ) {
        return {
            x: worldX - this.x * this.size,
            y: worldY,
            z: worldZ - this.z * this.size
        };
    }
    
    // Clean up meshes
    dispose() {
        console.log(`[Chunk] Disposing chunk (${this.x}, ${this.z})`);
        this.meshes.forEach(mesh => {
            if (mesh.geometry) mesh.geometry.dispose();
            mesh.parent?.remove(mesh);
        });
        this.meshes = [];
    }
    
    // Update meshes reference
    setMeshes(meshes) {
        this.dispose();
        this.meshes = meshes;
        this.isDirty = false;
        console.log(`[Chunk] Set ${meshes.length} meshes for chunk (${this.x}, ${this.z})`);
    }
    
    // Get chunk key for mapping
    static getKey(x, z) {
        return `${x},${z}`;
    }
    
    // Debug method to count non-air blocks
    getBlockCount() {
        let count = 0;
        for (let i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i] !== BLOCK_TYPES.AIR.id) {
                count++;
            }
        }
        return count;
    }
}