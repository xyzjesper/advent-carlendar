FROM node:21

WORKDIR /app

# Install app dependencies
COPY . /app
RUN cd /app && npm install -g npm@latest
RUN cd /app && npm install --force

CMD [ "npm", "run", "dev" ]