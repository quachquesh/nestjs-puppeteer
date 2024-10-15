FROM --platform=linux/amd64 node:20

RUN npm config set registry https://registry.npmjs.org/
RUN npm cache clean --force

# Install necessary dependencies for running Chrome
RUN apt-get update && apt-get install -y \
  htop \
  wget \
  curl \
  gnupg \
  ca-certificates \
  apt-transport-https \
  xvfb \
  && rm -rf /var/lib/apt/lists/*

# Install Chrome
# RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
#   && apt-get -y install ./google-chrome-stable_current_amd64.deb \
#   && rm google-chrome-stable_current_amd64.deb

# Install Google Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo "deb [arch=amd64] https://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
  && apt-get update \
  && apt-get install -y google-chrome-stable \
  && rm -rf /var/lib/apt/lists/*

# set work directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm update
RUN npm install

# copy project
COPY . .

CMD ["npm", "run", "start:dev"]