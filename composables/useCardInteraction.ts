import { useRenderLoop } from "@tresjs/core";
import { nextTick, onMounted, ref } from "vue";
import type { Mesh } from "three";
import type { Ref } from "vue";

export function useCardInteraction(isPlayed: boolean = false) {
  const { onLoop } = useRenderLoop();
  const cardRef = ref<Mesh | null>(null);
  const hoverY = ref(0);
  const isHovered = ref(false);
  const targetHoverY = ref(0);
  const hoverTransitionSpeed = isPlayed ? 0.05 : 0.15; // Slower for played cards

  function onPointerEnter() {
    if (!isPlayed) {
      isHovered.value = true;
      document.body.style.cursor = "pointer";
      targetHoverY.value = 0.6; // Higher hover for hand layout
    } else {
      // Still show hover state for played cards, but more subtle
      isHovered.value = true;
      document.body.style.cursor = "default"; // No pointer for played cards
    }
  }

  function onPointerLeave() {
    isHovered.value = false;
    document.body.style.cursor = "default";
    targetHoverY.value = 0; // Target rest height
  }

  // Setup card animations
  function setupCardAnimations() {
    nextTick(() => {
      onLoop(({ elapsed, delta }) => {
        if (!cardRef.value) return;

        // Different animations for played vs available cards
        if (isPlayed) {
          // Played cards on the wall - gentle floating and rotation
          const floatAmount = 0.1;
          cardRef.value.position.y = Math.sin(elapsed * 0.3) * floatAmount;

          // Gentle rotation for played cards
          cardRef.value.rotation.y = Math.sin(elapsed * 0.2) * 0.05;

          // Slight tilt when hovered
          if (isHovered.value) {
            cardRef.value.rotation.z = Math.sin(elapsed * 0.5) * 0.02;
            cardRef.value.position.z = 0.1; // Come forward slightly
          } else {
            // Return to normal
            cardRef.value.rotation.z += (0 - cardRef.value.rotation.z) * 0.05;
            cardRef.value.position.z += (0 - cardRef.value.position.z) * 0.05;
          }
        } else {
          // Available cards in hand - more dynamic animations

          // Gentle floating base effect
          const baseFloatAmount = 0.02;
          const floatEffect = Math.sin(elapsed * 0.2) * baseFloatAmount;

          // Smooth hover transition
          hoverY.value += (targetHoverY.value + floatEffect - hoverY.value) * hoverTransitionSpeed;

          if (isHovered.value) {
            // Emphasized hover effect for available cards
            cardRef.value.position.z = Math.sin(elapsed * 0.5) * 0.05 + 0.3;
            cardRef.value.rotation.z = Math.sin(elapsed * 2) * 0.03;

            // When hovered, card straightens to face player
            cardRef.value.rotation.x += (0.15 - cardRef.value.rotation.x) * 0.1;
            cardRef.value.rotation.y += (0 - cardRef.value.rotation.y) * 0.05;
          } else {
            // Return to base position
            cardRef.value.position.z += (0 - cardRef.value.position.z) * 0.1;

            // Keep original fan rotation when not hovered
            cardRef.value.rotation.z += (0 - cardRef.value.rotation.z) * 0.1;
          }
        }
      });
    });
  }

  onMounted(setupCardAnimations);

  return {
    cardRef,
    hoverY,
    isHovered,
    onPointerEnter,
    onPointerLeave,
  };
}
