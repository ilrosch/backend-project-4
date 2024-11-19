import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdtemp, readFile } from 'fs/promises';
import {
  beforeEach, describe, expect, it,
} from '@jest/globals';
import nock from 'nock';

import loadResource from '../src/loadResource.js';

nock.disableNetConnect();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (name) => path.join(__dirname, '..', '__fixtures__', name);

const mock = 'https://ru.hexlet.io/';

let currentDir;

beforeEach(async () => {
  currentDir = await mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

describe('loadResource', () => {
  it.each([
    ['ru-hexlet-io-courses.html', '/courses'],
    ['ru-hexlet-io-packs-js-runtime.js', '/packs/js/runtime.js'],
    ['ru-hexlet-io-assets-application.css', '/assets/application.css'],
    ['ru-hexlet-io-assets-professions-nodejs.png', '/assets/professions/nodejs.png'],
  ])('should be loaded resource %s from %s', async (fileName, filePath) => {
    const currentPath = getFixturePath(fileName);
    const currentData = await readFile(currentPath, 'utf-8');
    nock(mock).get(filePath).reply(200, currentData);
    const serverURL = path.join(mock, filePath);
    const localURL = path.join(currentDir, fileName);
    await loadResource(serverURL, localURL);
    const actualData = await readFile(localURL, 'utf-8');
    expect(actualData).toBe(currentData);
  });

  it('should be throw error', async () => {
    nock(mock).get('/courses').reply(404);
    await expect(loadResource(path.join(mock, '/courses'), currentDir)).rejects
      .toThrowError('Cannot loading resource from https:/ru.hexlet.io/courses');
  });
});
