FROM webdevops/php-apache:8.4

WORKDIR /app

COPY . /app

ENV WEB_DOCUMENT_ROOT=/app/public

RUN composer install --no-dev --optimize-autoloader

RUN php artisan storage:link || true

RUN chown -R application:application /app/storage
RUN chown -R application:application /app/bootstrap/cache

EXPOSE 80