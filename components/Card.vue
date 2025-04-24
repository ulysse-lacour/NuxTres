<template>
  <TresGroup :position="position" :scale="scale || [1, 1, 1]">
    <TresMesh
      ref="cardRef"
      :position="[0, isPlayed ? 0 : hoverY, 0]"
      @click="handleClick"
      @pointer-enter="onPointerEnter"
      @pointer-leave="onPointerLeave"
    >
      <TresBoxGeometry :args="[2, 3, 0.1]" />
      <TresMeshStandardMaterial
        :color="color"
        :metalness="isPlayed ? 0.5 : 0.2"
        :roughness="isPlayed ? 0.2 : 0.8"
        :opacity="isHovered ? 1 : 0.9"
        :transparent="true"
      />

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

      <!-- Highlight effect for hovered cards -->
      <TresSpotLight
        v-if="isHovered && !isPlayed"
        :intensity="3"
        :position="[0, 3, 1]"
        :angle="0.5"
        :penumbra="0.5"
        :color="color"
      />
    </TresMesh>
  </TresGroup>
</template>

<script setup lang="ts">
  import { Text3D } from "@tresjs/cientos";
  import { useRenderLoop } from "@tresjs/core";
  import { computed, ref } from "vue";
  import type { Mesh } from "three";

  // Props
  const props = defineProps<{
    position: [number, number, number];
    color: string;
    name: string;
    cardId?: number;
    isPlayed?: boolean;
    scale?: [number, number, number];
  }>();

  // Emits
  const emit = defineEmits<{
    (e: "card-clicked", cardId: number): void;
  }>();

  // Refs
  const { onLoop } = useRenderLoop();
  const cardRef = shallowRef<Mesh | null>(null);
  const hoverY = ref(0);
  const isHovered = ref(false);

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

  // Methods
  function handleClick() {
    if (props.cardId !== undefined && !props.isPlayed) {
      emit("card-clicked", props.cardId);
    }
  }

  function onPointerEnter() {
    if (!props.isPlayed) {
      isHovered.value = true;
      document.body.style.cursor = "pointer";
    }
  }

  function onPointerLeave() {
    isHovered.value = false;
    document.body.style.cursor = "default";
  }

  // Animation
  onMounted(async () => {
    await nextTick();

    onLoop(({ elapsed }) => {
      if (!cardRef.value) return;

      // Different animations for played vs available cards
      if (props.isPlayed) {
        // Slow rotation for played cards
        cardRef.value.rotation.y = Math.sin(elapsed * 0.2) * 0.2;
        cardRef.value.rotation.x = Math.sin(elapsed * 0.1) * 0.05;
        cardRef.value.position.y = Math.sin(elapsed * 0.3) * 0.3 + 0.5;
      } else {
        // Subtle floating animation for available cards
        cardRef.value.rotation.y = Math.sin(elapsed * 0.5) * 0.05;

        // Enhanced hover effect
        if (isHovered.value) {
          hoverY.value = Math.sin(elapsed * 2) * 0.05 + 0.3;
          cardRef.value.rotation.z = Math.sin(elapsed * 3) * 0.03;
        } else {
          hoverY.value = Math.sin(elapsed * 0.2) * 0.05;
          cardRef.value.rotation.z = 0;
        }
      }
    });
  });
</script>
