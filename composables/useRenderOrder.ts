/**
 * Composable for calculating render orders in different card layouts
 *
 * This handles determining which cards render on top of others for various
 * layout arrangements like hand, wall, or deck.
 */
export function useRenderOrder() {
  /**
   * Calculate render order for cards in a hand-like arrangement
   * Cards at the edges should render on top of cards in the middle
   *
   * @param index - Card index
   * @param totalCards - Total number of cards
   * @returns Render order (higher values render on top)
   */
  function calculateHandRenderOrder(index: number, totalCards: number): number {
    if (totalCards <= 1) return 1000;

    // Find center index
    const centerIndex = (totalCards - 1) / 2;

    // Calculate distance from center (0 = center, higher values = closer to edges)
    const distanceFromCenter = Math.abs(index - centerIndex);

    // Normalize the distance to a 0-1 range
    const normalizedDistance = distanceFromCenter / centerIndex;

    // Convert to a render order where higher values (edges) render on top
    // Scale to a high base value (1000) to ensure proper stacking
    return 1000 + Math.floor(normalizedDistance * 100);
  }

  return {
    calculateHandRenderOrder,
  };
}
