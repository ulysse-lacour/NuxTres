interface Card {
  id: number;
  name: string;
  color: string;
  isPlayed: boolean;
}

interface State {
  cards: Card[];
  selectedCard: Card | null;
}

export const useCardGameStore = defineStore("cardGameStore", {
  state: (): State => ({
    cards: Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      name: `Card ${index + 1}`,
      color: getRandomColor(),
      isPlayed: false,
    })),
    selectedCard: null,
  }),

  actions: {
    playCard(cardId: number): void {
      const card = this.cards.find((c) => c.id === cardId);
      if (card && !card.isPlayed) {
        card.isPlayed = true;
        this.selectedCard = card;
      }
    },

    resetGame(): void {
      this.cards.forEach((card) => {
        card.isPlayed = false;
      });
      this.selectedCard = null;
    },
  },

  getters: {
    availableCards(): Card[] {
      return this.cards.filter((card) => !card.isPlayed);
    },

    playedCards(): Card[] {
      return this.cards.filter((card) => card.isPlayed);
    },
  },
});

// Helper function to generate random colors
function getRandomColor(): string {
  const colors = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#FF33F5",
    "#F5FF33",
    "#33FFF5",
    "#FF5733",
    "#C733FF",
    "#33FFC7",
    "#FFC733",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
