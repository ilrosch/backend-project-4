import fs from 'fs';
import axios from 'axios';
import debug from 'debug';
import { pipeline } from 'node:stream/promises';

const log = debug('axios');

export default (serverURL, localURL) => {
  log(`Starting loading resource from ${serverURL} to ${localURL}`);
  return axios({
    method: 'get',
    url: serverURL,
    responseType: 'stream',
    validateStatus: (status) => status >= 200,
  })
    .then(({ data }) => pipeline(data, fs.createWriteStream(localURL)))
    .then(() => log('Finish loading resource!'))
    .catch((e) => { throw e; });
};
