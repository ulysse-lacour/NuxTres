import { computed } from "vue";
import type { Ref } from "vue";

/**
 * Composable for dynamic card positioning and sizing based on viewport
 *
 * @param viewportWidth - Reactive viewport width reference
 * @param minCardSpacing - Minimum spacing between cards
 * @returns Functions and values for positioning and sizing cards
 */
export function useCardPositioning(viewportWidth: Ref<number>, minCardSpacing: number = 0.3) {
  /**
   * Dynamically calculate card dimensions based on viewport width
   */
  const cardDimensions = computed(() => {
    // Base dimensions that will be scaled
    const baseWidth = 2.0;
    const baseHeight = 3.0;

    // Viewport-based scaling with min/max constraints
    const scaleFactor = Math.min(Math.max(viewportWidth.value / 12, 0.5), 1.4);

    return {
      width: baseWidth * scaleFactor,
      height: baseHeight * scaleFactor,
    };
  });

  /**
   * Calculate responsive padding between cards
   */
  const cardPadding = computed(() => {
    // Scale padding with viewport but keep it small
    return Math.min(viewportWidth.value * 0.015, 0.15);
  });

  /**
   * Calculate dynamic overlap factor based on total cards and viewport
   */
  const calculateOverlapFactor = computed(() => {
    return (totalCards: number) => {
      // Handle many cards with progressive overlap
      if (totalCards >= 8) {
        return 0.4 + (totalCards - 8) * 0.05; // Increase overlap for many cards
      }

      // Minimal overlap for few cards
      if (totalCards <= 3) return 0.1;

      // Default overlap calculation
      const baseOverlap = 0.3;
      const viewportFactor = Math.max(8 / viewportWidth.value, 0.4);
      const cardFactor = Math.min(totalCards / 4, 1.8);

      return Math.min(baseOverlap * viewportFactor * cardFactor, 0.7);
    };
  });

  /**
   * Calculate the position for a card based on its index and total cards
   * Positions are centered with appropriate overlap and spacing
   *
   * @param index - Index of the card in the collection
   * @param totalCards - Total number of cards
   * @returns [x, y, z] position coordinates
   */
  function getCardPosition(index: number, totalCards: number): [number, number, number] {
    if (totalCards <= 1) return [0, 0, 0];

    const cardWidth = cardDimensions.value.width;
    const padding = cardPadding.value;
    const overlapFactor = calculateOverlapFactor.value(totalCards);

    // Adjust padding for many cards to prevent overflow
    const effectivePadding = totalCards > 6 ? padding * (6 / totalCards) : padding;

    // Calculate visible card width including padding
    const visibleCardWidth = cardWidth * (1 - overlapFactor) + effectivePadding;

    // Calculate total width of all cards when arranged
    const totalWidth = visibleCardWidth * (totalCards - 1) + cardWidth;

    // Center alignment with half card width offset
    const startX = -totalWidth / 2 + cardWidth / 2;

    // Position this card
    const x = startX + index * visibleCardWidth;

    // Y position (flat)
    const y = 0;

    // Z-stacking (cards to the left appear on top)
    const z = -index * 0.01;

    return [x, y, z];
  }

  /**
   * Calculate the rotation for a card based on its index and total cards
   *
   * @param index - Index of the card in the collection
   * @param totalCards - Total number of cards
   * @returns [x, y, z] rotation angles in radians
   */
  function getCardRotation(index: number, totalCards: number): [number, number, number] {
    // Default upward tilt for all cards
    const tiltX = -0.08;

    // Slight fan effect when many cards
    const fanRotation = totalCards > 5 ? (index - totalCards / 2) * 0.01 : 0;

    return [tiltX, fanRotation, 0];
  }

  return {
    getCardPosition,
    getCardRotation,
    cardDimensions,
    cardPadding,
  };
}
