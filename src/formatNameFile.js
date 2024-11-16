import path from 'path';

export default (url) => {
  const { hostname, pathname } = url;
  const extname = path.extname(pathname) || '.html';
  const formatPath = path.join(hostname, pathname.replace(extname, '')).replace(/[/._]/g, '-');
  return `${formatPath}${extname}`;
};
