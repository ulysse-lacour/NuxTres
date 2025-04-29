import { computed, onMounted, ref } from "vue";

/**
 * Composable for dynamic card positioning and sizing based on viewport
 *
 * @param viewportWidth - Reactive viewport width reference
 * @param minCardSpacing - Minimum spacing between cards
 * @returns Functions and values for positioning and sizing cards
 */
export function useCardPositioning() {
  const viewport = ref<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  // Force refresh trigger
  const refreshTrigger = ref(0);

  // Initialize viewport on mount and window resize
  onMounted(() => {
    updateViewport();
    window.addEventListener("resize", updateViewport);
  });

  // Update viewport dimensions
  const updateViewport = () => {
    if (typeof window === "undefined") return;
    viewport.value = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  };

  // Force recalculation of all card positions
  const forceRefresh = () => {
    updateViewport();
    refreshTrigger.value++;
  };

  /**
   * Dynamically calculate card dimensions based on viewport width
   */
  const cardDimensions = computed(() => {
    // Base dimensions that will be scaled
    const baseWidth = 2.0;
    const baseHeight = 3.0;

    // Viewport-based scaling with min/max constraints
    const scaleFactor = Math.min(Math.max(viewport.value.width / 12, 0.5), 1.4);

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
    return Math.min(viewport.value.width * 0.015, 0.15);
  });

  /**
   * Calculate the overlap factor based on the number of cards
   */
  const calculateOverlapFactor = (cardCount: number, viewportWidth: number) => {
    // Increase minimum overlap to ensure cards never pack too tightly
    const minOverlap = 0.4;

    // Apply a more gradual scaling for card overlap
    const maxOverlap = Math.min(0.85, 0.65 + (viewportWidth < 768 ? 0.2 : 0));

    // Adjust overlap calculation to be more stable across viewport sizes
    let overlap: number;

    if (cardCount <= 1) {
      overlap = 0;
    } else if (cardCount <= 3) {
      overlap = 0.3;
    } else if (cardCount <= 5) {
      overlap = minOverlap + (cardCount - 3) * 0.05;
    } else {
      // More gradual increase for many cards
      overlap = Math.min(maxOverlap, minOverlap + (cardCount - 5) * 0.025);
    }

    return overlap;
  };

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
    const overlapFactor = calculateOverlapFactor(totalCards, viewport.value.width);

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

    // Z-stacking with natural hand-like effect
    // Calculate normalized position from center (0 = center, 1 = edge)
    const centerIndex = (totalCards - 1) / 2;
    const distanceFromCenter = Math.abs(index - centerIndex) / centerIndex;

    // Z value is highest (closest to 0) for cards on edges
    // Middle cards have lowest z-value (furthest back)
    const z = -0.08 + distanceFromCenter * 0.08;

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
    viewport,
    cardDimensions,
    cardPadding,
    calculateOverlapFactor,
    getCardPosition,
    getCardRotation,
    forceRefresh,
    refreshTrigger,
  };
}
