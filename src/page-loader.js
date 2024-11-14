import axios from 'axios';
import fsp from 'fs/promises';
import formatNameFile from './formatNameFile.js';

export default (url, output) => {
  const currentUrl = new URL(url);
  const fileName = formatNameFile(currentUrl);
  const fullpath = `${output}/${fileName}`;

  return Promise.resolve()
    .then(() => axios.get(currentUrl))
    .then(({ data }) => fsp.writeFile(fullpath, data))
    .then(() => fullpath);
};
