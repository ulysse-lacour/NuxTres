<template>
  <div
    class="game-card"
    :class="{ 'is-played': isPlayed }"
    :style="{ 'background-color': color }"
    @click="onClick"
  >
    <h3>{{ name }}</h3>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  id: number;
  name: string;
  color: string;
  isPlayed: boolean;
}>();

const emit = defineEmits<{
  (e: "play", id: number): void;
}>();

const onClick = () => {
  if (!props.isPlayed) {
    emit("play", props.id);
  }
};
</script>

<style lang="scss" scoped>
.game-card {
  width: 120px;
  height: 180px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px;
  color: white;
  cursor: pointer;
  transition: transform 0.3s ease, opacity 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-10px);
  }

  &.is-played {
    opacity: 0.5;
    cursor: not-allowed;
  }

  h3 {
    font-size: 1.2rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  }
}
</style>
