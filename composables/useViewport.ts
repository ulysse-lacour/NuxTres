import { onBeforeUnmount, onMounted, ref } from "vue";

export function useViewport(fov: number = 40, distance: number = 5) {
  const viewportWidth = ref(0);

  // Calculate viewport width based on camera settings
  function updateViewportSize() {
    const halfWidth = Math.tan((fov * Math.PI) / 180 / 2) * distance;
    viewportWidth.value = halfWidth * 2 * (window.innerWidth / window.innerHeight);
  }

  // Handle window resize events
  onMounted(() => {
    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", updateViewportSize);
  });

  return {
    viewportWidth,
    updateViewportSize,
  };
}
