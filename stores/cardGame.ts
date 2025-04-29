import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useCardGameStore = defineStore("cardGame", () => {
  // Available cards
  const cards = ref<Card[]>([
    { id: 1, name: "Red Card", color: "#e74c3c" },
    { id: 2, name: "Green Card", color: "#2ecc71" },
    { id: 3, name: "Blue Card", color: "#3498db" },
    { id: 4, name: "Purple Card", color: "#9b59b6" },
    { id: 5, name: "Yellow Card", color: "#f1c40f" },
    { id: 6, name: "Orange Card", color: "#e67e22" },
    { id: 7, name: "Teal Card", color: "#1abc9c" },
    { id: 8, name: "Pink Card", color: "#e84393" },
    { id: 9, name: "Cyan Card", color: "#00cec9" },
    { id: 10, name: "Lime Card", color: "#badc58" },
  ]);

  // Cards that have been played (store only IDs)
  const playedCardIds = ref<number[]>([]);

  // Animation states for cards
  const cardAnimations = ref<Record<number, CardAnimationState>>({});

  // Reset counter to trigger reactive updates when game is reset
  const resetCounter = ref(0);

  // Card lookup map for faster access
  const cardMap = computed(() => {
    const map = new Map<number, Card>();
    cards.value.forEach((card) => map.set(card.id, card));
    return map;
  });

  /**
   * Play a card
   * @param cardId The ID of the card to play
   */
  function playCard(cardId: number) {
    // Don't add if already played
    if (playedCardIds.value.includes(cardId)) {
      return;
    }

    // Add to played cards
    playedCardIds.value.push(cardId);
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
  }

  /**
   * Complete a card animation
   */
  function completeCardAnimation(cardId: number) {
    if (cardAnimations.value[cardId]) {
      cardAnimations.value[cardId].animationState = "completed";
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
    resetCounter.value += 1;
  }

  /**
   * Get a card by ID
   */
  function getCardById(cardId: number): Card | undefined {
    return cardMap.value.get(cardId);
  }

  // Computed properties for the UI to use (compatible with previous store version)
  const availableCards = computed<Card[]>(() => {
    // Filter cards that haven't been played yet
    const playedSet = new Set(playedCardIds.value);
    return cards.value.filter((card) => !playedSet.has(card.id));
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
    resetCounter,
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
