export function isWebGLAvailable(): boolean {
    return false; // Force fallback
}

export function isWebGL2Available(): boolean {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
    } catch (e) {
        return false;
    }
}
