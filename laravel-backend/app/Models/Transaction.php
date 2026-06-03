<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'userId',
        'accountId',
        'type',
        'amount',
        'category',
        'date',
        'note',
        'attachment_name',
        'attachment_type',
        'attachment_dataUrl',
        'recurringId'
    ];

    protected $casts = [
        'amount' => 'float',
        'date' => 'date:Y-m-d'
    ];

    /**
     * Relationship: User owner
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'userId', 'id');
    }

    /**
     * Relationship: Account linked
     */
    public function account()
    {
        return $this->belongsTo(Account::class, 'accountId', 'id');
    }
}
