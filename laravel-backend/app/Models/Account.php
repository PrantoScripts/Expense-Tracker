<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'userId',
        'name',
        'type',
        'balance',
        'currency',
        'color'
    ];

    protected $casts = [
        'balance' => 'float'
    ];

    /**
     * Relationship: User owner
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'userId', 'id');
    }

    /**
     * Relationship: Transactions of this account
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'accountId', 'id');
    }
}
