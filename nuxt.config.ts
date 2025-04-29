// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",

  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  app: {
    head: {
      title: "Nuxt 3 + TresJS starter",
      meta: [
        {
          name: "description",
          content: "Starter template for Nuxt 3 + TresJS created by Francesco Michelini",
        },
      ],
    },
    pageTransition: { name: "page", mode: "out-in" },
  },

  css: ["@/assets/css/index.scss"],

  modules: [
    "@nuxt/devtools",
    "@nuxt/eslint",
    "@tresjs/nuxt",
    [
      "@nuxtjs/google-fonts",
      {
        prefetch: true,
        preconnect: true,
        preload: true,
        download: true,
        families: {
          "Maven+Pro": [400, 500, 700],
        },
        display: "swap",
      },
    ],
    [
      "@pinia/nuxt",
      {
        autoImports: ["defineStore", "acceptHMRUpdate"],
      },
    ],
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@vueuse/nuxt",
  ],

  components: [
    {
      path: "@/components",
      pathPrefix: false,
      global: true,
    },
  ],

  imports: {
    // Auto-import pinia stores defined in `~/stores`
    dirs: ["stores"],

    imports: [
      {
        from: "tailwind-variants",
        name: "tv",
      },
      {
        from: "tailwind-variants",
        name: "VariantProps",
        type: true,
      },
    ],
  },

  tres: {
    devtools: true,
    glsl: true,
  },

  eslint: {
    config: {
      stylistic: false,
    },
  },

  postcss: {
    plugins: {
      "tailwindcss/nesting": {},
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  tailwindcss: {
    exposeConfig: true,
    editorSupport: true,
  },

  colorMode: {
    classSuffix: "",
    preference: "system", // default value of $colorMode.preference
    fallback: "light", // fallback value if no system preference found
    storage: "localStorage",
  },

  // Performance optimizations
  experimental: {
    asyncContext: true,
    payloadExtraction: true,
    renderJsonPayloads: true,
    typedPages: true,
    headNext: true,
    componentIslands: true,
  },

  // Cache optimization
  vite: {
    build: {
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      include: ["three", "@tresjs/core", "@tweakpane/core"],
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
    },
    compressPublicAssets: true,
  },
});
