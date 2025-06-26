#!/bin/sh
set -e

# Lancer l application Node.js
cd /app
node src/app.js

n8n execute --id "N43f6oGefV50KGZX"

#n8n start

#sleep 300