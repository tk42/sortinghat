FROM --platform=linux/amd64 ubuntu:latest

RUN apt-get update
RUN apt-get install -y python3-pip git
COPY . .
RUN pip install -r requirements.txt

