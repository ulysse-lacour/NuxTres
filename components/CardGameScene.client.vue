<template>
  <TresCanvas v-bind="gl" window-size>
    <!-- Camera positioned slightly higher to better view upward-facing cards -->
    <TresPerspectiveCamera ref="cameraRef" :position="[0, 1, 12]" :look-at="[0, -1, 0]" :fov="50" />

    <!-- Enhanced lighting -->
    <TresAmbientLight :intensity="1.2" />
    <TresDirectionalLight :position="[0, 0, 10]" :intensity="1.5" :cast-shadow="true" />
    <TresDirectionalLight :position="[10, 5, 5]" :intensity="0.8" color="#ffffff" />
    <TresDirectionalLight :position="[-10, -5, 5]" :intensity="0.6" color="#6b93d6" />

    <!-- Floor/ground -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, -6, 0]" receiveShadow>
      <TresPlaneGeometry :args="[50, 50]" />
      <TresMeshStandardMaterial color="#111827" />
    </TresMesh>

    <!-- Card Wall - where played cards go -->
    <TresGroup ref="wallGroupRef" :position="[0, 2, 0]">
      <!-- Wall background -->
      <TresMesh :position="[0, 0, -0.6]" :scale="[20, 10, 0.5]">
        <TresBoxGeometry :args="[1, 1, 0.1]" />
        <TresMeshStandardMaterial :color="'#2c3e50'" :metalness="0.2" :roughness="0.8" />
      </TresMesh>

      <!-- Played cards on wall -->
      <Card
        v-for="(card, index) in cardGameStore.playedCards"
        :key="card.id"
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

    <!-- Available Cards - straight line at bottom with slight upward tilt -->
    <TresGroup ref="cardsGroupRef" :position="[0, -3.5, 4]">
      <Card
        v-for="(card, index) in cardGameStore.availableCards"
        :key="card.id"
        :position="getCardPosition(index, cardGameStore.availableCards.length)"
        :rotation="getCardRotation(index, cardGameStore.availableCards.length)"
        :color="card.color"
        :name="card.name"
        :card-id="card.id"
        :scale="[0.75, 0.75, 0.75]"
        :index="index"
        :total-cards="cardGameStore.availableCards.length"
        @card-clicked="handleCardClick"
      />
    </TresGroup>
  </TresCanvas>
</template>

<script setup lang="ts">
  import type { Group, PerspectiveCamera } from "three";

  import { useCardGame } from "../composables/useCardGame";
  import { useCardPositioning } from "../composables/useCardPositioning";
  import { useViewport } from "../composables/useViewport";

  interface GL {
    clearColor: string;
    powerPreference: "high-performance" | "low-power" | "default";
  }

  // Setup card game composable
  const { cardGameStore, handleCardClick } = useCardGame();

  // Refs
  const gl = reactive<GL>({
    clearColor: "#090c14",
    powerPreference: "high-performance",
  });

  const cardsGroupRef = shallowRef<Group | null>(null);
  const wallGroupRef = shallowRef<Group | null>(null);
  const cameraRef = shallowRef<PerspectiveCamera | null>(null);

  // Setup viewport composable
  const { viewportWidth } = useViewport(40, 5);

  // Setup card positioning
  const { getCardPosition, getCardRotation } = useCardPositioning(viewportWidth);

  // Position for cards on the wall
  function getWallPosition(index: number, totalCards: number): [number, number, number] {
    if (totalCards === 0) return [0, 0, 0];

    // Maximum cards per row
    const cardsPerRow = 4;

    // Calculate row and column
    const row = Math.floor(index / cardsPerRow);
    const col = index % cardsPerRow;

    // Calculate position
    const x = (col - (cardsPerRow - 1) / 2) * 3;
    const y = -row * 3.5;
    const z = 0;

    return [x, y, z];
  }

  // Debug to console
  onMounted(() => {
    console.log("Available cards:", cardGameStore.availableCards);
    console.log("Played cards:", cardGameStore.playedCards);
  });
</script>
