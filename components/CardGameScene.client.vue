<template>
  <TresCanvas v-bind="gl" window-size>
    <TresPerspectiveCamera :position="[0, 5, 10]" :look-at="[0, 0, 0]" />
    <OrbitControls :enabled="true" />

    <!-- Floor -->
    <TresMesh
      :rotation="[-Math.PI / 2, 0, 0]"
      :position="[0, -1, 0]"
      :receive-shadow="true"
    >
      <TresPlaneGeometry :args="[20, 20]" />
      <TresMeshStandardMaterial color="#2c3e50" />
    </TresMesh>

    <!-- Ambient Light -->
    <TresAmbientLight :intensity="0.5" />

    <!-- Directional Light -->
    <TresDirectionalLight
      :position="[5, 5, 5]"
      :intensity="1"
      :cast-shadow="true"
    />

    <!-- Selected Card -->
    <Suspense v-if="cardGameStore.selectedCard">
      <PlayedCard
        :position="[0, 0, 0]"
        :color="cardGameStore.selectedCard.color"
        :name="cardGameStore.selectedCard.name"
      />
    </Suspense>

    <Suspense>
      <StatsGl />
    </Suspense>
  </TresCanvas>
</template>

<script setup lang="ts">
import { OrbitControls, StatsGl } from "@tresjs/cientos";

interface GL {
  clearColor: string;
  powerPreference: "high-performance" | "low-power" | "default";
  renderMode: "on-demand" | "manual";
}

// Store
const cardGameStore = useCardGameStore();

// Refs
const gl = reactive<GL>({
  clearColor: "#1a1a2e",
  powerPreference: "high-performance",
  renderMode: "on-demand",
});
</script>
