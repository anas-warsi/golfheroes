FROM webdevops/php-apache:8.4

WORKDIR /app

COPY . /app

RUN composer install --no-dev --optimize-autoloader

RUN php artisan storage:link || true

EXPOSE 80