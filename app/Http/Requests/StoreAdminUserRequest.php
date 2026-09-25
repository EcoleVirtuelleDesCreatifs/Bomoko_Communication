<?php

namespace App\Http\Requests;

use App\Enums\AdminPermission;
use App\Enums\UserRole;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreAdminUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', Rule::enum(UserRole::class)],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => [Rule::enum(AdminPermission::class)],
            'password' => ['nullable', 'string', Password::min(8), 'confirmed', Rule::requiredIf(fn () => ! $this->boolean('generate_password'))],
            'generate_password' => ['nullable', 'boolean'],
            'send_credentials' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'generate_password' => $this->boolean('generate_password'),
            'send_credentials' => $this->boolean('send_credentials'),
            'is_active' => $this->boolean('is_active'),
        ]);
    }
}
