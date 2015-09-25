FROM node:0.12

RUN apt-get update
RUN apt-get install postgresql-client-9.4 --yes
RUN apt-get install python2.7
RUN curl -O https://bootstrap.pypa.io/get-pip.py
RUN python get-pip.py
RUN pip install awscli
RUN npm install bower -g
