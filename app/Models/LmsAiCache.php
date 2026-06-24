<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LmsAiCache extends Model
{
    protected $table = 'lms_ai_caches';

    protected $fillable = [
        'prompt_hash',
        'prompt_type',
        'input_params',
        'generated_response'
    ];

    protected $casts = [
        'input_params' => 'array'
    ];
}
