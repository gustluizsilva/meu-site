<?php
/**
 * counter.php — endpoint simples de contagem de cópias de prompts.
 *
 * GET  -> retorna JSON com { "prompt-id-1": N, "prompt-id-2": M, ... }
 * POST -> body JSON { "id": "prompt-id" }; incrementa e retorna { count: novo_total }
 *
 * Os dados ficam em counters.json no mesmo diretório (excluído do deploy pra
 * não ser sobrescrito a cada push).
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');

$file = __DIR__ . '/counters.json';

// IDs aceitos: letras, números, hífen e underscore. Bloqueia path traversal
// ou qualquer caractere estranho vindo do cliente.
function id_valido($id) {
    return is_string($id) && strlen($id) > 0 && strlen($id) <= 80
        && preg_match('/^[a-zA-Z0-9_-]+$/', $id);
}

function ler_dados($file) {
    if (!file_exists($file)) return [];
    $raw = @file_get_contents($file);
    if ($raw === false || $raw === '') return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Aceita JSON no body (preferido) ou form-urlencoded como fallback
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) $input = $_POST;
    $id = isset($input['id']) ? $input['id'] : null;

    if (!id_valido($id)) {
        http_response_code(400);
        echo json_encode(['error' => 'invalid id']);
        exit;
    }

    // Atomicidade: lock exclusivo durante a leitura-modificação-escrita
    $fp = fopen($file, 'c+');
    if ($fp === false) {
        http_response_code(500);
        echo json_encode(['error' => 'cannot open data file']);
        exit;
    }

    if (flock($fp, LOCK_EX)) {
        rewind($fp);
        $contents = stream_get_contents($fp);
        $data = ($contents !== false && $contents !== '') ? json_decode($contents, true) : [];
        if (!is_array($data)) $data = [];

        if (!isset($data[$id]) || !is_int($data[$id])) $data[$id] = 0;
        $data[$id]++;

        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);

        echo json_encode(['success' => true, 'id' => $id, 'count' => $data[$id]]);
    } else {
        fclose($fp);
        http_response_code(500);
        echo json_encode(['error' => 'could not acquire lock']);
    }
    exit;
}

// GET (qualquer outro método cai aqui): apenas devolve as contagens
echo json_encode(ler_dados($file), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
