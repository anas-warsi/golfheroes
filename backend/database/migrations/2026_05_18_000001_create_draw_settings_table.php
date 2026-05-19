<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('draw_settings')) {
            Schema::create('draw_settings', function (Blueprint $table) {
                $table->id();
                $table->timestamp('next_draw_date')->nullable();
                $table->timestamps();
            });
        }

        // Seed default row: May 31, 2026 at 8:00 PM
        \DB::table('draw_settings')->updateOrInsert(
            ['id' => 1],
            [
                'next_draw_date' => '2026-05-31 20:00:00',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('draw_settings');
    }
};
