import { useCardGameStore } from "../stores/cardGame";

export function useCardGame() {
  const cardGameStore = useCardGameStore();

  // Handle card selection
  function handleCardClick(cardId: number): void {
    cardGameStore.playCard(cardId);
  }

  // Reset game state
  function resetGame(): void {
    cardGameStore.resetGame();
  }

  return {
    cardGameStore,
    handleCardClick,
    resetGame,
  };
}
