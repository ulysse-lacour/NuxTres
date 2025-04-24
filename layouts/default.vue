<template>
  <div class="layout">
    <slot />
  </div>
</template>

<style lang="scss">
  html,
  body,
  #__nuxt {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .layout {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
  }
</style>
