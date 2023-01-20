FROM node:18-alpine3.16

WORKDIR /usr/app

COPY --chown=node:node package*.json ./

COPY prisma ./usr/app/prisma/

COPY --chown=node:node . .

COPY .env ./usr/app/

COPY tsconfig.json ./usr/app/

RUN npx prisma generate

RUN npm install

RUN npm run build

CMD ["npm", "run", "start"]