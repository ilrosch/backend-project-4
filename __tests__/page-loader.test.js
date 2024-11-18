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

const dirNameFiles = 'ru-hexlet-io-courses_files';

const files = {
  before: {
    path: 'ru.hexlet-courses.io',
    data: '',
  },

  after: {
    path: 'ru-hexlet-io-courses.html',
    data: '',
  },

  image: {
    path: path.join(dirNameFiles, 'ru-hexlet-io-assets-professions-nodejs.png'),
    data: '',
  },

  html: {
    path: path.join(dirNameFiles, 'ru-hexlet-io-courses.html'),
    data: '',
  },

  css: {
    path: path.join(dirNameFiles, 'ru-hexlet-io-assets-application.css'),
    data: '',
  },

  js: {
    path: path.join(dirNameFiles, 'ru-hexlet-io-packs-js-runtime.js'),
    data: '',
  },
};

beforeAll(async () => {
  const prs = Object.keys(files).map((key) => (
    readFile(getFixturePath(files[key].path), 'utf-8')
  ));

  const results = await Promise.all(prs);

  Object.keys(files).forEach((key, i) => {
    files[key].data = results[i];
  });
});

beforeEach(async () => {
  dirpath = await mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

describe('page-loader: ', () => {
  it('should be loaded the page and files', async () => {
    // Mocking page and assets
    nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(200, files.before.data);

    nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(200, files.html.data);

    nock('https://ru.hexlet.io')
      .get('/assets/application.css')
      .reply(200, files.css.data);

    nock('https://ru.hexlet.io')
      .get('/assets/professions/nodejs.png')
      .reply(200, files.image.data);

    nock('https://ru.hexlet.io')
      .get('/packs/js/runtime.js')
      .reply(200, files.js.data);

    // result in console
    const pathHtmlFile = path.join(dirpath, files.after.path);
    await expect(loader('https://ru.hexlet.io/courses', dirpath)).resolves.toBe(pathHtmlFile);

    // html testing
    const actualHtml = await readFile(pathHtmlFile, 'utf-8');
    expect(actualHtml).toBe(files.after.data);

    // directory for files
    const pathFilesDir = path.join(dirpath, dirNameFiles);
    await expect(access(pathFilesDir, constants.F_OK)).resolves.toBeUndefined();

    // link testing (html / css)
    const pathHtmlLink = path.join(dirpath, files.html.path);
    await expect(access(pathHtmlLink, constants.F_OK)).resolves.toBeUndefined();
    await expect(readFile(pathHtmlLink, 'utf-8')).resolves.toBe(files.html.data);

    const pathCssLink = path.join(dirpath, files.css.path);
    await expect(access(pathCssLink, constants.F_OK)).resolves.toBeUndefined();
    await expect(readFile(pathCssLink, 'utf-8')).resolves.toBe(files.css.data);

    // image testing
    const pathImageFile = path.join(dirpath, files.image.path);
    await expect(access(pathImageFile, constants.F_OK)).resolves.toBeUndefined();

    // script
    const pathJsFile = path.join(dirpath, files.js.path);
    await expect(access(pathJsFile, constants.F_OK)).resolves.toBeUndefined();
    await expect(readFile(pathJsFile, 'utf-8')).resolves.toBe(files.js.data);
  });
});
