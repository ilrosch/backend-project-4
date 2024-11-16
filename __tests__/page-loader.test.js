// @ts-check

import nock from 'nock';
import { fileURLToPath } from 'url';
import os from 'os';
import path from 'path';
import { constants } from 'fs';
import { readFile, access, mkdtemp } from 'fs/promises';
import {
  beforeAll, beforeEach, describe, expect, it,
} from '@jest/globals';

import loader from '../index.js';

nock.disableNetConnect();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (name) => path.join(__dirname, '..', '__fixtures__', name);

let dirpath;

const files = {
  before: {
    path: 'ru.hexlet.io-courses',
    data: '',
  },

  after: {
    path: 'ru-hexlet-io-courses.html',
    data: '',
  },

  image: {
    path: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png',
    data: '',
  },

  dir: {
    path: 'ru-hexlet-io-courses_files',
  },
};

beforeAll(async () => {
  const pr1 = readFile(getFixturePath(files.before.path), 'utf-8');
  const pr2 = readFile(getFixturePath(files.after.path), 'utf-8');
  const pr3 = readFile(getFixturePath(files.image.path), 'utf-8');
  const data = await Promise.all([pr1, pr2, pr3]);
  [files.before.data, files.after.data, files.image.data] = data;
});

beforeEach(async () => {
  dirpath = await mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

describe('page-loader: ', () => {
  it('should be loaded the page and files', async () => {
    nock(/ru\.hexlet\.io/)
      .get(/\/courses/)
      .reply(200, files.before.data);

    nock(/ru\.hexlet\.io/)
      .get(/\/assets\/professions\/nodejs\.png/)
      .reply(200, files.image.data);

    const pathHtmlFile = path.join(dirpath, files.after.path);
    await expect(loader('https://ru.hexlet.io/courses', dirpath)).resolves.toBe(pathHtmlFile);

    // html testing
    const actualHtml = await readFile(pathHtmlFile, 'utf-8');
    expect(actualHtml).toBe(files.after.data);

    // directory for files
    const pathFilesDir = path.join(dirpath, files.dir.path);
    await expect(access(pathFilesDir, constants.F_OK)).resolves.toBeUndefined();

    // image testing
    const pathImageFile = path.join(dirpath, files.image.path);
    await expect(access(pathImageFile, constants.F_OK)).resolves.toBeUndefined();
  });
});
