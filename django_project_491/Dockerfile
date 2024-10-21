FROM python:3.11

ENV PYTHONBUFFERED 1

WORKDIR /app

COPY ../requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# tells Django which port to use
EXPOSE 8000 

CMD ["python", "manage.py", "runserver"]

