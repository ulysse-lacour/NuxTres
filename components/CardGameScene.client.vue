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
        :scale="wallCardScale"
        :index="index"
        :total-cards="cardGameStore.playedCards.length"
        :render-order="
          renderOrderSystem.calculateWallRenderOrder(index, cardGameStore.playedCards.length)
        "
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
        :render-order="
          renderOrderSystem.calculateHandRenderOrder(index, cardGameStore.availableCards.length)
        "
      />
    </TresGroup>
  </TresCanvas>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, reactive, shallowRef } from "vue";
  import type { Group, PerspectiveCamera } from "three";

  import { useCardGame } from "../composables/useCardGame";
  import { useCardPositioning } from "../composables/useCardPositioning";
  import { useRenderOrder } from "../composables/useRenderOrder";
  import { useViewport } from "../composables/useViewport";
  import { useWallLayout } from "../composables/useWallLayout";

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

  // Wall layout positioning
  const { getWallPosition, wallCardScale } = useWallLayout(viewportWidth);

  // Render order system for proper card stacking
  const renderOrderSystem = useRenderOrder();

  // Setup and event handling
  onMounted(() => {
    // Initial viewport calculation
    updateViewportSize();

    // Setup responsive behavior with debounced resizing
    let resizeTimeout: number | null = null;

    const handleResize = () => {
      if (resizeTimeout) {
        window.clearTimeout(resizeTimeout);
      }

      resizeTimeout = window.setTimeout(() => {
        updateViewportSize();
        console.log("Viewport updated:", viewportWidth.value);
        resizeTimeout = null;
      }, 100); // 100ms debounce
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function to be called on unmount
    onBeforeUnmount(() => {
      if (resizeTimeout) {
        window.clearTimeout(resizeTimeout);
      }
      window.removeEventListener("resize", handleResize);
    });
  });
</script>
