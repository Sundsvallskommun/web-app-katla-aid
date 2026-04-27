import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@config': resolve(__dirname, 'src/config'),
      '@controllers': resolve(__dirname, 'src/controllers'),
      '@dtos': resolve(__dirname, 'src/dtos'),
      '@exceptions': resolve(__dirname, 'src/exceptions'),
      '@interfaces': resolve(__dirname, 'src/interfaces'),
      '@middlewares': resolve(__dirname, 'src/middlewares'),
      '@models': resolve(__dirname, 'src/models'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
    },
  },
});
