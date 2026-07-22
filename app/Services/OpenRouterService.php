<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Setting;
use Exception;

class OpenRouterService
{
    protected string $baseUrl = 'https://openrouter.ai/api/v1';
    
    /**
     * Send a prompt to OpenRouter and return the generated text.
     * 
     * @param string $systemPrompt
     * @param string $userPrompt
     * @param \App\Models\User $user
     * @return string
     * @throws Exception
     */
    public function generate(string $systemPrompt, string $userPrompt, $user = null): string
    {
        // Ambil pengaturan dari tabel Setting
        $provider = Setting::where('key', 'global_ai_provider')->value('value') ?: 'openrouter';
        
        if ($provider !== 'openrouter') {
            throw new Exception("Penyedia AI global yang dipilih bukan OpenRouter.");
        }

        $apiKey = Setting::where('key', 'global_ai_api_key')->value('value');
        if (empty($apiKey)) {
            throw new Exception("API Key OpenRouter global tidak ditemukan. Harap hubungi Admin.");
        }

        // Tentukan model berdasarkan pengaturan global
        $model = Setting::where('key', 'global_ai_model')->value('value') ?: 'google/gemini-2.0-flash-exp:free';

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'HTTP-Referer' => config('app.url'), // Dibutuhkan oleh OpenRouter (opsional tapi disarankan)
                'X-Title' => config('app.name'), // Dibutuhkan oleh OpenRouter (opsional tapi disarankan)
            ])
            ->timeout(60) // Generasi AI bisa memakan waktu lama
            ->post($this->baseUrl . '/chat/completions', [
                'model' => $model,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userPrompt],
                ],
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['choices'][0]['message']['content'] ?? '';
            }

            // Tangani error dari API OpenRouter
            $errorDetail = $response->json('error.message') ?? $response->body();
            Log::error("OpenRouter API Error: " . $errorDetail);
            throw new Exception("Gagal menghubungi OpenRouter AI: " . $errorDetail);

        } catch (Exception $e) {
            Log::error("OpenRouterService Exception: " . $e->getMessage());
            throw new Exception($e->getMessage());
        }
    }
}
