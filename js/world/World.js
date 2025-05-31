import { WORLD_CONSTANTS } from '../utils/Constants.js';
import { Chunk } from './Chunk.js';
import { MeshGenerator } from '../rendering/MeshGenerator.js';

// Main world class that manages chunks
export class World {
    constructor(scene, materialManager) {
        this.scene = scene;
        this.materialManager = materialManager;
        this.meshGenerator = new MeshGenerator(materialManager);
        
        // Map to store loaded chunks
        this.chunks = new Map();
        
        // Current render distance
        this.renderDistance = WORLD_CONSTANTS.INITIAL_RENDER_DISTANCE;
        
        // Player position for chunk loading
        this.playerChunkX = 0;
        this.playerChunkZ = 0;
    }
    
    // Initialize world with chunks around spawn
    initialize() {
        this.loadChunksAroundPlayer();
    }
    
    // Load chunks around the player position
    loadChunksAroundPlayer() {
        const startX = this.playerChunkX - this.renderDistance;
        const endX = this.playerChunkX + this.renderDistance;
        const startZ = this.playerChunkZ - this.renderDistance;
        const endZ = this.playerChunkZ + this.renderDistance;
        
        // Load new chunks
        for (let x = startX; x <= endX; x++) {
            for (let z = startZ; z <= endZ; z++) {
                const key = Chunk.getKey(x, z);
                if (!this.chunks.has(key)) {
                    this.loadChunk(x, z);
                }
            }
        }
        
        // Unload distant chunks
        this.unloadDistantChunks();
    }
    
    // Load a single chunk
    loadChunk(x, z) {
        const chunk = new Chunk(x, z);
        const key = Chunk.getKey(x, z);
        this.chunks.set(key, chunk);
        
        // Generate mesh for the chunk
        this.updateChunkMesh(chunk);
    }
    
    // Unload chunks that are too far from the player
    unloadDistantChunks() {
        const maxDistance = this.renderDistance + 1;
        
        for (const [key, chunk] of this.chunks) {
            const dx = Math.abs(chunk.x - this.playerChunkX);
            const dz = Math.abs(chunk.z - this.playerChunkZ);
            
            if (dx > maxDistance || dz > maxDistance) {
                this.unloadChunk(key, chunk);
            }
        }
    }
    
    // Unload a single chunk
    unloadChunk(key, chunk) {
        chunk.dispose();
        this.chunks.delete(key);
    }
    
    // Update chunk mesh (when blocks change or chunk loads)
    updateChunkMesh(chunk) {
        if (!chunk.isDirty) return;
        
        // Remove old meshes
        chunk.meshes.forEach(mesh => {
            this.scene.remove(mesh);
        });
        
        // Generate new meshes
        const meshes = this.meshGenerator.generateChunkMesh(chunk);
        
        // Add to scene
        meshes.forEach(mesh => {
            this.scene.add(mesh);
        });
        
        chunk.setMeshes(meshes);
    }
    
    // Update player position and load/unload chunks as needed
    updatePlayerPosition(worldX, worldZ) {
        const chunkX = Math.floor(worldX / WORLD_CONSTANTS.CHUNK_SIZE);
        const chunkZ = Math.floor(worldZ / WORLD_CONSTANTS.CHUNK_SIZE);
        
        if (chunkX !== this.playerChunkX || chunkZ !== this.playerChunkZ) {
            this.playerChunkX = chunkX;
            this.playerChunkZ = chunkZ;
            this.loadChunksAroundPlayer();
        }
    }
    
    // Get block at world coordinates
    getBlock(worldX, worldY, worldZ) {
        const chunkX = Math.floor(worldX / WORLD_CONSTANTS.CHUNK_SIZE);
        const chunkZ = Math.floor(worldZ / WORLD_CONSTANTS.CHUNK_SIZE);
        const key = Chunk.getKey(chunkX, chunkZ);
        
        const chunk = this.chunks.get(key);
        if (!chunk) return 0; // Air if chunk not loaded
        
        const localX = worldX - chunkX * WORLD_CONSTANTS.CHUNK_SIZE;
        const localZ = worldZ - chunkZ * WORLD_CONSTANTS.CHUNK_SIZE;
        
        return chunk.getBlock(localX, worldY, localZ);
    }
    
    // Set block at world coordinates
    setBlock(worldX, worldY, worldZ, blockId) {
        const chunkX = Math.floor(worldX / WORLD_CONSTANTS.CHUNK_SIZE);
        const chunkZ = Math.floor(worldZ / WORLD_CONSTANTS.CHUNK_SIZE);
        const key = Chunk.getKey(chunkX, chunkZ);
        
        const chunk = this.chunks.get(key);
        if (!chunk) return;
        
        const localX = worldX - chunkX * WORLD_CONSTANTS.CHUNK_SIZE;
        const localZ = worldZ - chunkZ * WORLD_CONSTANTS.CHUNK_SIZE;
        
        chunk.setBlock(localX, worldY, localZ, blockId);
        
        // Update chunk mesh
        this.updateChunkMesh(chunk);
        
        // Check if we need to update neighboring chunks (for face culling)
        this.updateNeighboringChunks(worldX, worldY, worldZ, chunkX, chunkZ);
    }
    
    // Update neighboring chunks if block is on chunk border
    updateNeighboringChunks(worldX, worldY, worldZ, chunkX, chunkZ) {
        const localX = worldX - chunkX * WORLD_CONSTANTS.CHUNK_SIZE;
        const localZ = worldZ - chunkZ * WORLD_CONSTANTS.CHUNK_SIZE;
        
        // Check each border
        if (localX === 0) {
            const neighbor = this.chunks.get(Chunk.getKey(chunkX - 1, chunkZ));
            if (neighbor) this.updateChunkMesh(neighbor);
        }
        if (localX === WORLD_CONSTANTS.CHUNK_SIZE - 1) {
            const neighbor = this.chunks.get(Chunk.getKey(chunkX + 1, chunkZ));
            if (neighbor) this.updateChunkMesh(neighbor);
        }
        if (localZ === 0) {
            const neighbor = this.chunks.get(Chunk.getKey(chunkX, chunkZ - 1));
            if (neighbor) this.updateChunkMesh(neighbor);
        }
        if (localZ === WORLD_CONSTANTS.CHUNK_SIZE - 1) {
            const neighbor = this.chunks.get(Chunk.getKey(chunkX, chunkZ + 1));
            if (neighbor) this.updateChunkMesh(neighbor);
        }
    }
    
    // Clean up all chunks
    dispose() {
        for (const chunk of this.chunks.values()) {
            chunk.dispose();
        }
        this.chunks.clear();
    }
}