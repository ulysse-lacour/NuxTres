<template>
  <TresCanvas v-bind="gl" window-size>
    <TresPerspectiveCamera :position="[0, 1.7, 7]" :look-at="[0, 0, 0]" />
    <OrbitControls :enabled="true" />
    <SampleBox :position="[-2, 0, 0]" />
    <Suspense>
      <Suzanne :position="[2, 0, 0]" />
    </Suspense>
  </TresCanvas>
</template>

<script setup lang="ts">
  import { OrbitControls } from "@tresjs/cientos";

  const gl = reactive<GL>({
    clearColor: "#1C1C1C",
    powerPreference: "high-performance",
  });
</script>
