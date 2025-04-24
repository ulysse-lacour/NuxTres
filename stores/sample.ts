interface State {
  count: number;
}

export const useSampleStore = defineStore("sampleStore", {
  state: (): State => ({
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

  getters: {
    getCount(): number {
      return this.count;
    },
  },
});
