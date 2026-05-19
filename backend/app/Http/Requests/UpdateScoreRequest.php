<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateScoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'score' => ['required', 'integer', 'min:1', 'max:45'],
            'date' => [
                'required',
                'date',
                Rule::unique('scores')->where(function ($query) {
                    return $query->where('user_id', $this->user()->id);
                })->ignore($this->route('score'))
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'date.unique' => 'A score already exists for this date.',
        ];
    }
}
