<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecurringTransaction extends Model
{
    use HasFactory;

    protected $table = 'recurring_transactions';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'userId',
        'accountId',
        'type',
        'amount',
        'category',
        'note',
        'frequency',
        'nextDueDate',
        'isActive'
    ];

    protected $casts = [
        'amount' => 'float',
        'nextDueDate' => 'date:Y-m-d',
        'isActive' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'userId', 'id');
    }

    public function account()
    {
        return $this->belongsTo(Account::class, 'accountId', 'id');
    }
}
