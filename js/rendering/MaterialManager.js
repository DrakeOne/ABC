import * as THREE from 'three';
import { BLOCK_TYPES, getBlockColor } from '../world/BlockTypes.js';

// Material manager for block materials
export class MaterialManager {
    constructor() {
        this.materials = new Map();
        this.initializeMaterials();
    }
    
    initializeMaterials() {
        // Create materials for each block type
        Object.values(BLOCK_TYPES).forEach(blockType => {
            if (blockType.color !== null) {
                const material = this.createBlockMaterial(blockType);
                this.materials.set(blockType.id, material);
            }
        });
    }
    
    createBlockMaterial(blockType) {
        const materialOptions = {
            color: blockType.color,
            // Use flat shading for that classic Minecraft look
            flatShading: true,
            // Vertex colors can be used for ambient occlusion later
            vertexColors: false
        };
        
        // Special cases for certain block types
        if (blockType.name === 'water' || blockType.name === 'glass') {
            materialOptions.transparent = true;
            materialOptions.opacity = blockType.name === 'water' ? 0.8 : 0.3;
            materialOptions.side = THREE.DoubleSide;
        }
        
        // Use MeshLambertMaterial for better performance on mobile
        // MeshPhongMaterial or MeshStandardMaterial can be used for higher quality
        return new THREE.MeshLambertMaterial(materialOptions);
    }
    
    getMaterial(blockId) {
        return this.materials.get(blockId);
    }
    
    // Get all materials as an array (useful for multi-material meshes)
    getAllMaterials() {
        return Array.from(this.materials.values());
    }
    
    // Get material index for a block type (for multi-material geometry)
    getMaterialIndex(blockId) {
        let index = 0;
        for (const [id] of this.materials) {
            if (id === blockId) return index;
            index++;
        }
        return -1;
    }
    
    // Update material quality based on device performance
    setQuality(quality) {
        this.materials.forEach((material, blockId) => {
            const blockType = Object.values(BLOCK_TYPES).find(b => b.id === blockId);
            
            if (quality === 'low') {
                // Use basic material for low-end devices
                const newMaterial = new THREE.MeshBasicMaterial({
                    color: blockType.color,
                    transparent: material.transparent,
                    opacity: material.opacity
                });
                this.materials.set(blockId, newMaterial);
                material.dispose(); // Clean up old material
            } else if (quality === 'high' && material.type === 'MeshBasicMaterial') {
                // Upgrade to better material for high-end devices
                const newMaterial = this.createBlockMaterial(blockType);
                this.materials.set(blockId, newMaterial);
                material.dispose();
            }
        });
    }
    
    // Dispose all materials (cleanup)
    dispose() {
        this.materials.forEach(material => {
            material.dispose();
        });
        this.materials.clear();
    }
}