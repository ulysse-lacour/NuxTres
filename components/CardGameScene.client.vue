<template>
  <TresCanvas v-bind="gl" window-size>
    <!-- Camera positioned for optimal card viewing -->
    <TresPerspectiveCamera ref="cameraRef" :position="[0, 1, 12]" :look-at="[0, -1, 0]" :fov="50" />

    <!-- Scene lighting -->
    <TresAmbientLight :intensity="1.2" />
    <TresDirectionalLight :position="[0, 0, 10]" :intensity="1.5" :cast-shadow="true" />
    <TresDirectionalLight :position="[10, 5, 5]" :intensity="0.8" color="#ffffff" />
    <TresDirectionalLight :position="[-10, -5, 5]" :intensity="0.6" color="#6b93d6" />

    <!-- Environment floor -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, -6, 0]" receiveShadow>
      <TresPlaneGeometry :args="[50, 50]" />
      <TresMeshStandardMaterial color="#111827" />
    </TresMesh>

    <!-- Wall area for played cards -->
    <TresGroup ref="wallGroupRef" :position="[0, 2, 0]">
      <!-- Wall background with subtle depth -->
      <TresMesh :position="[0, 0, -0.6]" :scale="[20, 10, 0.5]">
        <TresBoxGeometry :args="[1, 1, 0.1]" />
        <TresMeshStandardMaterial :color="'#2c3e50'" :metalness="0.2" :roughness="0.8" />
      </TresMesh>

      <!-- Played cards display -->
      <Card
        v-for="(card, index) in cardGameStore.playedCards"
        :key="`played-${card.id}`"
        :position="getWallPosition(index, cardGameStore.playedCards.length)"
        :color="card.color"
        :name="card.name"
        :card-id="card.id"
        :is-played="true"
        :scale="[0.9, 0.9, 0.9]"
        :index="index"
        :total-cards="cardGameStore.playedCards.length"
      />
    </TresGroup>

    <!-- Available cards hand area -->
    <TresGroup ref="cardsGroupRef" :position="[0, -3.5, 4]">
      <Card
        v-for="(card, index) in cardGameStore.availableCards"
        :key="`available-${card.id}`"
        :position="getCardPosition(index, cardGameStore.availableCards.length)"
        :rotation="getCardRotation(index, cardGameStore.availableCards.length)"
        :color="card.color"
        :name="card.name"
        :card-id="card.id"
        :scale="[0.85, 0.85, 0.85]"
        :index="index"
        :total-cards="cardGameStore.availableCards.length"
        @card-clicked="handleCardClick"
        :render-order="calculateRenderOrder(index, cardGameStore.availableCards.length)"
      />
    </TresGroup>
  </TresCanvas>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, reactive, shallowRef } from "vue";
  import type { Group, PerspectiveCamera } from "three";

  import { useCardGame } from "../composables/useCardGame";
  import { useCardPositioning } from "../composables/useCardPositioning";
  import { useViewport } from "../composables/useViewport";

  /**
   * WebGL rendering configuration
   */
  interface GL {
    clearColor: string;
    powerPreference: "high-performance" | "low-power" | "default";
  }

  // Game state and card handling
  const { cardGameStore, handleCardClick } = useCardGame();

  // WebGL settings for optimal performance
  const gl = reactive<GL>({
    clearColor: "#090c14", // Dark blue background
    powerPreference: "high-performance",
  });

  // Scene refs using shallowRef for performance (avoid deep reactivity overhead)
  const cardsGroupRef = shallowRef<Group | null>(null);
  const wallGroupRef = shallowRef<Group | null>(null);
  const cameraRef = shallowRef<PerspectiveCamera | null>(null);

  // Responsive viewport calculations
  const { viewportWidth, updateViewportSize } = useViewport(50, 8);

  // Card positioning system
  const { getCardPosition, getCardRotation } = useCardPositioning(viewportWidth);

  /**
   * Calculate position for a card on the wall display
   * Organizes cards in a grid pattern
   *
   * @param index - Card index
   * @param totalCards - Total cards on wall
   * @returns [x, y, z] position coordinates
   */
  function getWallPosition(index: number, totalCards: number): [number, number, number] {
    if (totalCards === 0) return [0, 0, 0];

    // Maximum cards per row for grid layout
    const cardsPerRow = 4;

    // Calculate grid position
    const row = Math.floor(index / cardsPerRow);
    const col = index % cardsPerRow;

    // Position in grid with proper spacing
    const x = (col - (cardsPerRow - 1) / 2) * 3;
    const y = -row * 3.5;
    const z = 0;

    return [x, y, z];
  }

  // Setup and event handling
  onMounted(() => {
    // Initial viewport calculation
    updateViewportSize();

    // Setup responsive behavior
    const handleResize = () => {
      updateViewportSize();
      console.log("Viewport updated:", viewportWidth.value);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function to be called on unmount
    onBeforeUnmount(() => {
      window.removeEventListener("resize", handleResize);
    });
  });

  /**
   * Calculate render order for cards to create a natural hand-like stacking effect
   * Cards at the edges should render on top of cards in the middle
   *
   * @param index - Card index
   * @param totalCards - Total number of cards
   * @returns Render order (higher values render on top)
   */
  function calculateRenderOrder(index: number, totalCards: number): number {
    // Find center index
    const centerIndex = (totalCards - 1) / 2;

    // Calculate distance from center (0 = center, higher values = closer to edges)
    const distanceFromCenter = Math.abs(index - centerIndex);

    // Convert to a render order where higher values (edges) render on top
    // Scale to a high base value (1000) to ensure proper stacking
    return 1000 + Math.floor(distanceFromCenter * 10);
  }
</script>
