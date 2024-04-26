FROM python:3.11
ENV PYTHONBUFFERED 1

RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
	git \
	pkg-config \
	default-libmysqlclient-dev \
	&& rm -rf /var/lib/apt/lists/*


WORKDIR /database

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

EXPOSE 8000
