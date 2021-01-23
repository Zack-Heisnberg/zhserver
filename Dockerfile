# Copyright (c) 2012-2018 Red Hat, Inc.
# This program and the accompanying materials are made
# available under the terms of the Eclipse Public License 2.0
# which is available at https://www.eclipse.org/legal/epl-2.0/
#
# SPDX-License-Identifier: EPL-2.0
#
# Contributors:
#   Red Hat, Inc. - initial API and implementation

FROM ubuntu:16.04

RUN apt-get update && \
    apt-get -y install locales rsync openssh-server sudo procps wget unzip mc ca-certificates curl software-properties-common bash-completion && \
    mkdir /var/run/sshd && \
    sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd && \
    echo "%sudo ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers && \
    useradd -u 1000 -G users,sudo,root -d /home/user --shell /bin/bash -m user && \
    usermod -p "*" user
RUN apt-get install sudo curl wget p7zip-full -y && curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash - && sudo apt-get install -y nodejs
ENV LANG en_GB.UTF-8
ENV LANG en_US.UTF-8
COPY ["entrypoint.sh","/home/user/entrypoint.sh"]
RUN sudo chmod a+x /home/user/entrypoint.sh
RUN sudo chmod -R 777 /usr/lib/node_modules
USER user
RUN sudo locale-gen en_US.UTF-8 && \
    cd /home/user && ls -la
EXPOSE 22 4403 8080
WORKDIR /projects

# The following instructions set the right
# permissions and scripts to allow the container
# to be run by an arbitrary user (i.e. a user
# that doesn't already exist in /etc/passwd)
ENV HOME /home/user
COPY ["entrypoint.sh","/home/user/entrypoint.sh"]
RUN sudo chmod a+x /home/user/entrypoint.sh
RUN for f in "/home/user" "/etc/passwd" "/etc/group" "/projects"; do\
           sudo chgrp -R 0 ${f} && \
           sudo chmod -R g+rwX ${f}; \
        done && \
        # Generate passwd.template \
        cat /etc/passwd | \
        sed s#user:x.*#user:x:\${USER_ID}:\${GROUP_ID}::\${HOME}:/bin/bash#g \
        > /home/user/passwd.template && \
        # Generate group.template \
        cat /etc/group | \
        sed s#root:x:0:#root:x:0:0,\${USER_ID}:#g \
        > /home/user/group.template && \
        sudo sed -ri 's/StrictModes yes/StrictModes no/g' /etc/ssh/sshd_config
ENTRYPOINT ["/home/user/entrypoint.sh"]
CMD tail -f /dev/null
