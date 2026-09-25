<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

class LegalController extends Controller
{
    public function notice(): View
    {
        return view('legal.notice');
    }

    public function privacy(): View
    {
        return view('legal.privacy');
    }
}
