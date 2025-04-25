import { computed } from "vue";
import type { Ref } from "vue";

export function useCardPositioning(viewportWidth: Ref<number>, minCardSpacing: number = 0.3) {
  // Card visual width in world units
  const cardVisualWidth = 2.0;
  // Card visual height in world units
  const cardVisualHeight = 3.0;
  // Overlap factor (how much cards overlap each other, 0-1 where 1 is full overlap)
  const overlapFactor = 0.35; // Reduced overlap for better visibility

  // Position cards in a simple straight line at the bottom of the screen
  function getCardPosition(index: number, totalCards: number): [number, number, number] {
    if (totalCards === 0) return [0, 0, 0];

    // Calculate effective width with overlap
    const effectiveCardWidth = cardVisualWidth * (1 - overlapFactor);

    // Calculate total width with cards overlapping
    const totalWidth = effectiveCardWidth * (totalCards - 1) + cardVisualWidth;

    // Calculate starting position to center the hand
    const startX = -totalWidth / 2 + cardVisualWidth / 2;

    // Base X position with overlap effect
    const x = startX + index * effectiveCardWidth;

    // Flat Y position - no curve
    const y = 0;

    // Flat Z position - no depth variation
    const z = 0;

    return [x, y, z];
  }

  // Slight rotation to face upward
  function getCardRotation(index: number, totalCards: number): [number, number, number] {
    // Small negative X rotation tilts cards slightly upward (toward camera)
    // No Y or Z rotation
    return [-0.15, 0, 0];
  }

  return {
    getCardPosition,
    getCardRotation,
    cardVisualWidth,
    cardVisualHeight,
    overlapFactor,
  };
}
