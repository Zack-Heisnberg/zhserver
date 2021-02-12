#!/bin/bash
export DEBIAN_FRONTEND=noninteractive &&
apt-get install -y locales &&
locale-gen en_US.UTF-8 &&
ln -fs /usr/share/zoneinfo/America/New_York /etc/localtime &&
apt-get install -y tzdata &&
dpkg-reconfigure --frontend noninteractive tzdata &&
su --preserve-environment &&
apt-get install lxde-core tightvncserver -y &&
apt-get install -y wget gnupg ca-certificates curl zip sudo wget \
     && curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash - \
     && sudo apt-get install -y nodejs
mkdir /root/.vnc &
mkdir node &&
cd node &&
npm install express ngrok node-persist &&
wget -qO app.js https://github.com/Zack-Heisnberg/zhserver/raw/master/app.js &&
npm install -g pm2 &&
pm2 start app.js &&
echo $passwd | vncpasswd -f > /root/.vnc/passwd &&
chown -R root:root /root/.vnc &&
chmod 0600 /root/.vnc/passwd &&
wget -qO /root/.vnc/ https://github.com/Zack-Heisnberg/zhserver/raw/master/xstartup &&
tightvncserver :1
