<?php

use App\Http\Controllers\ComentarioController;
use App\Http\Controllers\NoticiaController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

//Route::get('/', function () {
//    return Inertia::render('welcome');
//})->name('home');

Route::get('/', [NoticiaController::class, 'index']);
// Pagina de pesquisa precisa vir antes da rota dinamica de posts
Route::get('/posts/search', [NoticiaController::class, 'search'])->name('posts.search');

Route::get('/posts/{slug}', [NoticiaController::class, 'show'])->name('posts.show');

// Pagina por categoria
Route::get('/categoria/{slug}', [NoticiaController::class, 'byCategory'])->name('posts.byCategory');

Route::middleware('auth')->group(function () {
    Route::post('/comments', [ComentarioController::class, 'store'])->name('comments.store');
});

Route::prefix('api')->group(function () {
    Route::get('/categories/{slug}/preview', [NoticiaController::class, 'categoryPreview'])
        ->name('api.category.preview');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

