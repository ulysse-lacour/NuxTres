import { onBeforeUnmount, onMounted, ref } from "vue";
import type { Ref } from "vue";

/**
 * Viewport calculation composable
 * Provides reactive measurements of the camera's viewport in world units
 *
 * @param fov - Camera field of view in degrees
 * @param distance - Distance from camera to the viewport plane
 * @returns Object containing viewport measurements and update function
 */
export function useViewport(fov: number = 40, distance: number = 5) {
  // Reactive viewport measurements
  const viewportWidth = ref<number>(0);
  const viewportHeight = ref<number>(0);
  const aspectRatio = ref<number>(1);

  /**
   * Calculate and update viewport dimensions based on camera parameters and window size
   * This translates window dimensions to world-space units at the given distance
   */
  function updateViewportSize(): void {
    // Calculate frustum height at specified distance using the field of view
    const halfFovRadians = (fov * Math.PI) / 180 / 2;
    const halfHeight = Math.tan(halfFovRadians) * distance;

    // Calculate current aspect ratio from window dimensions
    aspectRatio.value = window.innerWidth / window.innerHeight;

    // Calculate final viewport dimensions in world units
    viewportHeight.value = halfHeight * 2;
    viewportWidth.value = viewportHeight.value * aspectRatio.value;

    // Ensure minimum width for calculations
    viewportWidth.value = Math.max(viewportWidth.value, 10);
  }

  // Debounced resize handler to improve performance
  let resizeTimeout: number | null = null;
  function handleResize(): void {
    if (resizeTimeout) {
      window.clearTimeout(resizeTimeout);
    }

    resizeTimeout = window.setTimeout(() => {
      updateViewportSize();
      resizeTimeout = null;
    }, 100); // 100ms debounce
  }

  // Setup resize listener
  onMounted(() => {
    updateViewportSize();
    window.addEventListener("resize", handleResize);
  });

  // Clean up event listeners
  onBeforeUnmount(() => {
    if (resizeTimeout) {
      window.clearTimeout(resizeTimeout);
    }
    window.removeEventListener("resize", handleResize);
  });

  return {
    viewportWidth,
    viewportHeight,
    aspectRatio,
    updateViewportSize,
  };
}
