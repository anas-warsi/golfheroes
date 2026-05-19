<?php

namespace Database\Seeders;

use App\Models\Charity;
use App\Models\CharityContribution;
use Illuminate\Database\Seeder;

class DemoCharitiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $demoCharities = [
            [
                'name' => 'First Tee Youth Golf Foundation',
                'description' => 'Helping underprivileged children build confidence, discipline, and life skills through golf education and mentorship programs.',
                'image_url' => 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=800&q=80',
                'is_featured' => true,
            ],
            [
                'name' => 'Green Fairways Environmental Trust',
                'description' => 'Supporting sustainable golf course development, tree plantation drives, and eco-friendly sports initiatives worldwide.',
                'image_url' => 'https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&w=800&q=80',
                'is_featured' => false,
            ],
            [
                'name' => 'Veterans Golf Recovery Program',
                'description' => 'Providing rehabilitation, therapy, and wellness support to military veterans through adaptive golf experiences.',
                'image_url' => 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80',
                'is_featured' => true,
            ],
            [
                'name' => 'Junior Champions Sports Fund',
                'description' => 'Funding sports training, equipment, and tournament opportunities for talented young athletes from low-income families.',
                'image_url' => 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
                'is_featured' => false,
            ],
        ];

        foreach ($demoCharities as $data) {
            // Prevent duplicate seeding
            $charity = Charity::where('name', $data['name'])->first();
            if (!$charity) {
                $charity = Charity::create([
                    'name' => $data['name'],
                    'description' => $data['description'],
                    'image_url' => $data['image_url'],
                    'is_featured' => $data['is_featured'],
                ]);
            } else {
                $charity->update([
                    'description' => $data['description'],
                    'image_url' => $data['image_url'],
                    'is_featured' => $data['is_featured'],
                ]);
            }
        }
    }
}
