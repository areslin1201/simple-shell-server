#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "====================================="
echo " Installing Server Dependencies..."
echo "====================================="
cd server
npm install
cd ..

echo ""
echo "====================================="
echo " Installing Client Dependencies..."
echo "====================================="
cd client
npm install
cd ..

echo ""
echo "====================================="
echo " Installation Complete! 🎉"
echo "====================================="
