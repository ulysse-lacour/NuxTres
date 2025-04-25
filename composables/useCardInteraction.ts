import { useRenderLoop } from "@tresjs/core";
import { nextTick, onMounted, ref } from "vue";
import type { Mesh } from "three";
import type { Ref } from "vue";

export function useCardInteraction(
  isPlayed: boolean = false,
  index: number = 0,
  totalCards: number = 1
) {
  const { onLoop } = useRenderLoop();
  const cardRef = ref<Mesh | null>(null);
  const hoverY = ref(0);
  const isHovered = ref(false);
  const targetHoverY = ref(0);
  const targetRotationY = ref(0);
  const hoverTransitionSpeed = isPlayed ? 0.05 : 0.15; // Slower for played cards

  // Calculate if the card is on the left, right, or center
  // -1 is far left, 0 is center, 1 is far right
  const normalizedPosition = totalCards <= 1 ? 0 : (index / (totalCards - 1)) * 2 - 1;

  console.log(`Card ${index}/${totalCards} - position: ${normalizedPosition}`);

  function onPointerEnter() {
    if (!isPlayed) {
      isHovered.value = true;
      document.body.style.cursor = "pointer";
      targetHoverY.value = 0.6; // Higher hover for hand layout

      // Set target rotation - subtle center-facing effect
      targetRotationY.value = -normalizedPosition * 0.6; // Reduced rotation strength for subtler effect

      // Debug info
      console.log(
        `Hovering card ${index}, normalized pos: ${normalizedPosition}, rotation: ${targetRotationY.value}`
      );
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
    targetRotationY.value = 0; // Reset rotation
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
          // Available cards in hand - dynamic animations

          // Subtle floating base effect
          const baseFloatAmount = 0.02;
          const floatEffect = Math.sin(elapsed * 0.2) * baseFloatAmount;

          // Smooth hover transition
          hoverY.value += (targetHoverY.value + floatEffect - hoverY.value) * hoverTransitionSpeed;

          if (isHovered.value) {
            // Emphasized hover effect for available cards
            cardRef.value.position.z = Math.sin(elapsed * 0.5) * 0.05 + 0.3;
            cardRef.value.rotation.z = Math.sin(elapsed * 2) * 0.03;

            // When hovered, card straightens and faces player more directly
            // -0.15 is the base upward tilt from useCardPositioning
            cardRef.value.rotation.x = -0.3; // More dramatic upward tilt on hover

            // SMOOTHER TRANSITION: Interpolate toward target rotation for more natural feel
            // Use faster interpolation speed (0.3) for more responsive rotation
            cardRef.value.rotation.y += (targetRotationY.value - cardRef.value.rotation.y) * 0.3;
          } else {
            // Return to base position
            cardRef.value.position.z += (0 - cardRef.value.position.z) * 0.1;

            // IMPORTANT: Return to the exact upward tilt value defined in useCardPositioning
            cardRef.value.rotation.x += (-0.15 - cardRef.value.rotation.x) * 0.1;
            cardRef.value.rotation.y += (0 - cardRef.value.rotation.y) * 0.1;
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
