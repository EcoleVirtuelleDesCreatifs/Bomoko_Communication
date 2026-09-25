<?php

namespace App\Http\Requests;

use App\Models\MenuItem;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'price' => ['required_without:price_note', 'nullable', 'integer', 'min:0'],
            'price_note' => ['nullable', 'string', 'max:100'],
            'category' => ['required', 'string', Rule::in(array_keys(MenuItem::categories()))],
            'section' => ['nullable', 'string', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_active' => $this->boolean('is_active'),
            'sort_order' => $this->input('sort_order', 0),
            'price' => $this->input('price') === '' ? null : $this->input('price'),
            'price_note' => $this->filled('price_note') ? $this->input('price_note') : null,
            'section' => $this->filled('section') ? $this->input('section') : null,
        ]);
    }
}
