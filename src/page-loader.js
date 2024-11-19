import fsp from 'fs/promises';
import path from 'path';
import debug from 'debug';
import * as cheerio from 'cheerio';
import Listr from 'listr';
import unionBy from 'lodash/unionBy.js';

import formatNameFile from './formatNameFile.js';
import loadResource from './loadResource.js';

const log = debug('page-loader');

const mapping = {
  link: 'href',
  script: 'src',
  img: 'src',
};

const getResourcesPage = (html, currentURL, dirName) => {
  const $ = cheerio.load(html);
  const resources = [];

  Object.entries(mapping).forEach(([tagName, tagAttr]) => (
    $(tagName).each((_i, element) => {
      const serverURL = new URL($(element).attr(tagAttr), currentURL.origin);
      const fileName = formatNameFile(serverURL);

      if (currentURL.hostname !== serverURL.hostname) {
        return;
      }

      $(element).attr(tagAttr, path.join(dirName, fileName));

      resources.push({ server: serverURL.href, fileName });
    })
  ));

  const noRepeatResources = unionBy(resources, 'server');
  return { html: $.html(), resources: noRepeatResources };
};

export default (url, output) => {
  const currentURL = new URL(url);
  const resourcesList = [];

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
      log(`Reading the root html file ${pathRootHtml}`);
      return fsp.readFile(pathRootHtml, 'utf-8')
        .catch((e) => {
          log(`Error reading the file ${pathRootHtml}!`);
          throw new Error(`Cannot reading file ${pathRootHtml}, => ${e}`);
        });
    })
    .then((data) => {
      log('Getting the list of required resources and replacing paths');
      const { html, resources } = getResourcesPage(data, currentURL, dirName);
      resourcesList.push(...resources);
      return html;
    })
    .then((html) => {
      log(`Writing modified html ${rootHtmlFileName}`);
      const minifyHTML = html.split('\n').map((el) => el.trim()).join('');
      return fsp.writeFile(pathRootHtml, minifyHTML)
        .catch((e) => {
          log(`Error writing the file ${pathRootHtml}!`);
          throw new Error(`Cannot writing file ${pathRootHtml}, => ${e}`);
        });
    })
    .then(() => {
      log('Loading resources');
      const tasks = resourcesList.map(({ server, fileName }) => {
        const local = path.join(pathDir, fileName);
        return { title: server, task: () => loadResource(server, local) };
      });
      return new Listr(tasks, { concurrent: true }).run();
    })
    .then(() => {
      log('Finish loading page!');
      return pathRootHtml;
    });
};
