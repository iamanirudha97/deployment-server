FROM ubuntu

RUN apt update -y
RUN apt install nodejs -y
RUN node -v
RUN apt install npm -y
RUN apt-get install git -y

WORKDIR /home/app
COPY main.sh main.sh
COPY script.js script.js
COPY package*.json .

RUN npm install

RUN chmod +x main.sh
RUN chmod +x script.js

CMD ["/home/app/main.sh"]