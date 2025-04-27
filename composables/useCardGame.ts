import { useCardGameStore } from "@/stores/cardGame";

export function useCardGame() {
  const cardGameStore = useCardGameStore();

  // Reset game state
  function resetGame(): void {
    cardGameStore.resetGame();
  }

  return {
    cardGameStore,
    resetGame,
  };
}
