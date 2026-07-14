<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LmsCapaianPembelajaran extends Model
{
    use HasFactory;

    protected $table = 'lms_capaian_pembelajaran';

    protected $fillable = [
        'kode',
        'fase',
        'elemen',
        'subject_id',
        'deskripsi',
    ];

    /**
     * Relasi ke model Subject (Mata Pelajaran)
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }
}
