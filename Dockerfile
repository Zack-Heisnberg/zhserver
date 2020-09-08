FROM ubuntu
RUN  apt-get update \
     && apt-get install -y wget gnupg ca-certificates curl zip sudo \
     && curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash - \
     && sudo apt-get install -y nodejs \
     && sudo apt-get install -y chromium-browser \
     && curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add - \
     && echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list \
     && sudo apt-get update && sudo apt-get install yarn \
CMD mkdir /app/ && cd /app/ && wget https://github.com/Zack-Heisnberg/zhserver/raw/master/build.zip \
    && unzip build.zip \
    && yarn install \
    && node index.js \
