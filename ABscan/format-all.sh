#!/bin/bash
# Скрипт для форматирования всего проекта

echo "Форматирование Backend..."
cd backend && npm run format && cd ..

echo "Форматирование Frontend..."
cd frontend && npm run format && cd ..

echo "Форматирование корневых файлов..."
npx prettier --write "*.yml" "*.md" --ignore-path .prettierignore

echo "Форматирование завершено!"

