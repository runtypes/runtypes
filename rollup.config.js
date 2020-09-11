import { sizeSnapshot } from 'rollup-plugin-size-snapshot';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

export default {
  input: {
    index: 'src/index.ts',
    // contracts: 'src/contracts.ts',
  },
  output: [
    {
      dir: 'lib/',
      entryFileNames: '[name].js',
      format: 'cjs',
    },
    {
      dir: 'lib/',
      entryFileNames: '[name].mjs',
      chunkFileNames: '[name]-[hash].mjs',
      format: 'es',
    },
  ],
  external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
  plugins: [
    sizeSnapshot(),
    typescript({
      typescript: require('typescript'),
    }),
  ],
};
