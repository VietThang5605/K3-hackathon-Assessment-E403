FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY . .

EXPOSE 8000

ENV PORT 8000
ENV NODE_ENV production

CMD ["node", "src/server.js"]
