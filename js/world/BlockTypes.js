// Block type definitions with colors
export const BLOCK_TYPES = {
    AIR: {
        id: 0,
        name: 'air',
        solid: false,
        color: null
    },
    GRASS: {
        id: 1,
        name: 'grass',
        solid: true,
        color: 0x7CFC00 // Lawn green
    },
    DIRT: {
        id: 2,
        name: 'dirt',
        solid: true,
        color: 0x8B4513 // Saddle brown
    },
    STONE: {
        id: 3,
        name: 'stone',
        solid: true,
        color: 0x808080 // Gray
    },
    COBBLESTONE: {
        id: 4,
        name: 'cobblestone',
        solid: true,
        color: 0x696969 // Dim gray
    },
    WOOD: {
        id: 5,
        name: 'wood',
        solid: true,
        color: 0x8B4513 // Saddle brown (darker)
    },
    LEAVES: {
        id: 6,
        name: 'leaves',
        solid: true,
        color: 0x228B22 // Forest green
    },
    SAND: {
        id: 7,
        name: 'sand',
        solid: true,
        color: 0xF4A460 // Sandy brown
    },
    WATER: {
        id: 8,
        name: 'water',
        solid: false,
        color: 0x006994 // Deep blue with transparency
    },
    GLASS: {
        id: 9,
        name: 'glass',
        solid: true,
        color: 0xFFFFFF // White with transparency
    }
};

// Helper functions
export function getBlockById(id) {
    return Object.values(BLOCK_TYPES).find(block => block.id === id);
}

export function getBlockByName(name) {
    return Object.values(BLOCK_TYPES).find(block => block.name === name);
}

export function isBlockSolid(blockId) {
    const block = getBlockById(blockId);
    return block ? block.solid : false;
}

export function getBlockColor(blockId) {
    const block = getBlockById(blockId);
    return block ? block.color : null;
}

// Block face colors (for future use with different face colors)
export function getBlockFaceColor(blockId, face) {
    // For now, all faces have the same color
    // In the future, we can have different colors per face (like grass top vs sides)
    return getBlockColor(blockId);
}