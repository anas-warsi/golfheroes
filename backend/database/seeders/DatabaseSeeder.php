<?php

namespace Database\Seeders;

use App\Models\Charity;
use App\Models\Draw;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create 5 Charities
        $charities = [
            ['name' => 'Cancer Research UK', 'description' => 'Pioneering research to bring forward the day when all cancers are cured.', 'is_featured' => true],
            ['name' => 'Save the Children', 'description' => 'Helping children stay safe, healthy and learning.', 'is_featured' => true],
            ['name' => 'British Heart Foundation', 'description' => 'Funding research into heart and circulatory diseases.', 'is_featured' => false],
            ['name' => 'RSPCA', 'description' => 'Preventing cruelty and promoting kindness to animals.', 'is_featured' => false],
            ['name' => 'Age UK', 'description' => 'Providing companionship, advice and support for older people.', 'is_featured' => false],
        ];

        foreach ($charities as $charityData) {
            Charity::create($charityData);
        }

        // Admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@golfheroes.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'subscription_status' => 'active',
            'subscription_plan' => 'yearly',
            'subscription_renewal_date' => now()->addYear(),
            'charity_id' => 1,
            'charity_percentage' => 10,
        ]);

        // Test user
        User::create([
            'name' => 'John Doe',
            'email' => 'john@test.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'subscription_status' => 'active',
            'subscription_plan' => 'monthly',
            'subscription_renewal_date' => now()->addMonth(),
            'charity_id' => 2,
            'charity_percentage' => 15,
        ]);

        // 1 Published Draw
        Draw::create([
            'draw_date' => now()->subDays(5)->toDateString(),
            'numbers' => [12, 18, 24, 31, 7],
            'status' => 'published',
            'jackpot_amount' => 5000.00,
            'jackpot_rollover' => false,
        ]);
    }
}
