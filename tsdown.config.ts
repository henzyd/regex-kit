import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  // Both module systems are published, so a CommonJS consumer is not forced onto
  // dynamic import(). The smoke script loads each one from a packed tarball.
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  platform: 'neutral'
});
