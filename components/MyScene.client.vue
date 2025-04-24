<template>
  <TresCanvas v-bind="gl" window-size>
    <TresPerspectiveCamera :position="[0, 1.7, 7]" :look-at="[0, 0, 0]" />

    <OrbitControls :enabled="config.orbitControlsEnabled" />

    <SampleBox :position="[-2, 0, 0]" />

    <Suspense>
      <Suzanne :position="[2, 0, 0]" />
    </Suspense>

    <Suspense>
      <StatsGl />
    </Suspense>
  </TresCanvas>
</template>

<script setup lang="ts">
import { OrbitControls, StatsGl } from "@tresjs/cientos";
import { Pane } from "tweakpane";

interface Config {
  orbitControlsEnabled: boolean;
}

interface GL {
  clearColor: string;
  powerPreference: "high-performance" | "low-power" | "default";
}

//
// Refs
//
const sampleStore = useSampleStore();

const config = reactive<Config>({
  orbitControlsEnabled: true,
});

const gl = reactive<GL>({
  clearColor: "#1C1C1C",
  powerPreference: "high-performance",
});

//
// Lifecycle
//
onMounted(async () => {
  await nextTick();

  // Do stuff on mount
  createDebugPane();
});

//
// Functions
//
function createDebugPane(): void {
  const pane = new Pane();

  pane.title = "Configuration";

  pane.addBinding(gl, "clearColor", { label: "Clear Color", colorMode: "hex" });

  pane.addBlade({
    view: "separator",
  });

  pane.addBinding(config, "orbitControlsEnabled", {
    label: "Orbit Controls enabled",
  });

  pane.addBlade({
    view: "separator",
  });

  pane.addButton({ title: "Increase counter (Pinia)" }).on("click", () => {
    sampleStore.increment();
  });

  pane.addButton({ title: "Decreate counter (Pinia)" }).on("click", () => {
    sampleStore.decrement();
  });

  pane.addBinding(sampleStore, "count", {
    label: "Pinia counter",
    readonly: true,
  });
}
</script>
