'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const { exec } = require('child_process');

const command = [
  '$(npm bin)/prettier',
  process.env.CI ? '--list-different' : '--write',
  '"./**/*.{ts,tsx,js,json,css}"',
];

exec(command.join(' '), (error, stdout) => {
  if (error) {
    console.error('Found formatting issues in:\n');
    console.error(stdout);
    console.error('Looks like someone forgot to run `yarn format` before pushing 😱');
    process.exit(1);
  }
});
