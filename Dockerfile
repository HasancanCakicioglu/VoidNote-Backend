# Node.js 20.12.0 sürümünü temel alın
FROM node:20.12.0-alpine

# Çalışma dizinini oluştur ve belirle
WORKDIR /usr/src/app

# package.json ve package-lock.json dosyalarını çalışma dizinine kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Uygulama kodunu çalışma dizinine kopyala
COPY . .

# Uygulamanın çalışacağı portu belirt
EXPOSE 3000

# Uygulamayı başlat
CMD ["npm", "start"]