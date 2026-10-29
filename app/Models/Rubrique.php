<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rubrique extends Model
{
    protected $primaryKey = 'slug';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['slug', 'label', 'tagline', 'in_menu', 'sort'];

    public function articles()
    {
        return $this->hasMany(Article::class, 'rubrique_slug', 'slug');
    }
}
