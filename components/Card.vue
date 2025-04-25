<template>
  <TresGroup :position="position" :scale="scale || [1, 1, 1]" :rotation="rotation || [0, 0, 0]">
    <TresMesh
      ref="cardRef"
      :position="[0, isPlayed ? 0 : hoverY, isHovered ? 0.2 : 0]"
      @click="handleClick"
      @pointer-enter="onPointerEnter"
      @pointer-leave="onPointerLeave"
    >
      <!-- Card base with thinner border for better visibility -->
      <TresBoxGeometry :args="[2.1, 3.1, 0.05]" />
      <TresMeshStandardMaterial color="white" :metalness="0.6" :roughness="0.3" />

      <!-- Card face -->
      <TresMesh :position="[0, 0, 0.06]">
        <TresBoxGeometry :args="[2, 3, 0.1]" />
        <TresMeshStandardMaterial
          :color="color"
          :metalness="isPlayed ? 0.6 : isHovered ? 0.5 : 0.3"
          :roughness="isPlayed ? 0.2 : isHovered ? 0.4 : 0.6"
          :emissive="color"
          :emissiveIntensity="isHovered ? 0.2 : 0.05"
        />
      </TresMesh>

      <!-- Card Text - simple and readable -->
      <TresGroup :position="[0, 0, 0.2]">
        <Suspense>
          <Text3D
            :text="name"
            font="https://raw.githubusercontent.com/Tresjs/assets/main/fonts/FiraCodeRegular.json"
            :size="0.25"
            :height="0.08"
            center
            :color="textColor"
          />
        </Suspense>
      </TresGroup>

      <!-- Moderate spotlight for hover effect -->
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
  import { Text3D } from "@tresjs/cientos";

  import { useCardInteraction } from "../composables/useCardInteraction";
  import { useTextColor } from "../composables/useTextColor";

  // Props
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
  }>();

  // Emits
  const emit = defineEmits<{
    (e: "card-clicked", cardId: number): void;
  }>();

  // Use card interaction composable
  const { cardRef, hoverY, isHovered, onPointerEnter, onPointerLeave } = useCardInteraction(
    props.isPlayed,
    props.index || 0,
    props.totalCards || 1
  );

  // Use text color composable
  const textColor = useTextColor(() => props.color);

  // Methods
  function handleClick() {
    if (props.cardId !== undefined && !props.isPlayed) {
      emit("card-clicked", props.cardId);
    }
  }
</script>
