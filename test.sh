#!/bin/sh
su --preserve-environment
apt-get install lxde-core tightvncserver -y
apt-get install -y wget gnupg ca-certificates curl zip sudo wget \
     && curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash - \
     && sudo apt-get install -y nodejs
mkdir node
cd node
npm install express ngrok node-persist
myuser="root"
mypasswd="mysecret"
mkdir /home/$myuser/.vnc
echo $mypasswd | vncpasswd -f > /home/$myuser/.vnc/passwd
chown -R $myuser:$myuser /home/$myuser/.vnc
chmod 0600 /home/$myuser/.vnc/passwd
npm install -g pm2
wget -qO /home/$myuser/.vnc/xstartup https://github.com/Zack-Heisnberg/zhserver/raw/master/xstartup
tightvncserver :1
