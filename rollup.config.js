import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';

export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/drive.js',
    format: 'es'
  },
  plugins: [
    commonjs(),
    resolve(),
    typescript()
  ]
}