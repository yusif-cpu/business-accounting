<?php

namespace App\Policies;

use App\Models\Operation;
use App\Models\User;

class OperationPolicy
{
    public function view(
        User $user,
        Operation $operation
    ): bool {
        return $user->business_id === $operation->business_id;
    }

    public function update(
        User $user,
        Operation $operation
    ): bool {
        return $user->business_id === $operation->business_id;
    }

    public function delete(
        User $user,
        Operation $operation
    ): bool {
        return $user->business_id === $operation->business_id;
    }
}