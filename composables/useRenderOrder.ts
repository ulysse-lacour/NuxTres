/**
 * Composable for calculating render orders in different card layouts
 *
 * This handles determining which cards render on top of others for various
 * layout arrangements like hand, wall, or deck.
 */
export function useRenderOrder() {
  // Cache for render order calculations
  const renderOrderCache = new Map<string, number>();

  /**
   * Calculate render order for cards in a hand-like arrangement
   * Cards at the edges should render on top of cards in the middle
   *
   * @param index - Card index
   * @param totalCards - Total number of cards
   * @returns Render order (higher values render on top)
   */
  function calculateHandRenderOrder(index: number, totalCards: number): number {
    // Return fixed value for single cards
    if (totalCards <= 1) return 1000;

    // Use cache for repeated calls with same parameters
    const cacheKey = `${index}-${totalCards}`;
    if (renderOrderCache.has(cacheKey)) {
      return renderOrderCache.get(cacheKey)!;
    }

    // Find center index
    const centerIndex = (totalCards - 1) / 2;

    // Calculate distance from center (0 = center, higher values = closer to edges)
    const distanceFromCenter = Math.abs(index - centerIndex);

    // Normalize the distance to a 0-1 range and scale to integer value
    // Base value 1000 ensures proper stacking
    const renderOrder = 1000 + Math.floor((distanceFromCenter / centerIndex) * 100);

    // Cache the result
    renderOrderCache.set(cacheKey, renderOrder);

    return renderOrder;
  }

  // Clear cache when no longer needed
  function clearCache() {
    renderOrderCache.clear();
  }

  return {
    calculateHandRenderOrder,
    clearCache,
  };
}
