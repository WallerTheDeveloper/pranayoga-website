import * as migration_20261114_135648_initial from './20261114_135648_initial';

export const migrations = [
  {
    up: migration_20261114_135648_initial.up,
    down: migration_20261114_135648_initial.down,
    name: '20261114_135648_initial'
  },
];
