#!/bin/sh
set -e

# Lancer l application Node.js
cd /app
node src/app.js

n8n execute --id "N43f6oGefV50KGZX"

cat result.txt > /iexec_out/result.txt
echo '{"deterministic-output-path": "/iexec_out/result.txt"}' > /iexec_out/computed.json

#n8n start

#sleep 300