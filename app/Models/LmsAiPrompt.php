<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LmsAiPrompt extends Model
{
    protected $table = 'lms_ai_prompts';

    protected $fillable = [
        'teacher_id',
        'key',
        'name',
        'description',
        'prompt_text',
        'placeholders'
    ];

    protected $casts = [
        'placeholders' => 'array'
    ];

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }
}
