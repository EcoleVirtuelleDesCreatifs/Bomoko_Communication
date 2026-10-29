<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    protected $primaryKey = 'slug';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['slug', 'label', 'sort'];

    public function articles()
    {
        return $this->hasMany(Article::class, 'region_slug', 'slug');
    }
}
