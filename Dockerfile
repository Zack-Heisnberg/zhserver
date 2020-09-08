FROM ubuntu
RUN  apt-get update \
     && apt-get install -y wget gnupg ca-certificates curl zip sudo wget \
     && curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash - \
     && sudo apt-get install -y nodejs \
     && sudo apt-get install -y libgbm-dev gconf-service libasound2 libatk1.0-0 libatk-bridge2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils \
     && curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add - \
     && echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list \
     && sudo apt-get update && sudo apt-get install yarn
EXPOSE 8080 443 22 80     
CMD sudo mkdir /app/ && cd /app/ && wget https://github.com/Zack-Heisnberg/zhserver/raw/master/build.zip \
    && unzip build.zip \
    && yarn install \
    && node index.js \
