<template>
  <main class="container">
    <h1>Welcome to NuxTres</h1>
    <p>
      This is the new homepage. Check out our
      <NuxtLink to="/example">3D example</NuxtLink>.
    </p>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
});
</script>

<style lang="scss" scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}
</style>
