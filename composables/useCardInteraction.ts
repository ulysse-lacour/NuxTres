import { useCardGameStore } from "@/stores/cardGame";
import { useRenderLoop } from "@tresjs/core";
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import type * as THREE from "three";
import type { Mesh } from "three";

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
  const _hoverTransitionSpeed = 0.15;

  // Z position for hover effect
  const hoverZ = ref(0);
  const targetHoverZ = ref(0);

  // Access the card game store
  const cardGameStore = useCardGameStore();

  // Get GSAP for animations
  const { $gsap } = useNuxtApp();

  // Calculate normalized position for positioning (-1 to 1 range)
  const normalizedPosition = totalCards <= 1 ? 0 : (index / (totalCards - 1)) * 2 - 1;

  // Animation state tracking
  let _isAnimating = false;
  const _floatingTween: any = null;
  const _rotationTween: any = null;
  const _wobbleTween: any = null;
  const _cardTweens: any[] = [];
  const _manualAnimationIds: number[] = [];
  const _gsapTimelines: any[] = [];

  // Animation tracking
  const activeAnimations: any[] = [];
  const activeTimelines: any[] = [];

  // Track animations for cleanup
  function trackAnimation(animation: any) {
    activeAnimations.push(animation);
  }

  // Track timelines for cleanup
  function trackTimeline(timeline: any) {
    activeTimelines.push(timeline);
  }

  // Kill all running animations
  function killAllAnimations() {
    // Kill individual animations
    activeAnimations.forEach((anim) => {
      if (anim && anim.kill) anim.kill();
    });

    // Kill timelines
    activeTimelines.forEach((timeline) => {
      if (timeline && timeline.kill) timeline.kill();
    });

    // Clear the arrays
    activeAnimations.length = 0;
    activeTimelines.length = 0;

    // Reset card rotation if it exists
    if (cardRef.value) {
      cardRef.value.rotation.z = 0;
    }
  }

  const onPointerEnter = (card: any) => {
    if (isHovered.value) return;

    // Set cursor and mark as hovered
    document.body.style.cursor = "pointer";
    isHovered.value = true;
    cardRef.value = card;

    // Kill any previous animations before starting new ones
    killAllAnimations();

    // Get the material for opacity animations
    const material = card.material as THREE.Material;

    // Create a new GSAP timeline for the enter animation
    const tl = $gsap.timeline();
    trackTimeline(tl);

    // Create a smoother, more cohesive timeline
    // 1. First slightly reduce opacity to mask the position transition
    tl.to(material, {
      opacity: 0.9,
      duration: 0.2,
      ease: "power2.in",
    });

    // 2. Animate position with smoother easing
    tl.to(
      card.position,
      {
        y: 0.75,
        z: 0.5,
        duration: 0.5,
        ease: "back.out(1.5)",
        onUpdate: () => {
          hoverY.value = card.position.y;
          hoverZ.value = card.position.z;
        },
      },
      "-=0.15" // Slightly overlap for smoother transition
    );

    // 3. Restore opacity with smooth ease out
    tl.to(
      material,
      {
        opacity: 1,
        duration: 0.25,
        ease: "power2.out",
      },
      "-=0.3" // More overlap for smoother transition
    );

    // 4. Rotate toward center (negative normalizedPosition) with more fluid easing
    // This will make cards on the left rotate right (positive y) and cards on the right rotate left (negative y)
    tl.to(
      card.rotation,
      {
        x: -0.1,
        y: -normalizedPosition * 0.15, // Use negative normalizedPosition to rotate toward center
        duration: 0.4,
        ease: "power2.out",
      },
      "-=0.4" // Fully overlap with previous animations
    );
  };

  function _startFloatingAnimation(card: Mesh) {
    // Create a timeline for floating effect
    const floatTimeline = $gsap.timeline({
      repeat: -1,
      yoyo: true,
    });

    // Add subtle up and down floating motion
    floatTimeline.to(card.position, {
      y: hoverY.value + 0.15,
      duration: 1.5,
      ease: "sine.inOut",
    });

    // Create a timeline for wobble effect
    const wobbleTimeline = $gsap.timeline({
      repeat: -1,
      yoyo: true,
    });

    // Add subtle rotation wobble
    wobbleTimeline.to(card.rotation, {
      z: 0.05,
      duration: 2.2,
      ease: "sine.inOut",
    });

    // Track timelines
    trackTimeline(floatTimeline);
    trackTimeline(wobbleTimeline);
  }

  function onPointerLeave() {
    if (!isHovered.value) return; // Not hovering, skip

    // Reset cursor
    document.body.style.cursor = "default";

    // Clear hover state
    isHovered.value = false;

    // Kill all animations
    killAllAnimations();

    // Get card reference
    const card = cardRef.value;
    if (!card) return;

    const { $gsap } = useNuxtApp();

    // Create a unified timeline for leave animation
    const tl = $gsap.timeline({
      onComplete: () => {
        // Ensure values are reset after animation
        hoverY.value = 0;
        hoverZ.value = 0;
      },
    });
    trackTimeline(tl);

    // More elegant leave animation sequence - faster version

    // 1. Slightly fade for transition readability - reduced duration
    if (card.material) {
      const material = Array.isArray(card.material) ? card.material[0] : card.material;
      if (material && material.opacity !== undefined) {
        tl.to(material, {
          opacity: 0.95,
          duration: 0.1, // Reduced from 0.15
          ease: "sine.in",
        });
      }
    }

    // 2. Quicker movement
    tl.to(
      card.position,
      {
        y: 0,
        z: 0,
        duration: 0.35, // Reduced from 0.6
        ease: "power2.out", // Changed from power3.out for faster feel
      },
      "-=0.08" // More immediate start
    );

    tl.to(
      card.rotation,
      {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.3, // Reduced from 0.5
        ease: "back.out(1)", // Less bounce for faster return
      },
      "-=0.34" // Start almost simultaneously with position
    );

    // 3. Quick opacity restoration
    if (card.material) {
      const material = Array.isArray(card.material) ? card.material[0] : card.material;
      if (material && material.opacity !== undefined) {
        tl.to(
          material,
          {
            opacity: 1,
            duration: 0.15, // Reduced from 0.2
            ease: "power1.out",
          },
          "-=0.2" // More overlap for faster completion
        );
      }
    }
  }

  /**
   * Reset interaction state
   */
  function resetInteractionState() {
    isHovered.value = false;
    targetHoverY.value = 0;
    hoverY.value = 0;
    targetHoverZ.value = 0;
    hoverZ.value = 0;
    document.body.style.cursor = "default";

    // Kill all animations
    killAllAnimations();

    // Reset mesh position and rotation if available
    if (cardRef.value) {
      // Reset position
      cardRef.value.position.y = 0;
      cardRef.value.position.z = 0;

      // Reset all rotation axes (x, y, and z)
      cardRef.value.rotation.x = 0;
      cardRef.value.rotation.y = 0;
      cardRef.value.rotation.z = 0;
    }

    _isAnimating = false;
  }

  // Watch for game reset
  watch(
    () => cardGameStore.resetCounter,
    () => {
      resetInteractionState();
    }
  );

  // Setup card animations more efficiently
  function setupCardAnimations() {
    nextTick(() => {
      const { onLoop } = useRenderLoop();

      onLoop(({ elapsed: _elapsed, delta: _delta }) => {
        if (!cardRef.value || isHovered.value) return; // Skip loop when card is being hovered (GSAP handles it)

        // Only run animation if needed for non-hover states
        if (
          !isHovered.value &&
          (hoverY.value !== 0 || hoverZ.value !== 0 || cardRef.value.rotation.z !== 0)
        ) {
          // Only apply subtle wobble in the render loop
          if (!isHovered.value) {
            // Only reset Z rotation - X and Y are handled by the TresGroup
            cardRef.value.rotation.z += (0 - cardRef.value.rotation.z) * 0.1;
          }
        }
      });
    });
  }

  onMounted(setupCardAnimations);

  // Clean up on unmount
  onBeforeUnmount(() => {
    killAllAnimations();
  });

  return {
    cardRef,
    hoverY,
    hoverZ,
    isHovered,
    onPointerEnter,
    onPointerLeave,
    resetInteractionState,
    normalizedPosition, // Expose for other components that might need it
  };
}
