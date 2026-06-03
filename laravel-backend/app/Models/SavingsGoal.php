<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SavingsGoal extends Model
{
    use HasFactory;

    // Use name matching the table correctly
    protected $table = 'savings_goals';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'userId',
        'name',
        'targetAmount',
        'currentAmount',
        'deadline',
        'notes'
    ];

    protected $casts = [
        'targetAmount' => 'float',
        'currentAmount' => 'float',
        'deadline' => 'date:Y-m-d'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'userId', 'id');
    }
}
