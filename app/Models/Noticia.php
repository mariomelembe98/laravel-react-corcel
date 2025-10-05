<?php

namespace App\Models;

use Corcel\Model\Post as Corcel;
use Illuminate\Database\Eloquent\Model;

class Noticia extends Corcel
{
    protected $table = 'posts';

    protected $fillable = [
        'post_title',
        'post_content',
        'post_excerpt',
        'post_status',
        'post_author',
        'post_date',
        'post_date_gmt',
        'post_modified',
        'post_modified_gmt',
        'post_type',
    ];

    public function getRouteKeyName()
    {
        return 'ID';
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'post_author');
    }

    public function scopePublished($query)
    {
        return $query->where('post_status', 'publish')->where('post_type', 'post');
    }

    public function scopeRecent($query, $limit = 5)
    {
        return $query->published()->orderBy('post_date', 'desc')->limit($limit);
    }
}
