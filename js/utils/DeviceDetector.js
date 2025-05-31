// Device detection utilities
export class DeviceDetector {
    static isMobile() {
        // Check for touch capability and screen size
        const hasTouch = ('ontouchstart' in window) || 
                        (navigator.maxTouchPoints > 0) || 
                        (navigator.msMaxTouchPoints > 0);
        
        // Check user agent for mobile devices
        const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        const isMobileUA = mobileRegex.test(navigator.userAgent);
        
        // Check screen size
        const isSmallScreen = window.innerWidth <= 768;
        
        return hasTouch && (isMobileUA || isSmallScreen);
    }
    
    static isTablet() {
        const isIPad = /iPad/i.test(navigator.userAgent) || 
                      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isAndroidTablet = /Android/i.test(navigator.userAgent) && 
                               !/Mobile/i.test(navigator.userAgent);
        
        return isIPad || isAndroidTablet;
    }
    
    static isTouchDevice() {
        return ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0) || 
               (navigator.msMaxTouchPoints > 0);
    }
    
    static isLandscape() {
        return window.innerWidth > window.innerHeight;
    }
    
    static getDevicePixelRatio() {
        return window.devicePixelRatio || 1;
    }
    
    static isLowEndDevice() {
        // Simple heuristic based on various factors
        const pixelRatio = this.getDevicePixelRatio();
        const screenArea = window.screen.width * window.screen.height;
        const memory = navigator.deviceMemory || 4; // Default to 4GB if not available
        
        // Consider device low-end if:
        // - Less than 4GB RAM
        // - Small screen with high pixel ratio (budget phones)
        // - Very small screen area
        return memory < 4 || 
               (screenArea < 800000 && pixelRatio > 2) || 
               screenArea < 400000;
    }
    
    static getRecommendedQuality() {
        if (this.isLowEndDevice()) {
            return 'low';
        } else if (this.isMobile() && !this.isTablet()) {
            return 'medium';
        }
        return 'high';
    }
    
    static supportsWebGL2() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl2'));
        } catch (e) {
            return false;
        }
    }
    
    static getMaxTextureSize() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
            if (gl) {
                return gl.getParameter(gl.MAX_TEXTURE_SIZE);
            }
        } catch (e) {
            console.warn('Could not determine max texture size');
        }
        return 2048; // Safe default
    }
}