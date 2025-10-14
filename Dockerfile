FROM node:lts-alpine@sha256:41e4389f3d988d2ed55392df4db1420ad048ae53324a8e2b7c6d19508288107e

RUN mkdir -p /var/task/

WORKDIR /var/task

COPY package.json package-lock.json /var/task/
RUN npm ci --production

COPY entrypoint.sh dist /var/task/

ENTRYPOINT ["/var/task/entrypoint.sh"]
