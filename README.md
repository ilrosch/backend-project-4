# Page-Loader

[![Actions Status](https://github.com/ilrosch/backend-project-4/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/ilrosch/backend-project-4/actions) [![Page-Loader](https://github.com/ilrosch/backend-project-4/actions/workflows/page-loader.yml/badge.svg)](https://github.com/ilrosch/backend-project-4/actions/workflows/page-loader.yml) [![Maintainability](https://api.codeclimate.com/v1/badges/41e0c671115fb341f594/maintainability)](https://codeclimate.com/github/ilrosch/backend-project-4/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/41e0c671115fb341f594/test_coverage)](https://codeclimate.com/github/ilrosch/backend-project-4/test_coverage)

PageLoader is a command line utility that downloads pages from the internet and saves them on your computer. Together with the page it downloads all resources (images, styles and js) allowing to open the page without internet.

## Install

Clone the repository to yourself locally:

```bash
  npm ci
  # or make install
```

Install the necessary packages:

```bash
  git clone git@github.com:ilrosch/backend-project-4.git
  # or git clone https://github.com/ilrosch/backend-project-4.git
```

Create symlink:

```bash
  npm link
```

## Usage

```bash
  # default output is process.cwd()

  page-loader --help
  Usage: page-loader [options] <url>

  Page loader utility

  Options:
    -V, --version      output the version number
    -o --output [dir]  output dir (default: "/home/user/current-dir")
    -h, --help         display help for command
```

Example:

```bash
  page-loader --output /var/tmp https://ru.hexlet.io/courses
  /var/tmp/ru-hexlet-io-courses.html # path to the downloaded file
```

## Demo

[![asciicast](https://asciinema.org/a/IDl1uxLYrCUbhXIFPwWO7iTwm.svg)](https://asciinema.org/a/IDl1uxLYrCUbhXIFPwWO7iTwm)
