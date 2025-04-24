import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  ignores: ["**/node_modules/", "**/.nuxt/", "**/.output/"],
  rules: {
    "no-console": "off",
    "prettier/prettier": "off",
    "arrow-body-style": "off",
    "prefer-arrow-callback": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "off",
    "vue/multi-word-component-names": "off",
    semi: "off",
    "vue/html-self-closing": "off",
    "vue/v-on-style": "off",
    "vue/no-v-html": "off",
    "vue/require-default-prop": "off",
  },
});
