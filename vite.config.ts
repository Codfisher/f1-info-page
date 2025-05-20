import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import removeConsole from 'vite-plugin-remove-console'
import VueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build'

  return {
    plugins: [
      VueRouter(),
      VueDevTools(),
      vue({
        template: { transformAssetUrls },
      }),

      quasar({
        sassVariables: 'src/style/quasar-variables.sass',
      }),

      removeConsole(),
    ],
    test: {
      environment: 'happy-dom',
      coverage: {
        reporter: ['html'],
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  }
})
