<?php

namespace App\Policies;

use App\Models\Expense;
use App\Models\User;

class ExpensePolicy
{
    public function view(User $user, Expense $expense): bool
    {
        return $user->business_id === $expense->business_id;
    }

    public function update(User $user, Expense $expense): bool
    {
        return $user->business_id === $expense->business_id;
    }

    public function delete(User $user, Expense $expense): bool
    {
        return $user->business_id === $expense->business_id;
    }
}
