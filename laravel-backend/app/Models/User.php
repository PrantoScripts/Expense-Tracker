<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Disable auto-incrementing primary key for custom string UUID string support
     */
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'name',
        'email',
        'password',
        'phone',
        'profilePhoto',
        'currency',
        'languagePreference',
        'themePreference',
        'timezone',
        'isAdmin'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'isAdmin' => 'boolean',
    ];

    /**
     * Relationship: accounts owned by user
     */
    public function accounts()
    {
        return $this->hasMany(Account::class, 'userId', 'id');
    }

    /**
     * Relationship: transactions owned by user
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'userId', 'id');
    }

    /**
     * Relationship: budgets registered by user
     */
    public function budgets()
    {
        return $this->hasMany(Budget::class, 'userId', 'id');
    }

    /**
     * Relationship: savings goals owned by user
     */
    public function savingsGoals()
    {
        return $this->hasMany(SavingsGoal::class, 'userId', 'id');
    }

    /**
     * Relationship: recurring rules owned by user
     */
    public function recurringTransactions()
    {
        return $this->hasMany(RecurringTransaction::class, 'userId', 'id');
    }

    /**
     * Relationship: system notifications owned by user
     */
    public function notifications()
    {
        return $this->hasMany(SystemNotification::class, 'userId', 'id');
    }
}
