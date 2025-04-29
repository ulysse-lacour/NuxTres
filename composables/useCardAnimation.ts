/**
 * Composable for card animations including easing functions and animation logic
 */
import { computed, ref, watch } from "vue";
import type { Group } from "three";
import type { Ref } from "vue";

export function useCardAnimation(
  groupRef: Ref<Group | null>,
  cardId: number,
  emitPlay: (cardId: number) => void
) {
  // Animation state
  const animationState = ref<"idle" | "playing" | "completed">("idle");
  const animationProgress = ref(0);
  let animationStartTime = 0;
  let animationId: number | null = null;

  // Animation positions
  let startPosition: [number, number, number] = [0, 0, 0];
  let targetPosition: [number, number, number] = [0, 0, 0];

  // Click handler debounce
  let lastClickTime = 0;
  const clickDebounceTime = 500; // ms
  const animationDuration = 800; // Animation duration in ms

  // Access the card game store
  const cardGameStore = useCardGameStore();

  // Computed properties for interaction handling
  const isAnimationPlaying = computed(() => animationState.value !== "idle");
  const isClickable = computed(
    () => animationState.value === "idle" && Date.now() - lastClickTime > clickDebounceTime
  );

  /**
   * Reset animation state when game is reset
   */
  function resetAnimationState() {
    // Cancel any ongoing animation
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    // Reset animation state
    animationState.value = "idle";
    animationProgress.value = 0;

    // Reset position and rotation if group exists
    if (groupRef.value) {
      const group = groupRef.value;

      // Reset scale to original
      group.scale.set(1, 1, 1);
    }
  }

  // Watch for game reset
  watch(
    () => cardGameStore.resetCounter,
    () => {
      resetAnimationState();
    }
  );

  /**
   * Start card animation to target position
   * @param wallPosition - Wall position coordinates
   * @param wallOffset - Offset within the wall
   */
  const startAnimation = (
    wallPosition: [number, number, number],
    wallOffset: [number, number, number]
  ) => {
    if (isAnimationPlaying.value) {
      return;
    }

    // Debounce clicks
    const now = Date.now();
    if (now - lastClickTime < clickDebounceTime) return;
    lastClickTime = now;

    // Only allow if not already animating
    if (animationState.value !== "idle") {
      return;
    }

    // Store initial position
    startPosition = [
      groupRef.value?.position.x || 0,
      groupRef.value?.position.y || 0,
      groupRef.value?.position.z || 0,
    ];

    // Apply Z offset based on the number of cards already on the wall
    const zOffset = cardGameStore.playedCards.length * 0.01;

    // Calculate target position with current wallPosition and wallOffset values
    targetPosition = [
      wallPosition[0] + wallOffset[0],
      wallPosition[1] + wallOffset[1],
      wallPosition[2] + wallOffset[2] + zOffset,
    ];

    // Start the animation
    animationState.value = "playing";
    animationProgress.value = 0;
    animationStartTime = performance.now();

    // Register animation in the store
    cardGameStore.startCardAnimation(
      cardId,
      [...startPosition],
      [...targetPosition],
      animationDuration
    );

    // Begin animation loop
    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(animateCard);

    // Emit the play event
    emitPlay(cardId);
  };

  /**
   * Animation function using requestAnimationFrame
   */
  const animateCard = (timestamp: number) => {
    if (animationState.value !== "playing") return;

    // Calculate progress
    const elapsed = timestamp - animationStartTime;
    animationProgress.value = Math.min(elapsed / animationDuration, 1);

    // Apply easing
    const easedProgress = easeOutBack(animationProgress.value);

    // Use regular easeInOut for z-axis to prevent cards going beneath others
    const zAxisProgress = easeInOut(animationProgress.value);

    // Calculate current position with linear interpolation
    const newX = lerp(startPosition[0], targetPosition[0], easedProgress);
    const newY = lerp(startPosition[1], targetPosition[1], easedProgress);
    // Use different easing for z-axis to prevent going beneath cards
    const newZ = lerp(startPosition[2], targetPosition[2], zAxisProgress);

    // Apply position
    const group = groupRef.value;
    if (group) {
      group.position.x = newX;
      group.position.y = newY;
      group.position.z = newZ;
    }

    // Apply rotation - straighten the card during animation
    const rotationProgress = Math.min(animationProgress.value * 2, 1);
    if (group) {
      group.rotation.x = lerp(group.rotation.x, 0, rotationProgress);
      group.rotation.y = lerp(group.rotation.y, 0, rotationProgress);
    }

    // Apply scaling - make the card smaller during animation
    const scale = lerp(1, 0.7, easedProgress);
    if (group) {
      group.scale.set(scale, scale, scale);
    }

    // Continue animation if not complete
    if (animationProgress.value < 1) {
      animationId = requestAnimationFrame(animateCard);
    } else {
      // Animation complete
      animationState.value = "completed";

      if (group) {
        // Ensure final position is EXACTLY the target position
        group.position.x = targetPosition[0];
        group.position.y = targetPosition[1];
        group.position.z = targetPosition[2];

        // Reset rotation and scale
        group.rotation.x = 0;
        group.rotation.y = 0;
        group.scale.set(0.7, 0.7, 0.7);
      }

      // Mark as complete in store
      cardGameStore.completeCardAnimation(cardId);
    }
  };

  /**
   * Check if a card has an ongoing animation from the store and restore it
   */
  const checkStoredAnimation = () => {
    const storedAnimation = cardGameStore.getCardAnimationState(cardId);
    if (storedAnimation && storedAnimation.animationState === "playing") {
      // Restore animation state
      animationState.value = "playing";

      // Set position IMMEDIATELY to current animation progress position if group exists
      if (groupRef.value && storedAnimation) {
        const group = groupRef.value;
        const currentTime = Date.now();
        const elapsed = currentTime - storedAnimation.startTime;
        const progress = Math.min(elapsed / storedAnimation.animationDuration, 1);

        // If animation is nearly complete, just jump to end position
        if (progress > 0.95) {
          group.position.x = storedAnimation.targetPosition[0];
          group.position.y = storedAnimation.targetPosition[1];
          group.position.z = storedAnimation.targetPosition[2];
          group.rotation.x = 0;
          group.rotation.y = 0;
          group.rotation.z = 0;

          // Mark as complete
          animationState.value = "completed";
          cardGameStore.completeCardAnimation(cardId);
        } else {
          // Start the animation again for a smooth continuation
          if (animationId === null) {
            animationId = requestAnimationFrame(animateCard);
          }
        }
      }
    }
  };

  /**
   * Clean up resources and cancel animations
   */
  const cleanup = () => {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };

  /**
   * Linear interpolation helper
   */
  function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * Simple easeInOut easing function
   */
  function easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  /**
   * EaseOutBack easing function with a slight overshoot
   */
  function easeOutBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  return {
    animationState,
    startAnimation,
    checkStoredAnimation,
    resetAnimationState,
    cleanup,
    isAnimationPlaying,
    isClickable,
  };
}
