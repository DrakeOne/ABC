// Minecraft-style game constants
export const WORLD_CONSTANTS = {
    // Block dimensions (Minecraft scale)
    BLOCK_SIZE: 1, // 1 meter per block
    
    // Player constants
    PLAYER_HEIGHT: 1.8,
    PLAYER_EYE_HEIGHT: 1.62, // Eye level from ground
    PLAYER_WIDTH: 0.6,
    
    // Camera settings
    FOV: 75,
    NEAR_PLANE: 0.1,
    FAR_PLANE: 1000,
    
    // Movement speeds (meters per second)
    WALK_SPEED: 4.317, // Minecraft walking speed
    SPRINT_SPEED: 5.612, // Minecraft sprinting speed
    
    // World generation
    CHUNK_SIZE: 16, // 16x16 blocks per chunk (Minecraft standard)
    WORLD_HEIGHT: 256, // Maximum world height
    INITIAL_RENDER_DISTANCE: 4, // Chunks in each direction
    
    // Controls
    MOUSE_SENSITIVITY: 0.002,
    TOUCH_SENSITIVITY: 0.003,
    JOYSTICK_DEAD_ZONE: 0.15,
};

// Rendering constants
export const RENDER_CONSTANTS = {
    // Optimization thresholds
    MAX_FACES_PER_MESH: 65536, // WebGL index buffer limit
    GREEDY_MESH_ENABLED: true,
    
    // Visual settings
    AMBIENT_LIGHT_INTENSITY: 0.6,
    DIRECTIONAL_LIGHT_INTENSITY: 0.8,
    FOG_NEAR: 50,
    FOG_FAR: 200,
    
    // Performance
    TARGET_FPS: 60,
    MOBILE_TARGET_FPS: 30,
};

// Block face directions
export const FACE_DIRECTIONS = {
    TOP: { normal: [0, 1, 0], vertices: [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]] },
    BOTTOM: { normal: [0, -1, 0], vertices: [[0, 0, 1], [1, 0, 1], [1, 0, 0], [0, 0, 0]] },
    NORTH: { normal: [0, 0, -1], vertices: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]] },
    SOUTH: { normal: [0, 0, 1], vertices: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]] },
    EAST: { normal: [1, 0, 0], vertices: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]] },
    WEST: { normal: [-1, 0, 0], vertices: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]] }
};

// Axis definitions for greedy meshing
export const AXES = {
    X: 0,
    Y: 1,
    Z: 2
};