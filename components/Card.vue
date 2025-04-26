<template>
  <TresGroup
    :position="position"
    :scale="scale || [1, 1, 1]"
    :rotation="isHovered && !isPlayed ? hoverRotation : rotation || [0, 0, 0]"
  >
    <TresMesh
      ref="cardRef"
      :position="[0, isPlayed ? 0 : hoverY, isHovered ? 0.2 : 0]"
      @click="handleClick"
      @pointer-enter="onPointerEnter"
      @pointer-leave="onPointerLeave"
      :render-order="renderOrder"
    >
      <!-- Card base with thinner border for better visibility -->
      <TresBoxGeometry :args="[2.1, 3.1, 0.05]" />
      <TresMeshStandardMaterial color="white" :metalness="0.6" :roughness="0.3" />

      <!-- Card face with text texture -->
      <TresMesh :position="[0, 0, 0.06]">
        <TresBoxGeometry :args="[2, 3, 0.1]" />
        <TresMeshStandardMaterial
          :map="cardTexture"
          :color="color"
          :metalness="isPlayed ? 0.6 : isHovered ? 0.5 : 0.3"
          :roughness="isPlayed ? 0.2 : isHovered ? 0.4 : 0.6"
          :emissive="color"
          :emissiveIntensity="isHovered ? 0.2 : 0.05"
        />
      </TresMesh>

      <!-- Spotlight for hover effect - only enabled when needed -->
      <TresSpotLight
        v-if="isHovered && !isPlayed"
        :intensity="3"
        :position="[0, 2, 1]"
        :angle="0.5"
        :penumbra="0.7"
        :color="color"
        :distance="8"
        :decay="1.5"
      />

      <!-- Subtle glow for played cards -->
      <TresPointLight
        v-if="isPlayed"
        :intensity="1"
        :position="[0, 0, 0.7]"
        :distance="4"
        :color="color"
      />
    </TresMesh>
  </TresGroup>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref } from "vue";
  import type { Mesh } from "three";

  import { useCardInteraction } from "../composables/useCardInteraction";
  import { useCardTexture } from "../composables/useCardTexture";
  import { useTextColor } from "../composables/useTextColor";

  /**
   * Card component props
   */
  const props = defineProps<{
    position: [number, number, number];
    color: string;
    name: string;
    cardId?: number;
    isPlayed?: boolean;
    scale?: [number, number, number];
    rotation?: [number, number, number];
    index?: number;
    totalCards?: number;
    renderOrder?: number;
  }>();

  /**
   * Card events
   */
  const emit = defineEmits<{
    (e: "card-clicked", cardId: number): void;
  }>();

  // Use card interaction composable for hover effects
  const { cardRef, hoverY, isHovered, onPointerEnter, onPointerLeave } = useCardInteraction(
    props.isPlayed,
    props.index || 0,
    props.totalCards || 1
  );

  /**
   * Calculate hover rotation - tilts up and rotates toward center when hovered
   */
  const hoverRotation = computed<[number, number, number]>(() => {
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
    if (cardRef.value && props.renderOrder !== undefined) {
      cardRef.value.renderOrder = props.renderOrder;
    }
  });

  // Clean up resources when component is unmounted
  onBeforeUnmount(() => {
    disposeTexture();
  });

  /**
   * Handle card click events
   */
  function handleClick() {
    if (props.cardId !== undefined && !props.isPlayed) {
      emit("card-clicked", props.cardId);
    }
  }
</script>
