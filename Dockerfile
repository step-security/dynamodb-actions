FROM node:25-alpine3.23@sha256:b9b5737eabd423ba73b21fe2e82332c0656d571daf1ebf19b0f89d0dd0d3ca93

RUN mkdir -p /var/task/

WORKDIR /var/task

COPY package.json package-lock.json /var/task/
RUN npm ci --production

COPY entrypoint.sh dist /var/task/

ENTRYPOINT ["/var/task/entrypoint.sh"]
