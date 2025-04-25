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

      <!-- Game instructions -->
      <!-- <div class="instructions-panel">
        <h3>How to Play</h3>
        <p>Click on cards in your hand to place them on the wall.</p>
        <p>
          <strong
            >Cards played: {{ cardGameStore.playedCards.length }} /
            {{ cardGameStore.cards.length }}</strong
          >
        </p>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useCardGame } from "../composables/useCardGame";

  definePageMeta({
    layout: "default",
  });

  const { cardGameStore, resetGame } = useCardGame();
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
    background: linear-gradient(to bottom, #1a1a2e, #16213e);

    .game-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      z-index: 10;
      position: relative;
      background-color: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(5px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      h1 {
        font-size: 2.5rem;
        margin: 0;
        color: #ffffff;
        text-shadow: 0 0 10px rgba(0, 100, 255, 0.5);
      }

      .reset-button {
        padding: 0.75rem 1.5rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.2s ease;
        box-shadow: 0 0 10px rgba(52, 152, 219, 0.5);

        &:hover {
          background-color: #2980b9;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(52, 152, 219, 0.6);
        }

        &:active {
          transform: translateY(0);
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
        backdrop-filter: blur(5px);

        p {
          font-size: 2rem;
          margin-bottom: 1.5rem;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }
      }

      .instructions-panel {
        position: absolute;
        bottom: 20px;
        right: 20px;
        padding: 15px;
        background-color: rgba(0, 0, 0, 0.6);
        color: white;
        border-radius: 8px;
        max-width: 300px;
        z-index: 10;
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);

        h3 {
          margin-top: 0;
          color: #3498db;
        }

        p {
          margin: 8px 0;
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
