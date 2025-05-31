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
        
        // Current render distance (reduced for debugging)
        this.renderDistance = 1; // Only load nearby chunks
        
        // Player position for chunk loading
        this.playerChunkX = 0;
        this.playerChunkZ = 0;
        
        // Stats
        this.totalBlocks = 0;
        
        console.log('[World] World initialized');
    }
    
    // Initialize world with chunks around spawn
    initialize() {
        console.log('[World] Initializing world...');
        this.loadChunksAroundPlayer();
    }
    
    // Load chunks around the player position
    loadChunksAroundPlayer() {
        console.log(`[World] Loading chunks around player at chunk (${this.playerChunkX}, ${this.playerChunkZ})`);
        
        const startX = this.playerChunkX - this.renderDistance;
        const endX = this.playerChunkX + this.renderDistance;
        const startZ = this.playerChunkZ - this.renderDistance;
        const endZ = this.playerChunkZ + this.renderDistance;
        
        let chunksLoaded = 0;
        
        // Load new chunks
        for (let x = startX; x <= endX; x++) {
            for (let z = startZ; z <= endZ; z++) {
                const key = Chunk.getKey(x, z);
                if (!this.chunks.has(key)) {
                    this.loadChunk(x, z);
                    chunksLoaded++;
                }
            }
        }
        
        console.log(`[World] Loaded ${chunksLoaded} new chunks. Total chunks: ${this.chunks.size}`);
        
        // Don't unload chunks for now (debugging)
        // this.unloadDistantChunks();
    }
    
    // Load a single chunk
    loadChunk(x, z) {
        console.log(`[World] Loading chunk at (${x}, ${z})`);
        
        const chunk = new Chunk(x, z);
        const key = Chunk.getKey(x, z);
        this.chunks.set(key, chunk);
        
        // Generate mesh for the chunk
        this.updateChunkMesh(chunk);
        
        // Update total blocks
        this.totalBlocks += chunk.getBlockCount();
    }
    
    // Update chunk mesh (when blocks change or chunk loads)
    updateChunkMesh(chunk) {
        if (!chunk.isDirty) {
            console.log(`[World] Chunk (${chunk.x}, ${chunk.z}) is not dirty, skipping mesh update`);
            return;
        }
        
        console.log(`[World] Updating mesh for chunk (${chunk.x}, ${chunk.z})`);
        
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
        
        console.log(`[World] Added ${meshes.length} meshes to scene for chunk (${chunk.x}, ${chunk.z})`);
    }
    
    // Update player position and load/unload chunks as needed
    updatePlayerPosition(worldX, worldZ) {
        const chunkX = Math.floor(worldX / WORLD_CONSTANTS.CHUNK_SIZE);
        const chunkZ = Math.floor(worldZ / WORLD_CONSTANTS.CHUNK_SIZE);
        
        if (chunkX !== this.playerChunkX || chunkZ !== this.playerChunkZ) {
            console.log(`[World] Player moved to chunk (${chunkX}, ${chunkZ})`);
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
    
    // Get world stats for debugging
    getStats() {
        return {
            chunks: this.chunks.size,
            blocks: this.totalBlocks,
            meshes: this.meshGenerator.getBlockCount()
        };
    }
    
    // Clean up all chunks
    dispose() {
        console.log('[World] Disposing world...');
        for (const chunk of this.chunks.values()) {
            chunk.dispose();
        }
        this.chunks.clear();
    }
}