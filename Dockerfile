FROM python:3.10-alpine as nickwademe
WORKDIR /app
COPY requirements.txt /app
RUN pip install -r requirements.txt
COPY . /app
CMD ["gunicorn", "-w 4", "-b 0.0.0.0:80", "app:app"]
