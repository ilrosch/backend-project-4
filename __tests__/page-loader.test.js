// @ts-check

import nock from 'nock';
import { fileURLToPath } from 'url';
import os from 'os';
import path from 'path';
import fsp from 'fs/promises';
import {
  beforeAll, beforeEach, describe, expect, it,
} from '@jest/globals';

import loader from '../index.js';

nock.disableNetConnect();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (name) => path.join(__dirname, '..', '__fixtures__', name);

const filename = 'ru-hexlet-io-test.html';

let expected;
let dirpath;

beforeAll(async () => {
  expected = await fsp.readFile(getFixturePath(filename), 'utf-8');
});

beforeEach(async () => {
  dirpath = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

describe('page-loader: ', () => {
  it('should be loaded the page', async () => {
    nock(/ru\.hexlet\.io/)
      .get(/\/test/)
      .reply(200, expected);

    await loader('https://ru.hexlet.io/test', dirpath);

    const filepath = `${dirpath}/${filename}`;
    const actual = await fsp.readFile(filepath, 'utf-8');

    expect(actual).toBe(expected);
  });
});
