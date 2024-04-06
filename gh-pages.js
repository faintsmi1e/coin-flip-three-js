import { publish } from 'gh-pages';

publish(
  'dist', // path to public directory
  {
    branch: 'gh-pages',
    repo: 'git@github.com:faintsmi1e/coin-flip-three-js.git', // Update to point to your repository
    dotfiles: true,
  },
  () => {
    console.log('Deploy Complete!');
  }
);
