import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { config } from "dotenv";

// Загружаем .env только если файл существует (для локальной разработки)
// В Docker переменные окружения задаются напрямую
try {
  config({ path: "../../.env" });
} catch (e) {
  // Игнорируем ошибку, если файл не найден (работаем в Docker)
}

async function start() {
  const port = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);
  // Настройка CORS
  // Для тестирования разрешаем все origins (в production следует ограничить)
  app.enableCors({
    origin: true, // Разрешаем все origins для тестирования с GoLogin и другими браузерами
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Allow-Headers",
    ],
    credentials: true,
  });
  await app.listen(port, () => {
    console.log(`Server started on ${port} port`);
  });
}

start();
