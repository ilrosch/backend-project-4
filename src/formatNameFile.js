export default (url) => {
  const name = `${url.hostname}${url.pathname}`;
  const format = name.replace(/[/._]/g, '-');
  return `${format}.html`;
};
