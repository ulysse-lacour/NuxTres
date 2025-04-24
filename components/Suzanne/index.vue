<template>
  <TresMesh ref="componentRef" :material="material" :geometry="nodes.Suzanne.geometry" />
</template>

<script setup lang="ts">
  import { useGLTF } from "@tresjs/cientos";
  import { useRenderLoop } from "@tresjs/core";
  import { ShaderMaterial } from "three";

  // @ts-expect-error
  import fragmentShader from "./fragment.glsl";
  // @ts-expect-error
  import vertexShader from "./vertex.glsl";

  //
  // Refs
  //
  const { onLoop } = useRenderLoop();
  const { nodes } = await useGLTF("/suzanne.glb");

  // Dispose the default material
  if (nodes.Suzanne.material) {
    nodes.Suzanne.material.dispose();
  }

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      u_Time: { value: 0 },
    },
  });

  //
  // Lifecycle
  //
  onMounted(async () => {
    await nextTick();

    onLoop(({ elapsed }) => {
      material.uniforms.u_Time.value = elapsed;
    });
  });
</script>
