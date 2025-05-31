import * as THREE from 'three';
import { WORLD_CONSTANTS } from '../utils/Constants.js';
import { isBlockSolid, getBlockColor } from '../world/BlockTypes.js';

// Simple mesh generation without greedy meshing for debugging
export class MeshGenerator {
    constructor(materialManager) {
        this.materialManager = materialManager;
        this.blockCount = 0;
    }
    
    // Generate simple mesh for a chunk (one cube per block)
    generateChunkMesh(chunk) {
        console.log(`[MeshGenerator] Generating mesh for chunk at (${chunk.x}, ${chunk.z})`);
        
        const meshes = [];
        const geometries = new Map(); // Group by block type
        this.blockCount = 0;
        
        // Create a single geometry for each block type
        for (let x = 0; x < chunk.size; x++) {
            for (let y = 0; y < chunk.height; y++) {
                for (let z = 0; z < chunk.size; z++) {
                    const blockId = chunk.getBlock(x, y, z);
                    
                    if (isBlockSolid(blockId)) {
                        // Check if block is visible (has at least one exposed face)
                        if (this.isBlockVisible(chunk, x, y, z)) {
                            this.addBlockToGeometry(geometries, blockId, x, y, z);
                            this.blockCount++;
                        }
                    }
                }
            }
        }
        
        console.log(`[MeshGenerator] Created ${this.blockCount} visible blocks`);
        
        // Create meshes from geometries
        geometries.forEach((positions, blockType) => {
            if (positions.length > 0) {
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const material = this.materialManager.getMaterial(blockType);
                
                // Create instanced mesh for better performance
                const instancedMesh = new THREE.InstancedMesh(geometry, material, positions.length / 3);
                
                // Set position for each instance
                const matrix = new THREE.Matrix4();
                for (let i = 0; i < positions.length; i += 3) {
                    matrix.setPosition(
                        positions[i] + chunk.x * WORLD_CONSTANTS.CHUNK_SIZE,
                        positions[i + 1],
                        positions[i + 2] + chunk.z * WORLD_CONSTANTS.CHUNK_SIZE
                    );
                    instancedMesh.setMatrixAt(i / 3, matrix);
                }
                
                instancedMesh.instanceMatrix.needsUpdate = true;
                meshes.push(instancedMesh);
                
                console.log(`[MeshGenerator] Created InstancedMesh for block type ${blockType} with ${positions.length / 3} instances`);
            }
        });
        
        return meshes;
    }
    
    // Check if block has at least one exposed face
    isBlockVisible(chunk, x, y, z) {
        // Check all 6 faces
        return !isBlockSolid(chunk.getBlock(x + 1, y, z)) ||  // Right
               !isBlockSolid(chunk.getBlock(x - 1, y, z)) ||  // Left
               !isBlockSolid(chunk.getBlock(x, y + 1, z)) ||  // Top
               !isBlockSolid(chunk.getBlock(x, y - 1, z)) ||  // Bottom
               !isBlockSolid(chunk.getBlock(x, y, z + 1)) ||  // Front
               !isBlockSolid(chunk.getBlock(x, y, z - 1));    // Back
    }
    
    // Add block position to geometry data
    addBlockToGeometry(geometries, blockType, x, y, z) {
        if (!geometries.has(blockType)) {
            geometries.set(blockType, []);
        }
        
        const positions = geometries.get(blockType);
        positions.push(x, y, z);
    }
    
    // Get block count for debugging
    getBlockCount() {
        return this.blockCount;
    }
}