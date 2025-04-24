<template>
  <TresGroup :position="position">
    <TresMesh ref="cardRef">
      <TresBoxGeometry :args="[2, 3, 0.1]" />
      <TresMeshStandardMaterial :color="color" />

      <!-- Card Text -->
      <TresGroup :position="[0, 0, 0.06]">
        <Suspense>
          <Text3D
            :text="name"
            font="https://raw.githubusercontent.com/Tresjs/assets/main/fonts/FiraCodeRegular.json"
            :size="0.2"
            :height="0.05"
            center
            :color="textColor"
          />
        </Suspense>
      </TresGroup>
    </TresMesh>
  </TresGroup>
</template>

<script setup lang="ts">
import { Text3D } from "@tresjs/cientos";
import { useRenderLoop } from "@tresjs/core";
import type { Mesh } from "three";
import { computed } from "vue";

// Props
const props = defineProps<{
  position: [number, number, number];
  color: string;
  name: string;
}>();

// Computed
const textColor = computed(() => {
  // Calculate if text should be black or white based on background color brightness
  const color = props.color.replace("#", "");
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#ffffff";
});

// Refs
const { onLoop } = useRenderLoop();
const cardRef = shallowRef<Mesh | null>(null);

// Animation
onMounted(async () => {
  await nextTick();

  onLoop(() => {
    if (!cardRef.value) return;
    cardRef.value.rotation.y += 0.005;
    cardRef.value.position.y = Math.sin(Date.now() * 0.001) * 0.2 + 0.5;
  });
});
</script>
