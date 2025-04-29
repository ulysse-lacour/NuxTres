<template>
  <div class="card-game">
    <div class="game-header">
      <h1>Card Game</h1>
      <button class="reset-button" @click="cardGameStore.resetGame">Reset Game</button>
    </div>

    <!-- 3D Scene container with game state overlays -->
    <div class="scene-container">
      <!-- 3D scene with explicit component import -->
      <ClientOnly>
        <CardGameScene />
      </ClientOnly>

      <!-- Game instructions panel -->
      <div class="instructions-panel">
        <h3>Card Game</h3>
        <p>Click on cards to play them to the wall.</p>
        <div class="game-stats">
          <div class="stat">
            <span class="label">Available Cards:</span>
            <span class="value">{{ cardGameStore.availableCards.length }}</span>
          </div>
          <div class="stat">
            <span class="label">Played Cards:</span>
            <span class="value">{{ cardGameStore.playedCards.length }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import CardGameScene from "@/components/Cards/CardGameScene.client.vue";
  import { useCardGameStore } from "@/stores/cardGame";

  // Set page metadata
  definePageMeta({
    layout: "default",
    keepalive: true,
  });

  // Initialize game state directly with Pinia store
  const cardGameStore = useCardGameStore();
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

    // Header with title and reset button
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

    // Main scene container
    .scene-container {
      flex: 1;
      position: relative;
      overflow: hidden;

      // Game instructions panel
      .instructions-panel {
        position: absolute;
        bottom: 20px;
        right: 20px;
        padding: 18px;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        border-radius: 10px;
        max-width: 300px;
        z-index: 10;
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
        transition: all 0.3s ease;

        h3 {
          margin-top: 0;
          margin-bottom: 10px;
          color: #3498db;
          font-size: 1.2rem;
          letter-spacing: 0.5px;
        }

        p {
          margin: 8px 0 15px;
          font-size: 0.95rem;
          line-height: 1.4;
          opacity: 0.9;
        }

        .game-stats {
          margin-top: 15px;

          .stat {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            align-items: center;

            .label {
              font-weight: 500;
              color: #ccc;
            }

            .value {
              font-weight: bold;
              color: white;
              background: rgba(52, 152, 219, 0.2);
              padding: 2px 8px;
              border-radius: 10px;
              min-width: 24px;
              text-align: center;
            }
          }
        }
      }
    }
  }
</style>
