import { computed } from "vue";
import type { Ref } from "vue";

/**
 * Composable for positioning cards on a wall/grid layout
 *
 * @param viewportWidth - The reactive viewport width
 * @returns Functions for positioning cards on the wall
 */
export function useWallLayout(viewportWidth: Ref<number>) {
  /**
   * Card layout configuration - responsive based on viewport
   */
  const layoutConfig = computed(() => {
    // Base values
    const baseCardWidth = 3.0;
    const baseCardHeight = 3.5;

    // Responsive scaling
    const scaleFactor = Math.min(Math.max(viewportWidth.value / 15, 0.7), 1.2);

    // Calculate cards per row based on viewport - more cards on wider screens
    const cardsPerRow = viewportWidth.value > 15 ? 5 : 4;

    // Calculate spacing
    const horizontalSpacing = baseCardWidth * scaleFactor * 1.1;
    const verticalSpacing = baseCardHeight * scaleFactor * 1.1;

    return {
      cardsPerRow,
      horizontalSpacing,
      verticalSpacing,
      scaleFactor,
    };
  });

  /**
   * Calculate position for a card on the wall display
   * Organizes cards in a grid pattern
   *
   * @param index - Card index
   * @param totalCards - Total cards on wall
   * @returns [x, y, z] position coordinates
   */
  function getWallPosition(index: number, totalCards: number): [number, number, number] {
    if (totalCards === 0) return [0, 0, 0];

    const config = layoutConfig.value;

    // Calculate grid position
    const row = Math.floor(index / config.cardsPerRow);
    const col = index % config.cardsPerRow;

    // Center the grid horizontally
    const rowWidth = Math.min(totalCards - row * config.cardsPerRow, config.cardsPerRow);
    const rowOffset = (config.cardsPerRow - rowWidth) / 2;

    // Calculate final position
    const x = (col - (config.cardsPerRow - 1) / 2 + rowOffset) * config.horizontalSpacing;
    const y = -row * config.verticalSpacing;

    // Small z offset for visual distinction
    const z = index * 0.01;

    return [x, y, z];
  }

  /**
   * Get the appropriate scale factor for wall cards
   */
  const wallCardScale = computed(() => {
    const scale = layoutConfig.value.scaleFactor * 0.9;
    return [scale, scale, scale] as [number, number, number];
  });

  return {
    getWallPosition,
    wallCardScale,
    layoutConfig,
  };
}
