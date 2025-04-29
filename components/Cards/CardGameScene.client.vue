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
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, -6, 0]" receive-shadow>
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
        :position="getCardPosition(card, index)"
        :rotation="getCardRotation(card, index)"
        :color="card.color"
        :name="card.name"
        :card-id="card.id"
        :scale="[0.85, 0.85, 0.85]"
        :index="index"
        :total-cards="availableAndAnimatingCards.length"
        :render-order="
          renderOrderSystem.calculateHandRenderOrder(index, availableAndAnimatingCards.length)
        "
      />
    </TresGroup>
  </TresCanvas>
</template>

<script setup lang="ts">
  import { useCardPositioning } from "@/composables/useCardPositioning";
  import { useClientNavigation } from "@/composables/useClientNavigation";
  import { useRenderOrder } from "@/composables/useRenderOrder";
  import { computed, nextTick, provide, reactive, ref, watch } from "vue";
  import type { Group, PerspectiveCamera } from "three";

  // Game state and card handling - now directly using the store
  const cardGameStore = useCardGameStore();

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

  // Client navigation handling
  const { isSceneReady } = useClientNavigation();

  // Card positioning system with built-in viewport handling
  const {
    getCardPosition: calculatePositionFromComposable,
    getCardRotation: calculateRotationFromComposable,
    refreshTrigger,
  } = useCardPositioning();

  // Memoize card position and rotation calculations to improve performance
  const cardPositionCache = new Map<number, [number, number, number]>();
  const cardRotationCache = new Map<number, [number, number, number]>();

  // Optimized position getter with caching
  function getCardPosition(card: Card, index: number): [number, number, number] {
    if (!isSceneReady.value) {
      return calculatePositionFromComposable(index, availableAndAnimatingCards.value.length);
    }

    // Cache by card ID for stable positioning
    if (!cardPositionCache.has(card.id)) {
      const position = calculatePositionFromComposable(
        index,
        availableAndAnimatingCards.value.length
      );
      cardPositionCache.set(card.id, position);
    }
    return cardPositionCache.get(card.id)!;
  }

  // Optimized rotation getter with caching
  function getCardRotation(card: Card, index: number): [number, number, number] {
    if (!isSceneReady.value) {
      return calculateRotationFromComposable(index, availableAndAnimatingCards.value.length);
    }

    // Cache by card ID for stable rotation
    if (!cardRotationCache.has(card.id)) {
      const rotation = calculateRotationFromComposable(
        index,
        availableAndAnimatingCards.value.length
      );
      cardRotationCache.set(card.id, rotation);
    }
    return cardRotationCache.get(card.id)!;
  }

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

  // Watch for changes in card arrangement or refresh trigger
  watch([availableAndAnimatingCards, refreshTrigger], () => {
    // Clear caches when card arrangement changes
    cardPositionCache.clear();
    cardRotationCache.clear();
  });

  // Watch for game reset to ensure card positions are recalculated
  watch(
    () => cardGameStore.resetCounter,
    () => {
      // Force clear position cache when game is reset
      cardPositionCache.clear();
      cardRotationCache.clear();

      // Force a refresh of card positioning on reset
      nextTick(() => {
        // For each visible card, recalculate its position
        availableAndAnimatingCards.value.forEach((card, index) => {
          // Generate fresh position and rotation and update cache
          const newPosition = calculatePositionFromComposable(
            index,
            availableAndAnimatingCards.value.length
          );
          const newRotation = calculateRotationFromComposable(
            index,
            availableAndAnimatingCards.value.length
          );

          cardPositionCache.set(card.id, newPosition);
          cardRotationCache.set(card.id, newRotation);
        });
      });
    }
  );
</script>
