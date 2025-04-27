<template>
  <TresGroup
    ref="groupRef"
    :position="position"
    :scale="scale || [1, 1, 1]"
    :rotation="isHovered && animationState === 'idle' ? hoverRotation : rotation || [0, 0, 0]"
  >
    <TresMesh
      ref="cardRef"
      :position="[0, hoverY, isHovered && animationState === 'idle' ? 0.3 : 0]"
      @pointer-enter="handlePointerEnter"
      @pointer-leave="handlePointerLeave"
      @click="handleClick"
      :render-order="renderOrder"
    >
      <!-- Card base with thinner border for better visibility -->
      <TresBoxGeometry :args="[2.1, 3.1, 0.05]" />
      <TresMeshStandardMaterial
        :color="animationState === 'playing' ? '#ff0000' : 'white'"
        :metalness="0.6"
        :roughness="0.3"
        :shadow="true"
      />

      <!-- Card face with text texture -->
      <TresMesh :position="[0, 0, 0.06]">
        <TresBoxGeometry :args="[2, 3, 0.1]" />
        <TresMeshStandardMaterial
          :map="cardTexture"
          :color="color"
          :metalness="isHovered ? 0.5 : 0.3"
          :roughness="isHovered ? 0.4 : 0.6"
          :emissive="animationState === 'playing' ? color : '#000000'"
          :emissiveIntensity="animationState === 'playing' ? 2 : 0"
        />
      </TresMesh>
    </TresMesh>
  </TresGroup>
</template>

<script setup lang="ts">
  import { useCardAnimation } from "@/composables/useCardAnimation";
  import { useCardInteraction } from "@/composables/useCardInteraction";
  import { useCardTexture } from "@/composables/useCardTexture";
  import { useTextColor } from "@/composables/useTextColor";
  import { computed, inject, onBeforeUnmount, onMounted, ref } from "vue";
  import type { Group } from "three";
  import type { Ref } from "vue";

  /**
   * Card component props
   */
  const props = withDefaults(
    defineProps<{
      position: [number, number, number];
      color: string;
      name: string;
      cardId: number;
      scale?: [number, number, number];
      rotation?: [number, number, number];
      index?: number;
      totalCards?: number;
      renderOrder?: number;
      readonly isPlayed?: boolean;
      readonly animationDuration?: number;
    }>(),
    {
      isPlayed: false,
      animationDuration: 750,
    }
  );

  // Define events
  const emit = defineEmits<{
    (e: "play", cardId: number): void;
  }>();

  // References for animation and interaction
  const groupRef = ref<Group | null>(null);

  // Get the wall position and card offset from parent component
  const wallPosition = inject<[number, number, number]>("wallPosition", [0, 0, -5]);
  const cardWallOffset = inject<Ref<[number, number, number]>>("cardWallOffset", ref([0, 0, 0]));

  console.log("CARD: Injected positions:", {
    wallPosition,
    cardWallOffset,
    cardWallOffsetValue: cardWallOffset.value,
  });

  // Use card animation composable
  const {
    animationState,
    startAnimation,
    checkStoredAnimation,
    cleanup: cleanupAnimation,
  } = useCardAnimation(groupRef, props.cardId, (cardId) => emit("play", cardId));

  // Use card interaction composable for hover effects
  const { cardRef, hoverY, isHovered, onPointerEnter, onPointerLeave } = useCardInteraction(
    props.index || 0,
    props.totalCards || 1
  );

  // Wrapper functions for hover events to check animation state
  function handlePointerEnter() {
    if (animationState.value === "idle") {
      onPointerEnter();
    }
  }

  function handlePointerLeave() {
    if (animationState.value === "idle") {
      onPointerLeave();
    }
  }

  // Wrapper function for click event
  function handleClick() {
    if (animationState.value === "idle" && !props.isPlayed) {
      // Start animation with current wall position and offset
      startAnimation(wallPosition, cardWallOffset.value);
    }
  }

  /**
   * Calculate hover rotation - tilts up and rotates toward center when hovered
   */
  const hoverRotation = computed<[number, number, number]>(() => {
    // Skip hover rotation during animation
    if (animationState.value === "playing") {
      return [0, 0, 0];
    }

    // Calculate normalized position to determine rotation direction
    // -1 is far left, 0 is center, 1 is far right
    const normalizedPosition =
      props.totalCards && props.totalCards > 1 && props.index !== undefined
        ? (props.index / (props.totalCards - 1)) * 2 - 1
        : 0;

    // Get base rotation from props
    const baseRotation = props.rotation || [0, 0, 0];

    return [
      -0.3, // More upward tilt
      -normalizedPosition * 0.5, // Rotate toward center
      baseRotation[2], // Keep original Z rotation
    ];
  });

  // Get appropriate text color based on card color
  const textColor = useTextColor(() => props.color);

  // Convert props to refs for reactive usage in the texture composable
  const nameRef = computed(() => props.name);
  const colorRef = computed(() => props.color);

  // Use the optimized card texture composable
  const { cardTexture, dispose: disposeTexture } = useCardTexture(nameRef, colorRef, textColor);

  // Set render order for proper z-ordering when mounted
  onMounted(() => {
    console.log(`Card ${props.cardId} mounted`);

    if (cardRef.value && props.renderOrder !== undefined) {
      cardRef.value.renderOrder = props.renderOrder;
    }

    // Check if this card has an ongoing animation from the store
    checkStoredAnimation();
  });

  // Clean up resources when component is unmounted
  onBeforeUnmount(() => {
    // Clean up animation resources
    cleanupAnimation();

    // Clean up texture resources
    disposeTexture();
  });
</script>
