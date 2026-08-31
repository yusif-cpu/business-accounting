<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Business;
use App\Models\SaleStatus;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'business_name' => ['required', 'string', 'max:255'],
            'password' => $this->passwordRules(),
        ])->validate();

        return DB::transaction(function () use ($input) {
            $business = Business::create([
                'business_name' => $input['business_name'],
            ]);

            SaleStatus::create([
                'business_id' => $business->id,
                'name' => 'Pending',
                'slug' => 'pending',
                'is_default' => true,
            ]);

            SaleStatus::create([
                'business_id' => $business->id,
                'name' => 'Paid',
                'slug' => 'paid',
                'is_default' => false,
            ]);

            SaleStatus::create([
                'business_id' => $business->id,
                'name' => 'Cancelled',
                'slug' => 'cancelled',
                'is_default' => false,
            ]);

            return User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
                'business_id' => $business->id,
            ]);
        });
    }
}
