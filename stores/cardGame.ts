import { defineStore } from "pinia";
import { computed, ref } from "vue";

export type Card = {
  id: number;
  name: string;
  color: string;
};

// Animation state type for persistence
export type CardAnimationState = {
  cardId: number;
  startPosition: [number, number, number];
  targetPosition: [number, number, number];
  startTime: number;
  animationDuration: number;
  animationState: "idle" | "playing" | "completed";
};

export const useCardGameStore = defineStore("cardGame", () => {
  // Available cards
  const cards = ref<Card[]>([
    { id: 1, name: "Red Card", color: "#e74c3c" },
    { id: 2, name: "Green Card", color: "#2ecc71" },
    { id: 3, name: "Blue Card", color: "#3498db" },
    { id: 4, name: "Purple Card", color: "#9b59b6" },
    { id: 5, name: "Yellow Card", color: "#f1c40f" },
  ]);

  // Cards that have been played (store only IDs)
  const playedCardIds = ref<number[]>([]);

  // Animation states for cards
  const cardAnimations = ref<Record<number, CardAnimationState>>({});

  /**
   * Play a card
   * @param cardId The ID of the card to play
   */
  function playCard(cardId: number) {
    // Don't add if already played
    if (playedCardIds.value.includes(cardId)) {
      console.log(`Card ${cardId} already played`);
      return;
    }

    // Add to played cards
    playedCardIds.value.push(cardId);
    console.log(`Card ${cardId} played, total played: ${playedCardIds.value.length}`);
  }

  /**
   * Register a card animation
   */
  function startCardAnimation(
    cardId: number,
    startPosition: [number, number, number],
    targetPosition: [number, number, number],
    animationDuration = 1500
  ) {
    cardAnimations.value[cardId] = {
      cardId,
      startPosition,
      targetPosition,
      startTime: Date.now(),
      animationDuration,
      animationState: "playing",
    };
    console.log(`Animation registered for card ${cardId}`, startPosition, targetPosition);
  }

  /**
   * Complete a card animation
   */
  function completeCardAnimation(cardId: number) {
    if (cardAnimations.value[cardId]) {
      cardAnimations.value[cardId].animationState = "completed";
      console.log(`Animation completed for card ${cardId}`);
    }
  }

  /**
   * Get animation state for a card
   */
  function getCardAnimationState(cardId: number): CardAnimationState | null {
    return cardAnimations.value[cardId] || null;
  }

  /**
   * Reset the game
   */
  function resetGame() {
    playedCardIds.value = [];
    cardAnimations.value = {};
  }

  /**
   * Get a card by ID
   */
  function getCardById(cardId: number): Card | undefined {
    return cards.value.find((card) => card.id === cardId);
  }

  // Computed properties for the UI to use (compatible with previous store version)
  const availableCards = computed<Card[]>(() => {
    // Filter cards that haven't been played yet
    return cards.value.filter((card) => !playedCardIds.value.includes(card.id));
  });

  const playedCards = computed<Card[]>(() => {
    // Map played card IDs to card objects
    return playedCardIds.value
      .map((id) => getCardById(id))
      .filter((card): card is Card => card !== undefined);
  });

  return {
    cards,
    // Expose playedCardIds internally
    playedCardIds,
    cardAnimations,
    playCard,
    resetGame,
    getCardById,
    startCardAnimation,
    completeCardAnimation,
    getCardAnimationState,
    // Expose computed properties for UI components
    availableCards,
    playedCards,
  };
});
