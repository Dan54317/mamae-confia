<?php
require_once('pagseguro-config.php');

$items = json_decode($_POST['carrinho'], true);

$data = [
    'email' => PAGSEGURO_EMAIL,
    'token' => PAGSEGURO_TOKEN,
    'currency' => 'BRL',
];

foreach ($items as $i => $item) {
    $n = $i + 1;
    $data["itemId$n"] = $item['id'];
    $data["itemDescription$n"] = $item['name'];
    $data["itemAmount$n"] = number_format($item['price'], 2, '.', '');
    $data["itemQuantity$n"] = $item['quantity'];
}

$url = PAGSEGURO_SANDBOX
    ? 'https://ws.sandbox.pagseguro.uol.com.br/v2/checkout'
    : 'https://ws.pagseguro.uol.com.br/v2/checkout';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$xml = simplexml_load_string($response);
echo json_encode(['code' => (string)$xml->code]);
?>
