FROM node:10

# Create app directory
WORKDIR /usr/interviewer

# Install app dependencies (package.json and package-lock.json)
COPY package*.json ./

RUN npm i

COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]