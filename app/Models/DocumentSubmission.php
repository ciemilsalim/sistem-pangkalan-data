<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_request_id',
        'teacher_id',
        'file_path',
        'file_name',
        'submitted_url',
        'status',
        'feedback',
        'submitted_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    public function documentRequest()
    {
        return $this->belongsTo(DocumentRequest::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }
}
