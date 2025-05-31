import * as THREE from 'three';
import { WORLD_CONSTANTS, FACE_DIRECTIONS, AXES } from '../utils/Constants.js';
import { isBlockSolid } from '../world/BlockTypes.js';

// Optimized mesh generation with greedy meshing algorithm
export class MeshGenerator {
    constructor(materialManager) {
        this.materialManager = materialManager;
    }
    
    // Generate optimized mesh for a chunk
    generateChunkMesh(chunk) {
        const geometries = new Map(); // Geometry per block type
        
        // Process each axis for greedy meshing
        for (let axis = 0; axis < 3; axis++) {
            this.processAxis(chunk, axis, geometries);
        }
        
        // Create meshes from geometries
        const meshes = [];
        geometries.forEach((geometry, blockType) => {
            if (geometry.positions.length > 0) {
                const bufferGeometry = this.createBufferGeometry(geometry);
                const material = this.materialManager.getMaterial(blockType);
                const mesh = new THREE.Mesh(bufferGeometry, material);
                mesh.position.set(
                    chunk.x * WORLD_CONSTANTS.CHUNK_SIZE,
                    0,
                    chunk.z * WORLD_CONSTANTS.CHUNK_SIZE
                );
                meshes.push(mesh);
            }
        });
        
        return meshes;
    }
    
    // Process one axis for greedy meshing
    processAxis(chunk, axis, geometries) {
        const u = (axis + 1) % 3;
        const v = (axis + 2) % 3;
        
        const dims = [0, 0, 0];
        dims[axis] = WORLD_CONSTANTS.CHUNK_SIZE;
        dims[u] = WORLD_CONSTANTS.CHUNK_SIZE;
        dims[v] = WORLD_CONSTANTS.CHUNK_SIZE;
        
        const mask = new Array(dims[u] * dims[v]);
        
        // Process each slice along the axis
        for (let d = -1; d < dims[axis];) {
            // Create mask for current slice
            let n = 0;
            for (let v = 0; v < dims[v]; v++) {
                for (let u = 0; u < dims[u]; u++) {
                    const pos1 = [0, 0, 0];
                    const pos2 = [0, 0, 0];
                    
                    pos1[axis] = d;
                    pos1[u] = u;
                    pos1[v] = v;
                    
                    pos2[axis] = d + 1;
                    pos2[u] = u;
                    pos2[v] = v;
                    
                    const block1 = d >= 0 ? chunk.getBlock(pos1[0], pos1[1], pos1[2]) : 0;
                    const block2 = d < dims[axis] - 1 ? chunk.getBlock(pos2[0], pos2[1], pos2[2]) : 0;
                    
                    // Check if we need a face between these blocks
                    if (isBlockSolid(block1) && !isBlockSolid(block2)) {
                        mask[n] = block1;
                    } else if (!isBlockSolid(block1) && isBlockSolid(block2)) {
                        mask[n] = -block2; // Negative for back face
                    } else {
                        mask[n] = 0;
                    }
                    n++;
                }
            }
            
            d++;
            
            // Generate mesh from mask using greedy algorithm
            n = 0;
            for (let j = 0; j < dims[v]; j++) {
                for (let i = 0; i < dims[u];) {
                    if (mask[n] !== 0) {
                        const currentBlock = mask[n];
                        const blockType = Math.abs(currentBlock);
                        
                        // Find dimensions of the quad
                        let w = 1;
                        let h = 1;
                        
                        // Extend width
                        while (i + w < dims[u] && mask[n + w] === currentBlock) {
                            w++;
                        }
                        
                        // Extend height
                        let done = false;
                        while (j + h < dims[v]) {
                            for (let k = 0; k < w; k++) {
                                if (mask[n + k + h * dims[u]] !== currentBlock) {
                                    done = true;
                                    break;
                                }
                            }
                            if (done) break;
                            h++;
                        }
                        
                        // Add quad
                        const x = [0, 0, 0];
                        x[axis] = d;
                        x[u] = i;
                        x[v] = j;
                        
                        const du = [0, 0, 0];
                        du[u] = w;
                        
                        const dv = [0, 0, 0];
                        dv[v] = h;
                        
                        this.addQuad(
                            geometries,
                            blockType,
                            x,
                            du,
                            dv,
                            currentBlock > 0,
                            axis
                        );
                        
                        // Clear mask
                        for (let l = 0; l < h; l++) {
                            for (let k = 0; k < w; k++) {
                                mask[n + k + l * dims[u]] = 0;
                            }
                        }
                        
                        i += w;
                        n += w;
                    } else {
                        i++;
                        n++;
                    }
                }
            }
        }
    }
    
    // Add a quad to the geometry
    addQuad(geometries, blockType, pos, du, dv, front, axis) {
        if (!geometries.has(blockType)) {
            geometries.set(blockType, {
                positions: [],
                normals: [],
                indices: []
            });
        }
        
        const geometry = geometries.get(blockType);
        const vertexCount = geometry.positions.length / 3;
        
        // Calculate vertices
        const v1 = pos;
        const v2 = [pos[0] + du[0], pos[1] + du[1], pos[2] + du[2]];
        const v3 = [pos[0] + du[0] + dv[0], pos[1] + du[1] + dv[1], pos[2] + du[2] + dv[2]];
        const v4 = [pos[0] + dv[0], pos[1] + dv[1], pos[2] + dv[2]];
        
        // Add vertices
        const vertices = front ? [v1, v2, v3, v4] : [v1, v4, v3, v2];
        vertices.forEach(v => {
            geometry.positions.push(v[0], v[1], v[2]);
        });
        
        // Add normals
        const normal = [0, 0, 0];
        normal[axis] = front ? 1 : -1;
        for (let i = 0; i < 4; i++) {
            geometry.normals.push(normal[0], normal[1], normal[2]);
        }
        
        // Add indices
        geometry.indices.push(
            vertexCount, vertexCount + 1, vertexCount + 2,
            vertexCount, vertexCount + 2, vertexCount + 3
        );
    }
    
    // Create Three.js BufferGeometry from raw data
    createBufferGeometry(geometryData) {
        const geometry = new THREE.BufferGeometry();
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(geometryData.positions, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(geometryData.normals, 3));
        geometry.setIndex(geometryData.indices);
        
        return geometry;
    }
}