FROM php:8.3-apache

RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    libpq-dev \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev

RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    mbstring \
    zip \
    exif \
    pcntl \
    bcmath

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN chown -R www-data:www-data storage bootstrap/cache
RUN chmod -R 775 storage bootstrap/cache

RUN a2enmod rewrite

COPY apache.conf /etc/apache2/sites-available/000-default.conf

EXPOSE 80

CMD php artisan config:cache && \
    php artisan route:cache && \
    php artisan migrate --force && \
    php artisan storage:link || true && \
    apache2-foreground