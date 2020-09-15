FROM ubuntu
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update
ENV TZ=Europe/Moscow
RUN apt-get install -y tzdata
RUN  DEBIAN_FRONTEND=noninteractive apt-get update \
     && apt-get install -y wget gnupg ca-certificates curl zip sudo wget \
     && curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash - \
     && sudo apt-get install -y nodejs python ffmpeg\
     && sudo apt-get install -y libgbm-dev gconf-service libasound2 libatk1.0-0 libatk-bridge2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils \
     && curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add - \
     && echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list \
     && sudo apt-get update && sudo apt-get install yarn
RUN apt-get install -y openssh-server
RUN mkdir /var/run/sshd
RUN echo 'root:zakaria123' | chpasswd
RUN sed -i 's/#*PermitRootLogin prohibit-password/PermitRootLogin yes/g' /etc/ssh/sshd_config
ENV NOTVISIBLE "in users profile"
RUN echo "export VISIBLE=now" >> /etc/profile

# SSH login fix. Otherwise user is kicked off after login
RUN sed -i 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' /etc/pam.d/sshd
 
EXPOSE 8080 443 22 80     
CMD ["/usr/sbin/sshd", "-D"]
CMD sudo mkdir /app/ && cd /app/ && wget https://github.com/Zack-Heisnberg/zhserver/raw/master/build.zip \
    && unzip build.zip \
    && yarn install \
    && sudo npm i -g pm2 \
    && pm2 start index.js --node-args='--expose-gc' \
    && pm2 logs
