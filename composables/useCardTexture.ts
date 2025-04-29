import { CanvasTexture } from "three";
import { computed, ref, watch } from "vue";
import type { Ref } from "vue";

// Global texture cache shared between instances
const globalTextureCache = new Map<string, CanvasTexture>();

/**
 * Composable for creating and managing card textures
 * Efficiently handles canvas generation and caching for better performance
 *
 * @param name - Card name to display
 * @param color - Background color of the card
 * @param textColor - Color for the text
 * @returns Object containing the card texture and related functions
 */
export function useCardTexture(name: Ref<string>, color: Ref<string>, textColor: Ref<string>) {
  // Texture reference
  const cardTexture = ref<CanvasTexture | null>(null);

  // Track if we're in a browser environment
  const isBrowser = typeof window !== "undefined";

  // Create a cache key based on card properties
  const cacheKey = computed(() => `${name.value}-${color.value}-${textColor.value}`);

  /**
   * Create a canvas for the card texture with text and styling
   */
  function createCardCanvas(): HTMLCanvasElement | null {
    if (!isBrowser) return null;

    try {
      // Create a canvas element
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 768;

      // Get 2D context for drawing
      const context = canvas.getContext("2d");
      if (!context) return null;

      // Fill with card color
      context.fillStyle = color.value;
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Add a subtle gradient overlay
      const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.2)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Draw decorative border
      context.strokeStyle = "rgba(255, 255, 255, 0.4)";
      context.lineWidth = 10;
      context.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Add inner border for depth
      context.strokeStyle = "rgba(0, 0, 0, 0.2)";
      context.lineWidth = 4;
      context.strokeRect(26, 26, canvas.width - 52, canvas.height - 52);

      // Calculate appropriate font size based on text length
      const fontSize = Math.min(120, 500 / Math.max(1, name.value.length));
      context.font = `bold ${fontSize}px Arial, sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";

      // Add text shadow for better visibility
      context.shadowColor = "rgba(0, 0, 0, 0.6)";
      context.shadowBlur = 12;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;

      // Draw card text
      context.fillStyle = textColor.value || "#ffffff";
      context.fillText(name.value, canvas.width / 2, canvas.height / 2);

      return canvas;
    } catch (error) {
      console.error("Error creating card canvas:", error);
      return null;
    }
  }

  /**
   * Create or retrieve a texture from cache
   */
  function generateTexture(): CanvasTexture | null {
    const key = cacheKey.value;

    // Check if texture exists in global cache
    if (globalTextureCache.has(key)) {
      return globalTextureCache.get(key) || null;
    }

    // Create new canvas and texture
    const canvas = createCardCanvas();
    if (!canvas) return null;

    // Create Three.js texture from canvas
    const texture = new CanvasTexture(canvas);
    texture.needsUpdate = true;

    // Store in global cache
    globalTextureCache.set(key, texture);

    return texture;
  }

  // Generate texture initially if we're in a browser
  if (isBrowser) {
    cardTexture.value = generateTexture();
  }

  // Update texture when card properties change
  watch(
    [name, color, textColor],
    () => {
      if (isBrowser) {
        cardTexture.value = generateTexture();
      }
    },
    { immediate: false }
  );

  /**
   * Clean up texture resources when component is unmounted
   */
  function dispose() {
    // Just clear the reference, we don't dispose the actual texture
    // since it might be used by other cards with the same properties
    cardTexture.value = null;
  }

  return {
    cardTexture,
    dispose,
    regenerateTexture: () => {
      cardTexture.value = generateTexture();
    },
  };
}
