import { nextTick, onActivated, onDeactivated, onMounted, ref } from "vue";

import { useCardPositioning } from "./useCardPositioning";

/**
 * Composable to handle client-side navigation transitions for TresJS scenes
 * Ensures proper initialization and cleanup when navigating between routes
 */
export function useClientNavigation() {
  // Scene ready state tracking
  const isSceneReady = ref(false);
  const isActivated = ref(false);

  // Get card positioning system with viewport handling
  const { forceRefresh } = useCardPositioning();

  // Setup initialization
  onMounted(() => {
    // Initial initialization with delay to ensure DOM is ready
    setTimeout(() => {
      initializeScene();
    }, 50);
  });

  // Handle component activation (when navigating via client-side routing)
  onActivated(() => {
    isActivated.value = true;

    // Reset scene state
    isSceneReady.value = false;

    // Re-initialize with longer delay when coming back via client navigation
    setTimeout(() => {
      initializeScene();
    }, 150);
  });

  // Handle component deactivation
  onDeactivated(() => {
    isActivated.value = false;
  });

  // Scene initialization
  const initializeScene = () => {
    // Wait for next tick to ensure layout is complete
    nextTick(() => {
      // Force update viewport dimensions
      forceRefresh();

      // Set scene ready
      isSceneReady.value = true;
    });
  };

  return {
    isSceneReady,
    isActivated,
    initializeScene,
  };
}
