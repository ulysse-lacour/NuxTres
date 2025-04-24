<template>
  <TresMesh
    ref="boxRef"
    @click="onBoxClick"
    @pointer-enter="onPointerenter"
    @pointer-leave="onPointerleave"
  >
    <TresBoxGeometry :args="[1.5, 1.5, 1.5]" />
    <TresMeshNormalMaterial />
  </TresMesh>
</template>

<script setup lang="ts">
  import { useRenderLoop } from "@tresjs/core";
  import type { Mesh } from "three";

  //
  // Refs
  //
  const { $gsap } = useNuxtApp();
  const { onLoop } = useRenderLoop();

  const boxRef = shallowRef<Mesh | null>(null);

  //
  // Lifecycle
  //
  onMounted(async () => {
    await nextTick();

    onLoop(({ elapsed }) => {
      if (!boxRef.value) return;
      boxRef.value.rotation.y += 0.01;
      boxRef.value.rotation.z += 0.0074;
      boxRef.value.position.y = Math.sin(elapsed) * 0.5;
    });
  });

  //
  // Methods
  //
  function onBoxClick(event: { object: Mesh }) {
    if ($gsap.isTweening(event.object.scale)) return;

    $gsap.to(event.object.scale, {
      x: 1.5,
      y: 1.5,
      z: 1.5,
      repeat: 1,
      yoyo: true,
      duration: 1,
      ease: "elastic.inOut(3.5, 1)",
    });
  }

  function onPointerenter(): void {
    document.body.style.cursor = "pointer";
  }

  function onPointerleave(): void {
    document.body.style.cursor = "default";
  }
</script>
