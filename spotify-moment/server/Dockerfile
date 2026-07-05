FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

ENV HOST=0.0.0.0
ENV NODE_ENV=production

# Platform sets PORT (Koyeb=8000, Fly=8080, Railway=auto)
EXPOSE 3001

CMD ["npm", "start"]
