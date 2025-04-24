<template>
  <div class="card-game">
    <div class="game-header">
      <h1>Card Game</h1>
      <button class="reset-button" @click="resetGame">Reset Game</button>
    </div>

    <!-- 3D Scene -->
    <div class="scene-container">
      <client-only>
        <CardGameScene />
      </client-only>
    </div>

    <!-- Available Cards -->
    <div class="cards-container">
      <div v-if="cardGameStore.availableCards.length === 0" class="no-cards">
        <p>No cards left to play!</p>
        <button class="reset-button" @click="resetGame">Play Again</button>
      </div>

      <GameCard
        v-for="card in cardGameStore.availableCards"
        :key="card.id"
        :id="card.id"
        :name="card.name"
        :color="card.color"
        :is-played="card.isPlayed"
        @play="playCard"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const cardGameStore = useCardGameStore();

function playCard(cardId: number) {
  cardGameStore.playCard(cardId);
}

function resetGame() {
  cardGameStore.resetGame();
}
</script>

<style lang="scss" scoped>
.card-game {
  width: 100%;
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  flex-direction: column;

  .game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    z-index: 10;
    position: relative;

    h1 {
      font-size: 2.5rem;
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
    height: 400px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
    position: relative;
    z-index: 1;
  }

  .cards-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    position: relative;
    z-index: 10;

    .no-cards {
      text-align: center;
      padding: 2rem;
      font-size: 1.5rem;

      p {
        margin-bottom: 1rem;
      }
    }
  }
}
</style>
