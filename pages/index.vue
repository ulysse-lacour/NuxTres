<template>
  <main class="container">
    <h1>Welcome to NuxTres</h1>
    <div class="links">
      <p>
        Check out our
        <NuxtLink to="/example" class="link">3D example</NuxtLink>.
      </p>
      <p>
        Play our
        <NuxtLink to="/card-game" class="link">Card Game</NuxtLink>!
      </p>
    </div>
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
  margin-bottom: 1.5rem;
}

.links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 1.2rem;
}

.link {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;

  &:hover {
    color: #2980b9;
    text-decoration: underline;
  }
}
</style>
