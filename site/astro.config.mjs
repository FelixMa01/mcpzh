import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://mcpzh.com',
  output: 'static',
  trailingSlash: 'never',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      cssCodeSplit: true,
    },
  },
});
