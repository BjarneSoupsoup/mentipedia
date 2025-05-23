FROM python:3.12.10-slim-bullseye

WORKDIR /dbpopulator

RUN apt update && apt install -y libpq-dev build-essential

ADD requirements.txt .

RUN pip install -r requirements.txt

ADD main.py init.sql seeder.py lib.py ./
COPY ./assets ./assets

ENTRYPOINT ["python3", "main.py"]