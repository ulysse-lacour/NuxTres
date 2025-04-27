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

    <!-- Wall area for played cards - PLACED AT FLOOR LEVEL -->
    <TresGroup ref="wallGroupRef" :position="[0, 0, -5]">
      <!-- Wall background with subtle depth -->
      <TresMesh :position="[0, 0, -0.6]" :scale="[20, 10, 0.5]">
        <TresBoxGeometry :args="[1, 1, 0.1]" />
        <TresMeshStandardMaterial :color="'#2c3e50'" :metalness="0.2" :roughness="0.8" />
      </TresMesh>

      <!-- Cards positioned on wall -->
      <TresGroup :position="[0, 2.5, 0]">
        <Card
          v-for="(card, index) in completedCards"
          :key="`played-${card.id}`"
          :position="[0, 0, 0.1 + index * 0.01]"
          :rotation="[0, 0, 0]"
          :color="card.color"
          :name="card.name"
          :card-id="card.id"
          :scale="[0.85, 0.85, 0.85]"
          :render-order="1000 + index"
          :is-played="true"
        />
      </TresGroup>
    </TresGroup>

    <!-- Available cards hand area -->
    <TresGroup ref="cardsGroupRef" :position="[0, -3.5, 4]">
      <!-- Only show non-played cards and cards that are currently animating -->
      <Card
        v-for="(card, index) in availableAndAnimatingCards"
        :key="`card-${card.id}`"
        :position="
          getCardPosition(getAvailableCardIndex(card.id), cardGameStore.availableCards.length)
        "
        :rotation="
          getCardRotation(getAvailableCardIndex(card.id), cardGameStore.availableCards.length)
        "
        :color="card.color"
        :name="card.name"
        :card-id="card.id"
        :scale="[0.85, 0.85, 0.85]"
        :index="getAvailableCardIndex(card.id)"
        :total-cards="cardGameStore.availableCards.length"
        :render-order="
          renderOrderSystem.calculateHandRenderOrder(
            getAvailableCardIndex(card.id),
            cardGameStore.availableCards.length
          )
        "
      />
    </TresGroup>
  </TresCanvas>
</template>

<script setup lang="ts">
  import { useCardGame } from "@/composables/useCardGame";
  import { useCardPositioning } from "@/composables/useCardPositioning";
  import { useRenderOrder } from "@/composables/useRenderOrder";
  import { useViewport } from "@/composables/useViewport";
  import { computed, onBeforeUnmount, onMounted, provide, reactive, ref } from "vue";
  import type { Group, PerspectiveCamera } from "three";

  /**
   * WebGL rendering configuration
   */
  interface GL {
    clearColor: string;
    powerPreference: "high-performance" | "low-power" | "default";
  }

  // Game state and card handling
  const { cardGameStore } = useCardGame();

  // WebGL settings for optimal performance
  const gl = reactive<GL>({
    clearColor: "#090c14", // Dark blue background
    powerPreference: "high-performance",
  });

  // Scene refs
  const cardsGroupRef = ref<Group | null>(null);
  const wallGroupRef = ref<Group | null>(null);
  const cameraRef = ref<PerspectiveCamera | null>(null);

  // Wall position for cards to animate to - FLOOR LEVEL
  const wallPosition: [number, number, number] = [0, 0, -5];

  // Position offset for cards within the wall group - must match TresGroup position
  const cardWallOffset = ref<[number, number, number]>([0, 2.5, 0]);

  // Provide positions to child components
  provide("wallPosition", wallPosition);
  provide("cardWallOffset", cardWallOffset);

  console.log("CARD SCENE: Providing positions:", { wallPosition, cardWallOffset });

  // Responsive viewport calculations
  const { viewportWidth, updateViewportSize } = useViewport(50, 8);

  // Card positioning system
  const { getCardPosition, getCardRotation } = useCardPositioning(viewportWidth);

  // Render order system for proper card stacking
  const renderOrderSystem = useRenderOrder();

  // Get cards that have completed their animation and should be shown on the wall
  const completedCards = computed(() => {
    return cardGameStore.playedCards.filter((card) => {
      const animation = cardGameStore.getCardAnimationState(card.id);
      return !animation || animation.animationState === "completed";
    });
  });

  // Get available cards plus cards that are currently animating
  // This ensures the card stays in its original position until animation completes
  const availableAndAnimatingCards = computed(() => {
    // Get available cards
    const availableCards = [...cardGameStore.availableCards];

    // Add cards that are currently being animated
    cardGameStore.playedCards.forEach((card) => {
      const animation = cardGameStore.getCardAnimationState(card.id);
      if (animation && animation.animationState === "playing") {
        // Keep this card in the hand during animation
        availableCards.push(card);
      }
    });

    return availableCards;
  });

  // Helper function to get the original index of a card in the available cards array
  function getAvailableCardIndex(cardId: number): number {
    return cardGameStore.availableCards.findIndex((card) => card.id === cardId);
  }

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
