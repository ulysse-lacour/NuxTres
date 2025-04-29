<template>
  <TresMesh v-if="nodes?.Suzanne" :material="material" :geometry="nodes.Suzanne.geometry" />
</template>

<script setup lang="ts">
  import { useGLTF } from "@tresjs/cientos";
  import { useRenderLoop } from "@tresjs/core";
  import { ShaderMaterial } from "three";

  // @ts-expect-error - GLSL shader imports are not recognized by TypeScript but handled by vite-plugin-glsl
  import fragmentShader from "./fragment.glsl";
  // @ts-expect-error - GLSL shader imports are not recognized by TypeScript but handled by vite-plugin-glsl
  import vertexShader from "./vertex.glsl";

  const { onLoop } = useRenderLoop();
  const { nodes } = await useGLTF("/suzanne.glb");

  // Dispose the default material
  if (nodes?.Suzanne?.material) {
    nodes.Suzanne.material.dispose();
  }

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      u_Time: { value: 0 },
    },
  });

  onMounted(() => {
    onLoop(({ elapsed }) => {
      if (material?.uniforms?.u_Time) {
        material.uniforms.u_Time.value = elapsed;
      }
    });
  });
</script>
