import babel from 'rollup-plugin-babel'

export default {
  input: './src/server.js',
  output: [
    { file: './dist/server.js', format: 'esm' },
    { file: './dist/server.common.js', format: 'cjs' },
    { file: './dist/server.iife.js', format: 'iife', name: 'PackageManager' },
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true
    })
  ]
};
