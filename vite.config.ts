import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Custom plugin to ensure manifest.json is copied to dist
function copyManifestPlugin() {
  return {
    name: 'copy-extension-manifest',
    closeBundle() {
      const srcManifest = path.resolve(__dirname, 'manifest.json')
      const distManifest = path.resolve(__dirname, 'dist/manifest.json')
      if (fs.existsSync(srcManifest)) {
        if (!fs.existsSync(path.resolve(__dirname, 'dist'))) {
          fs.mkdirSync(path.resolve(__dirname, 'dist'), { recursive: true })
        }
        fs.copyFileSync(srcManifest, distManifest)
        console.log('✓ Copied manifest.json to dist/')
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), copyManifestPlugin()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        newtab: path.resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})

