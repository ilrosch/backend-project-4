import fsp from 'fs/promises';
import path from 'path';
import debug from 'debug';
import * as cheerio from 'cheerio';

import formatNameFile from './formatNameFile.js';
import loadResource from './loadResource.js';

const log = debug('page-loader');

const mapping = {
  link: 'href',
  script: 'src',
  img: 'src',
};

const getResourcesPage = (html, currentURL, dirName, output) => {
  const $ = cheerio.load(html);
  const resources = [];
  Object.entries(mapping).forEach(([tagName, tagAttr]) => (
    $(tagName).each((_i, element) => {
      const serverURL = new URL($(element).attr(tagAttr), currentURL.origin);

      if (currentURL.hostname !== serverURL.hostname) {
        return;
      }

      const localPath = path.join(dirName, formatNameFile(serverURL));
      const fullLocalPath = path.join(output, localPath);

      $(element).attr(tagAttr, localPath);

      resources.push({ server: serverURL.href, local: fullLocalPath });
    })
  ));

  const minifyHtml = $.html().split('\n').map((el) => el.trim()).join('');

  return { html: minifyHtml, resources };
};

export default (url, output) => {
  const currentURL = new URL(url);

  const rootHtmlFileName = formatNameFile(currentURL);
  const pathRootHtml = path.join(output, rootHtmlFileName);

  const dirName = rootHtmlFileName.replace('.html', '_files');

  const pathDir = path.join(output, dirName);

  log(`Starting loading page from ${url} to ${output}`);
  return loadResource(currentURL, pathRootHtml)
    .then(() => {
      log(`Create directory for files ${pathDir}`);
      return fsp.mkdir(pathDir)
        .catch(() => { log(`Directory ${pathDir} already exists!`); });
    })
    .then(() => {
      log(`Reading the root file ${pathRootHtml}`);
      return fsp.readFile(pathRootHtml, 'utf-8');
    })
    .then((data) => {
      log('Get other resourse for page and change paths');
      return getResourcesPage(data, currentURL, dirName, output);
    })
    .then(({ html, resources }) => {
      log('Loading other resourse for page');
      const prHTML = fsp.writeFile(pathRootHtml, html);
      const prResources = resources.map(({ server, local }) => loadResource(server, local));
      return Promise.all([prHTML, ...prResources]);
    })
    .then(() => {
      log('Finish loading page!');
      return pathRootHtml;
    });
};
