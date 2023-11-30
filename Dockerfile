FROM node:lts-alpine

RUN mkdir -p /var/task/

WORKDIR /var/task

COPY package.json package-lock.json /var/task/
RUN npm ci --production

COPY entrypoint.sh dist /var/task/

ENTRYPOINT ["/var/task/entrypoint.sh"]
