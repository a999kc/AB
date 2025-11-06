# Скрипт для форматирования всего проекта
Write-Host "Форматирование Backend..." -ForegroundColor Cyan
cd backend
npm run format
cd ..

Write-Host "Форматирование Frontend..." -ForegroundColor Cyan
cd frontend
npm run format
cd ..

Write-Host "Форматирование корневых файлов..." -ForegroundColor Cyan
npx prettier --write "*.yml" "*.md" --ignore-path .prettierignore

Write-Host "Форматирование завершено!" -ForegroundColor Green

