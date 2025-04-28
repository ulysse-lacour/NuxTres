import { useRenderLoop } from "@tresjs/core";
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import type { Mesh } from "three";

import { useCardGameStore } from "../stores/cardGame";

/**
 * Composable to handle card interaction behaviors including hover effects and animations
 *
 * @param index - Card index in its collection
 * @param totalCards - Total number of cards in the collection
 * @returns Card interaction properties and methods
 */
export function useCardInteraction(index: number = 0, totalCards: number = 1) {
  // Use shallowRef for three.js objects to avoid deep reactivity overhead
  const cardRef = shallowRef<Mesh | null>(null);
  const hoverY = ref(0);
  const isHovered = ref(false);
  const targetHoverY = ref(0);
  const hoverTransitionSpeed = 0.15;

  // Access the card game store
  const cardGameStore = useCardGameStore();

  // Calculate normalized position for positioning (-1 to 1 range)
  const normalizedPosition = totalCards <= 1 ? 0 : (index / (totalCards - 1)) * 2 - 1;

  // Store animation loop stop function to properly clean up
  let stopAnimationLoop: (() => void) | null = null;

  function onPointerEnter() {
    isHovered.value = true;
    document.body.style.cursor = "pointer";
    targetHoverY.value = 0.6;
  }

  function onPointerLeave() {
    isHovered.value = false;
    document.body.style.cursor = "default";
    targetHoverY.value = 0; // Target rest height
  }

  /**
   * Reset interaction state
   */
  function resetInteractionState() {
    isHovered.value = false;
    targetHoverY.value = 0;
    hoverY.value = 0;
    document.body.style.cursor = "default";

    // Reset mesh position and rotation if available
    if (cardRef.value) {
      cardRef.value.position.z = 0;
      cardRef.value.rotation.z = 0;
    }
  }

  // Watch for game reset
  watch(
    () => cardGameStore.resetCounter,
    () => {
      resetInteractionState();
    }
  );

  // Setup card animations
  function setupCardAnimations() {
    nextTick(() => {
      // Store stop function to clean up animation loop
      const { onLoop } = useRenderLoop();
      stopAnimationLoop = () => {
        // Nothing to do here for now - TresJS doesn't provide a stop method
        // This is a placeholder for future cleanup if the API changes
      };

      onLoop(({ elapsed, delta }) => {
        if (!cardRef.value) return;

        // Subtle floating base effect
        const baseFloatAmount = 0.02;
        const floatEffect = Math.sin(elapsed * 0.2) * baseFloatAmount;

        // Smooth hover transition
        hoverY.value += (targetHoverY.value + floatEffect - hoverY.value) * hoverTransitionSpeed;

        if (isHovered.value) {
          // Emphasized hover effect - only animate Z position
          cardRef.value.position.z = Math.sin(elapsed * 0.5) * 0.05 + 0.3;

          // Subtle wobble only on Z axis - won't conflict with Group rotation
          cardRef.value.rotation.z = Math.sin(elapsed * 2) * 0.03;
        } else {
          // Return to base position
          cardRef.value.position.z += (0 - cardRef.value.position.z) * 0.1;

          // Only reset Z rotation - X and Y are handled by the TresGroup
          cardRef.value.rotation.z += (0 - cardRef.value.rotation.z) * 0.1;
        }
      });
    });
  }

  onMounted(setupCardAnimations);

  // Properly clean up animation loop to prevent memory leaks
  onBeforeUnmount(() => {
    if (stopAnimationLoop) {
      stopAnimationLoop();
    }
  });

  return {
    cardRef,
    hoverY,
    isHovered,
    onPointerEnter,
    onPointerLeave,
    resetInteractionState,
    normalizedPosition, // Expose for other components that might need it
  };
}
