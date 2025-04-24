<template>
  <div class="card-game">
    <div class="game-header">
      <h1>Card Game</h1>
      <button class="reset-button" @click="resetGame">Reset Game</button>
    </div>

    <!-- 3D Scene -->
    <div class="scene-container">
      <div v-if="cardGameStore.availableCards.length === 0" class="no-cards-overlay">
        <p>No cards left to play!</p>
        <button class="reset-button" @click="resetGame">Play Again</button>
      </div>

      <client-only>
        <CardGameScene />
      </client-only>
    </div>

    <div class="instructions">
      <p>Click on a card to play it. The played card will appear in the background.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: "default",
  });

  const cardGameStore = useCardGameStore();

  function resetGame() {
    cardGameStore.resetGame();
  }
</script>

<style lang="scss" scoped>
  html,
  body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    height: 100%;
    width: 100%;
  }

  .card-game {
    width: 100%;
    height: 100vh;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;

    .game-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      z-index: 10;
      position: relative;

      h1 {
        font-size: 2.5rem;
        margin: 0;
      }

      .reset-button {
        padding: 0.75rem 1.5rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;

        &:hover {
          background-color: #2980b9;
        }
      }
    }

    .scene-container {
      flex: 1;
      position: relative;
      overflow: hidden;

      .no-cards-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 20;
        color: white;
        text-align: center;

        p {
          font-size: 2rem;
          margin-bottom: 1.5rem;
        }
      }
    }

    .instructions {
      text-align: center;
      font-size: 1.1rem;
      color: #555;
      padding: 0.5rem;
      margin: 0;
    }
  }
</style>
