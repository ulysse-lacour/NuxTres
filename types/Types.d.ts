declare global {
  /**
   * Card type representing a playable card in the game
   */
  interface Card {
    id: number;
    name: string;
    color: string;
  }

  /**
   * Animation state type for card transition animations
   */
  interface CardAnimationState {
    cardId: number;
    startPosition: [number, number, number];
    targetPosition: [number, number, number];
    startTime: number;
    animationDuration: number;
    animationState: "idle" | "playing" | "completed";
  }

  /**
   * WebGL rendering configuration
   */
  interface GL {
    clearColor: string;
    powerPreference: "high-performance" | "low-power" | "default";
  }

  /**
   * Sample store state
   */
  interface SampleState {
    count: number;
  }
}

export {};
