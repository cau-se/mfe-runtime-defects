// Only used when Tailwind runs through PostCSS. The Tailwind CLI (npm run
// build) ignores this file.
// NOTE: `export default` requires the file to be loaded as ESM. package.json
// declares "type": "commonjs", so rename this file to postcss.config.mjs
// before wiring Tailwind into a PostCSS pipeline.
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};