FROM ubuntu:focal

RUN apt-get update
RUN apt-get install -y curl 
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
RUN apt-get upgrade -y
RUN nvm install 22
RUN node -v 
RUN npm -v

RUN apt-get install git -y

WORKDIR /home/app
COPY main.sh main.sh
COPY script.js script.js
COPY package*.json .

RUN npm install

RUN chmod +x main.sh
RUN chmod +x script.js

CMD ["/home/app/main.sh"]