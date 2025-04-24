<template>
  <TresCanvas v-bind="gl" window-size>
    <!-- Fixed camera position (user already moved it to z=30) -->
    <TresPerspectiveCamera ref="cameraRef" :position="[0, 1, 30]" :look-at="[0, 0, 0]" :fov="40" />

    <!-- Floor -->
    <!-- <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, -1.5, 0]" :receive-shadow="true">
      <TresPlaneGeometry :args="[50, 50]" />
      <TresMeshStandardMaterial color="#2c3e50" />
    </TresMesh> -->

    <!-- Environment -->
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[5, 5, 5]" :intensity="1" :cast-shadow="true" />

    <!-- Selected Card (Played Card) - in the background -->
    <TresGroup v-if="cardGameStore.selectedCard" :position="[0, 0.5, -15]">
      <Card
        :position="[0, 0, 0]"
        :color="cardGameStore.selectedCard.color"
        :name="cardGameStore.selectedCard.name"
        :scale="[1.5, 1.5, 1.5]"
        :is-played="true"
      />
    </TresGroup>

    <!-- Available Cards - extreme foreground at bottom of screen -->
    <TresGroup ref="cardsGroupRef" :position="[0, 0, 25]">
      <Card
        v-for="(card, index) in cardGameStore.availableCards"
        :key="card.id"
        :position="getCardPosition(index, cardGameStore.availableCards.length)"
        :color="card.color"
        :name="card.name"
        :card-id="card.id"
        :scale="[0.28, 0.28, 0.28]"
        @card-clicked="handleCardClick"
      />
    </TresGroup>
  </TresCanvas>
</template>

<script setup lang="ts">
  import type { Group, PerspectiveCamera } from "three";

  interface GL {
    clearColor: string;
    powerPreference: "high-performance" | "low-power" | "default";
  }

  // Store
  const cardGameStore = useCardGameStore();

  // Refs
  const gl = reactive<GL>({
    clearColor: "#1a1a2e",
    powerPreference: "high-performance",
  });

  const cardsGroupRef = shallowRef<Group | null>(null);
  const cameraRef = shallowRef<PerspectiveCamera | null>(null);

  // Card scaling - fixed scale for extreme foreground
  const cardScale = ref<[number, number, number]>([0.28, 0.28, 0.28]);
  const viewportWidth = ref(0);
  const minCardSpacing = 0.3; // Minimum spacing between cards

  // Update viewport width on window resize
  onMounted(() => {
    // Initial update
    updateViewportSize();

    // Listen for window resize
    window.addEventListener("resize", updateViewportSize);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", updateViewportSize);
  });

  // Calculate viewport width for cards at z=25
  function updateViewportSize() {
    // Calculate approximate viewport width at z=25
    const fov = 40; // camera FOV in degrees
    const distance = 5; // distance from camera to z=25 (30-25)
    const halfWidth = Math.tan((fov * Math.PI) / 180 / 2) * distance;
    viewportWidth.value = halfWidth * 2 * (window.innerWidth / window.innerHeight);
  }

  // Position cards to fill the entire viewport width
  function getCardPosition(index: number, totalCards: number): [number, number, number] {
    if (totalCards === 0) return [0, 0, 0];

    // Calculate the total available width
    const totalAvailableWidth = viewportWidth.value;

    // Card visual width in world units at z=25
    const cardVisualWidth = 0.6;

    // Calculate spacing to fill viewport width
    const availableWidthForSpacing = totalAvailableWidth - cardVisualWidth * totalCards;
    const spacing = Math.max(minCardSpacing, availableWidthForSpacing / (totalCards - 1 || 1));

    // Calculate total width with cards and spacing
    const totalCardsWidth = cardVisualWidth * totalCards + spacing * Math.max(totalCards - 1, 0);

    // Calculate the starting x position to center all cards
    const startX = -totalCardsWidth / 2 + cardVisualWidth / 2;

    // Position each card with calculated spacing
    const x = startX + index * (cardVisualWidth + spacing);

    // No y offset (all cards in same row)
    const y = 0;

    // Add subtle curve for depth perception
    const z = -Math.abs(x) * 0.02;

    return [x, y, z];
  }

  function handleCardClick(cardId: number): void {
    cardGameStore.playCard(cardId);
  }
</script>
