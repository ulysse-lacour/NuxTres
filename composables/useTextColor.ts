import { computed } from "vue";
import type { ComputedRef } from "vue";

export function useTextColor(color: string | (() => string)): ComputedRef<string> {
  return computed(() => {
    // Get the background color
    const bgColor = typeof color === "function" ? color() : color;

    // Remove # if present
    const colorHex = bgColor.replace("#", "");

    // Parse RGB components
    const r = parseInt(colorHex.substring(0, 2), 16);
    const g = parseInt(colorHex.substring(2, 4), 16);
    const b = parseInt(colorHex.substring(4, 6), 16);

    // Calculate brightness (weighted RGB)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Return black for light backgrounds, white for dark backgrounds
    return brightness > 128 ? "#000000" : "#ffffff";
  });
}
