<?php
/**
 * IMTEN — обработчик формы заявок.
 * Шлёт сообщение в Telegram-чат через Bot API + дублирует email.
 *
 * POST JSON или form-data.
 * Поля: name, contact, message, source, website (honeypot).
 *
 * Секреты — в /api/.env (см. .env.example).
 * Лог попыток — в /api/log/requests.log (создаётся автоматически).
 *
 * Зависимости: только PHP 8.0+ и расширения curl, mbstring, json.
 */

declare(strict_types=1);
ini_set('display_errors', '0');
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

// --- 1. CORS-предохранитель: разрешаем только свой домен ---
$allowed_origins = ['https://imten.ru', 'https://www.imten.ru', 'http://localhost:4321'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Метод не поддерживается', 405);
}

// --- 2. Загрузка .env (простой парсер) ---
$env_path = __DIR__ . '/.env';
$env = [];
if (is_readable($env_path)) {
    foreach (file($env_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#')) continue;
        [$k, $v] = array_pad(explode('=', $line, 2), 2, '');
        $env[trim($k)] = trim($v, " \t\n\r\0\x0B\"'");
    }
}

$tg_token = $env['TG_BOT_TOKEN'] ?? '';
$tg_chat = $env['TG_CHAT_ID'] ?? '';
$mail_to = $env['MAIL_TO'] ?? 'i@imten.ru';
$mail_from = $env['MAIL_FROM'] ?? 'noreply@imten.ru';

if (!$tg_token || !$tg_chat) {
    log_msg('ERROR: .env not configured (TG_BOT_TOKEN или TG_CHAT_ID не заданы)');
    respond(false, 'Сервис временно недоступен. Напишите в Telegram @ilyalar.');
}

// --- 3. Парсим тело запроса ---
$ctype = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($ctype, 'application/json') !== false) {
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true) ?: [];
} else {
    $data = $_POST;
}

$name = trim((string)($data['name'] ?? ''));
$contact = trim((string)($data['contact'] ?? ''));
$message = trim((string)($data['message'] ?? ''));
$source = trim((string)($data['source'] ?? ''));
$honeypot = trim((string)($data['website'] ?? ''));

// --- 4. Honeypot ---
if ($honeypot !== '') {
    log_msg("SPAM (honeypot): ip={$_SERVER['REMOTE_ADDR']}");
    // Спокойно отвечаем «ок», чтобы бот не пытался снова
    respond(true, '');
}

// --- 5. Валидация ---
if (mb_strlen($name) < 2 || mb_strlen($name) > 80) {
    respond(false, 'Имя должно быть от 2 до 80 символов');
}
if (mb_strlen($contact) < 4 || mb_strlen($contact) > 80) {
    respond(false, 'Укажите телефон или Telegram-юзернейм');
}
if (mb_strlen($message) > 2000) {
    respond(false, 'Сообщение слишком длинное (макс. 2000 символов)');
}
// Минимальная проверка на формат контакта
if (!preg_match('/^[+\d\s()\-@a-zA-Z._]+$/u', $contact)) {
    respond(false, 'Контакт содержит недопустимые символы');
}

// --- 6. Rate-limit: не более 1 заявки/мин с одного IP ---
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$lock_dir = __DIR__ . '/log';
if (!is_dir($lock_dir)) @mkdir($lock_dir, 0755, true);
$lock_file = $lock_dir . '/rl_' . preg_replace('/[^a-z0-9]/i', '_', $ip);
if (file_exists($lock_file) && (time() - filemtime($lock_file)) < 60) {
    log_msg("RATE_LIMIT: ip=$ip");
    respond(false, 'Слишком часто. Попробуйте через минуту.');
}
@touch($lock_file);

// --- 7. Формируем сообщение для Telegram (MarkdownV2) ---
$src = $source ? "\nИсточник: " . md_escape($source) : '';
$msg = $message ? "\n\nЗадача:\n" . md_escape($message) : '';
$tg_text = "*Новая заявка с imten\\.ru*\n\n"
    . "Имя: " . md_escape($name) . "\n"
    . "Контакт: " . md_escape($contact)
    . $src
    . $msg
    . "\n\nIP: " . md_escape($ip)
    . "\nUA: " . md_escape(substr($_SERVER['HTTP_USER_AGENT'] ?? '-', 0, 80));

// --- 8. Отправка в Telegram через Bot API ---
$tg_ok = tg_send($tg_token, $tg_chat, $tg_text);
if (!$tg_ok) {
    log_msg("TG_FAIL: name=$name contact=$contact");
    // Не валим запрос — попробуем хотя бы email
}

// --- 9. Email (через mail() / TimeWeb SMTP) ---
$subject = '=?UTF-8?B?' . base64_encode('Новая заявка с imten.ru — ' . $name) . '?=';
$body = "Имя: $name\nКонтакт: $contact\nИсточник: $source\n\nЗадача:\n$message\n\nIP: $ip\nUA: " . ($_SERVER['HTTP_USER_AGENT'] ?? '-');
$headers = [
    'From: IMTEN <' . $mail_from . '>',
    'Reply-To: ' . $mail_from,
    'Content-Type: text/plain; charset=UTF-8',
    'MIME-Version: 1.0',
    'X-Mailer: imten-form/1.0',
];
$mail_ok = @mail($mail_to, $subject, $body, implode("\r\n", $headers));

// --- 10. Логируем ---
log_msg("OK: name=$name contact=$contact tg=" . ($tg_ok ? '1' : '0') . " mail=" . ($mail_ok ? '1' : '0'));

if (!$tg_ok && !$mail_ok) {
    respond(false, 'Не удалось отправить. Напишите напрямую в Telegram @ilyalar.');
}

respond(true, '');

// ====================================================================
// Helpers
// ====================================================================

function respond(bool $ok, string $error = '', int $code = 0): void {
    if ($code) http_response_code($code);
    elseif (!$ok) http_response_code(400);
    echo json_encode(['ok' => $ok, 'error' => $error], JSON_UNESCAPED_UNICODE);
    exit;
}

function tg_send(string $token, string $chat_id, string $text): bool {
    $url = "https://api.telegram.org/bot{$token}/sendMessage";
    $payload = [
        'chat_id' => $chat_id,
        'text' => $text,
        'parse_mode' => 'MarkdownV2',
        'disable_web_page_preview' => true,
    ];
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query($payload),
        CURLOPT_TIMEOUT => 10,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $r = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    if ($code !== 200) {
        log_msg("TG HTTP $code: " . substr((string)$r, 0, 300));
        return false;
    }
    $j = json_decode((string)$r, true);
    return (bool)($j['ok'] ?? false);
}

/** Escape Telegram MarkdownV2 special chars */
function md_escape(string $s): string {
    return preg_replace('/([_*\[\]()~`>#+\-=|{}.!])/u', '\\\\$1', $s);
}

function log_msg(string $line): void {
    $dir = __DIR__ . '/log';
    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    @file_put_contents($dir . '/requests.log', '[' . date('Y-m-d H:i:s') . '] ' . $line . "\n", FILE_APPEND);
}
