module.exports = {
  '*.{js,jsx,ts,tsx}': (files) => {
    const filtered = files.filter((f) => !f.includes('/joyvet-modern/') && !f.includes('/out/'));
    if (filtered.length === 0) return [];
    return [`eslint --cache --ignore-path .eslintignore ${filtered.join(' ')}`];
  },
  '{*.json,.{babelrc,eslintrc,prettierrc,stylelintrc}}': [
    'prettier --ignore-path .eslintignore --parser json --write',
  ],
  '*.{css,scss}': [
    'prettier --ignore-path .eslintignore --single-quote --write',
  ],
  '*.{html,md,yml}': [
    'prettier --ignore-path .eslintignore --single-quote --write',
  ],
};
