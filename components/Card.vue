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
  import { CanvasTexture } from "three";
  import { computed, onMounted, ref, watch } from "vue";
  import type { Mesh } from "three";

  import { useCardInteraction } from "../composables/useCardInteraction";
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

  // Create canvas texture for card with text
  const cardTexture = ref<CanvasTexture | null>(null);

  /**
   * Create a texture with the card name rendered as 2D text
   */
  function createCardTexture() {
    // Create a canvas element
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 768;

    // Get 2D context for drawing
    const context = canvas.getContext("2d");
    if (!context) return null;

    try {
      // Fill with card color
      context.fillStyle = props.color;
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Add a subtle gradient overlay
      const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.2)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Draw decorative border
      context.strokeStyle = "rgba(255, 255, 255, 0.4)";
      context.lineWidth = 10;
      context.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Add inner border for depth
      context.strokeStyle = "rgba(0, 0, 0, 0.2)";
      context.lineWidth = 4;
      context.strokeRect(26, 26, canvas.width - 52, canvas.height - 52);

      // Calculate appropriate font size based on text length
      const fontSize = Math.min(120, 500 / Math.max(1, props.name.length));
      context.font = `bold ${fontSize}px Arial, sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";

      // Add text shadow for better visibility
      context.shadowColor = "rgba(0, 0, 0, 0.6)";
      context.shadowBlur = 12;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;

      // Draw card text
      context.fillStyle = textColor.value || "#ffffff";
      context.fillText(props.name, canvas.width / 2, canvas.height / 2);

      // Create Three.js texture from canvas
      const texture = new CanvasTexture(canvas);
      texture.needsUpdate = true;

      return texture;
    } catch (error) {
      console.error("Error creating card texture:", error);
      return null;
    }
  }

  // Initialize texture right away to avoid undefined issues
  cardTexture.value = createCardTexture();

  // Update texture when card name or color changes
  watch(
    () => [props.name, props.color, textColor.value],
    () => {
      if (typeof window !== "undefined") {
        // Make sure we're in browser environment
        cardTexture.value = createCardTexture();
      }
    },
    { immediate: false }
  );

  // Set render order and initialize texture
  onMounted(() => {
    // Set proper render order
    if (cardRef.value && props.renderOrder !== undefined) {
      cardRef.value.renderOrder = props.renderOrder;
    }

    // Create the texture on mount if not already done
    if (!cardTexture.value) {
      cardTexture.value = createCardTexture();
    }
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
