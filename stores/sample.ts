export const useSampleStore = defineStore("sampleStore", {
  state: (): SampleState => ({
    count: 0,
  }),

  actions: {
    increment(): void {
      this.count++;
    },

    decrement(): void {
      this.count--;
    },
  },
});
