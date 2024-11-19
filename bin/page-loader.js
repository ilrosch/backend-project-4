#!/usr/bin/env node

import { program } from 'commander';
import loader from '../index.js';

program
  .name('page-loader')
  .description('Page loader utility')
  .version('1.0.0')
  .argument('<url>')
  .option('-o --output [dir]', 'output dir', process.cwd())
  .action((url, options) => {
    loader(url, options.output)
      .then((path) => {
        console.log(`Page was successfully loaded into ${path}`);
      })
      .catch((e) => {
        console.error('Unsuccessful page loading:', e);
        process.exit(1);
      });
  })
  .parse();
