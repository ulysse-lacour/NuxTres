import { computed } from "vue";
import type { Ref } from "vue";

export function useCardPositioning(viewportWidth: Ref<number>, minCardSpacing: number = 0.3) {
  // Card visual width in world units
  const cardVisualWidth = 2.0;
  // Card visual height in world units
  const cardVisualHeight = 3.0;
  // Overlap factor (how much cards overlap each other, 0-1 where 1 is full overlap)
  const overlapFactor = 0.5; // Balanced overlap
  // Fan rotation angle in radians (how much each card rotates)
  const fanAngle = 0.1; // Moderate fan angle

  // Position cards in a gentle arc at the bottom of the screen
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

    // Calculate normalized index (-0.5 to 0.5)
    const normalizedIndex = index / Math.max(1, totalCards - 1) - 0.5;

    // Very gentle arc for a natural appearance
    const y = Math.abs(normalizedIndex) * 0.1;

    // Very slight z-offset for middle cards
    const z = Math.cos(normalizedIndex * Math.PI) * 0.2;

    return [x, y, z];
  }

  // Calculate rotation for each card with balanced angles
  function getCardRotation(index: number, totalCards: number): [number, number, number] {
    if (totalCards <= 1) return [0.2, 0, 0];

    // Calculate normalized index (-0.5 to 0.5)
    const normalizedIndex = index / Math.max(1, totalCards - 1) - 0.5;

    // Moderate forward tilt - balanced view
    const xRotation = 0.2; // ~11 degrees - natural card angle

    // Gentle fan rotation
    const yRotation = normalizedIndex * fanAngle * 1.5;

    // Very slight z-rotation for natural feel
    const zRotation = normalizedIndex * 0.02;

    return [xRotation, yRotation, zRotation];
  }

  return {
    getCardPosition,
    getCardRotation,
    cardVisualWidth,
    cardVisualHeight,
    overlapFactor,
  };
}
