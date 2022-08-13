FROM node:16

# Create app directory
WORKDIR /usr/src/app
COPY . .

# Install app dependencies
RUN rm -rf /usr/src/app/node_modules
RUN npm install

CMD ["node", "app.js"]
