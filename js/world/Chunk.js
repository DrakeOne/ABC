import { WORLD_CONSTANTS } from '../utils/Constants.js';
import { BLOCK_TYPES } from './BlockTypes.js';

// Chunk class for spatial organization
export class Chunk {
    constructor(x, z) {
        this.x = x; // Chunk X coordinate (in chunk units, not blocks)
        this.z = z; // Chunk Z coordinate
        this.size = WORLD_CONSTANTS.CHUNK_SIZE;
        this.height = WORLD_CONSTANTS.WORLD_HEIGHT;
        
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
        const groundLevel = 64; // Standard Minecraft sea level
        
        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                for (let y = 0; y < this.height; y++) {
                    if (y < groundLevel - 3) {
                        this.setBlock(x, y, z, BLOCK_TYPES.STONE.id);
                    } else if (y < groundLevel) {
                        this.setBlock(x, y, z, BLOCK_TYPES.DIRT.id);
                    } else if (y === groundLevel) {
                        this.setBlock(x, y, z, BLOCK_TYPES.GRASS.id);
                    } else {
                        this.setBlock(x, y, z, BLOCK_TYPES.AIR.id);
                    }
                }
            }
        }
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
    }
    
    // Get chunk key for mapping
    static getKey(x, z) {
        return `${x},${z}`;
    }
}