import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

import formatNameFile from './formatNameFile.js';

const fsp = fs.promises;

const mapping = {
  link: 'href',
  script: 'src',
  img: 'src',
};

export default (url, output) => {
  const currentURL = new URL(url);
  const htmlFileName = formatNameFile(currentURL);
  const pathFilesDir = `${htmlFileName.slice(0, -5)}_files`;

  return axios.get(currentURL)
    .then(({ data }) => {
      const $ = cheerio.load(data);
      const downloadFiles = [];
      Object.entries(mapping).forEach(([tagName, tagAttr]) => (
        $(tagName).each((_i, element) => {
          const serverURL = new URL($(element).attr(tagAttr), currentURL.origin);

          if (currentURL.hostname !== serverURL.hostname) {
            return;
          }

          const localPath = path.join(pathFilesDir, formatNameFile(serverURL));
          const fullLocalPath = path.join(output, localPath);

          $(element).attr(tagAttr, localPath);

          downloadFiles.push({ type: tagName, server: serverURL.href, local: fullLocalPath });
        })
      ));

      const minifyHtml = $.html().split('\n').map((el) => el.trim()).join('');

      return { html: minifyHtml, downloadFiles };
    })
    .then(({ html, downloadFiles }) => {
      fs.mkdir(path.join(output, pathFilesDir), () => { });

      const fullLocalPathHtml = path.join(output, htmlFileName);
      const prHtml = fsp.writeFile(fullLocalPathHtml, html);
      const prFiles = downloadFiles.map(({ type, server, local }) => (
        axios({
          method: 'get',
          url: server,
          responseType: (type === 'img') ? 'stream' : 'json',
          validateStatus: (status) => status >= 200,
        })
          .then(({ data }) => (
            (type === 'img') ? data.pipe(fs.createWriteStream(local)) : fsp.writeFile(local, data)
          ))
      ));

      Promise.all([prHtml, ...prFiles]);
      return fullLocalPathHtml;
    });
};
