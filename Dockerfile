FROM node:19 AS app

WORKDIR /code

ADD package.json package-lock.json /code/

#RUN npm config set registry https://registry.npm.taobao.org \
#    && npm config set disturl https://npm.taobao.org/dist \
#    && npm config set puppeteer_download_host https://npm.taobao.org/mirrors
RUN  npm install

# Suppress an apt-key warning about standard out not being a terminal. Use in this script is safe.
ENV APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=DontWarn
# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update \
  && apt-get install -y wget gnupg \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-stable chromium xauth fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 xvfb \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

ADD . /code

#RUN npm run dev
CMD xvfb-run --server-args="-screen 0 1280x800x24 -ac -nolisten tcp -dpi 96 +extension RANDR" npm run dev
#CMD ["node", "lib/bundle.esm.js"]
