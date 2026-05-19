<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SelectCharityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'charity_id' => ['required', 'exists:charities,id'],
            'charity_percentage' => ['required', 'numeric', 'min:10', 'max:100'],
        ];
    }
}
