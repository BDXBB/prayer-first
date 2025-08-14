export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/esm/index.js',
      format: 'esm'
    },
    {
      file: 'dist/cjs/index.cjs',
      format: 'cjs'
    }
  ]
};
