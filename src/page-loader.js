import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

import formatNameFile from './formatNameFile.js';

const fsp = fs.promises;

const mapping = {
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
          const serverURL = new URL(path.join(currentURL.origin, $(element).attr(tagAttr)));
          const localPath = path.join(pathFilesDir, formatNameFile(serverURL));
          const fullLocalPath = path.join(output, localPath);

          $(element).attr(tagAttr, localPath);

          downloadFiles.push({ server: serverURL.href, local: fullLocalPath });
        })
      ));

      return { html: $.html(), downloadFiles };
    })
    .then(({ html, downloadFiles }) => {
      fs.mkdir(path.join(output, pathFilesDir), () => { });

      const fullLocalPathHtml = path.join(output, htmlFileName);
      const prHtml = fsp.writeFile(fullLocalPathHtml, html);
      const prFiles = downloadFiles.map(({ server, local }) => (
        axios({
          method: 'get',
          url: server,
          responseType: 'stream',
          validateStatus: (status) => status >= 200,
        })
          .then(({ data }) => data.pipe(fs.createWriteStream(local)))
      ));

      Promise.all([prHtml, ...prFiles]);
      return fullLocalPathHtml;
    });
};
