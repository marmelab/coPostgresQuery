FROM node:4.1.2

RUN apt-get update
RUN apt-get install postgresql-client-9.4 --yes
