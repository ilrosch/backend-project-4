// @ts-check

import nock from 'nock';
import { fileURLToPath } from 'url';
import os from 'os';
import path from 'path';
import { readFile, mkdtemp } from 'fs/promises';
import {
  beforeAll,
  beforeEach, describe, expect, it,
} from '@jest/globals';

import loader from '../index.js';

nock.disableNetConnect();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (name) => path.join(__dirname, '..', '__fixtures__', name);

const mock = 'https://ru.hexlet.io/';

let before;
let after;

let currentDir;

beforeAll(async () => {
  const prBefore = readFile(getFixturePath('ru.hexlet-courses.io'), 'utf-8');
  const prAfter = readFile(getFixturePath('ru-hexlet-io-courses.html'), 'utf-8');
  [before, after] = await Promise.all([prBefore, prAfter]);
});

beforeEach(async () => {
  currentDir = await mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

describe('page-loader: ', () => {
  it('should be loaded page', async () => {
    nock(mock).get('/courses').reply(200, before);
    nock(mock).get('/courses').reply(200, '');
    nock(mock).get('/packs/js/runtime.js').reply(200, '');
    nock(mock).get('/assets/application.css').reply(200, '');
    nock(mock).get('/assets/professions/nodejs.png').reply(200, '');

    await loader(path.join(mock, '/courses'), currentDir);

    const pathHTML = path.join(currentDir, 'ru-hexlet-io-courses.html');
    const actualData = await readFile(pathHTML, 'utf-8');
    expect(actualData).toBe(after);
  });

  it('should be throw error: path to site', async () => {
    nock(mock).get('/courses').reply(404);
    await expect(loader(path.join(mock, '/courses'), currentDir)).rejects
      .toThrowError('Cannot loading resource from https://ru.hexlet.io/courses');
  });

  it('should be throw error: path to dir', async () => {
    nock(mock).get('/courses').reply(200, 'test');
    await expect(loader(path.join(mock, '/courses'), '/undefined')).rejects
      .toThrowError("no such file or directory, open '/undefined/ru-hexlet-io-courses.html");
  });
});
