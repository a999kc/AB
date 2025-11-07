import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { detectEnhancedGoLogin } from "../services/detection";
import { createUser, createScan } from "../services/ax";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, User } from "lucide-react";

interface DetectionResult {
  verdict: boolean;
  score: number;
  flags: { name: string; info?: any }[];
}

const USER_ID_KEY = "userId";

const Home = () => {
  const [result, setResult] = useState<DetectionResult | null>(null);
  const queryClient = useQueryClient();

  // Получаем или создаём пользователя
  const {
    data: userId,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ["userId"],
    queryFn: async () => {
      const existingUser = localStorage.getItem(USER_ID_KEY);
      if (existingUser) {
        return existingUser;
      }
      // Создаём нового пользователя
      const user = await createUser();
      localStorage.setItem(USER_ID_KEY, user.id.toString());
      return user.id.toString();
    },
    staleTime: Infinity, // userId не меняется
    retry: 1,
  });

  // Мутация для создания скана
  const createScanMutation = useMutation({
    mutationFn: (data: { user: number; isAb: boolean }) => createScan(data),
    onSuccess: () => {
      // Инвалидируем кеш сканов, чтобы обновить историю
      queryClient.invalidateQueries({ queryKey: ["scans"] });
    },
    onError: (error: any) => {
      // Если пользователь не найден, очищаем userId
      if (error.response?.status === 404) {
        localStorage.removeItem(USER_ID_KEY);
        queryClient.setQueryData(["userId"], null);
      }
    },
  });

  // Очистка localStorage при закрытии вкладки
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem(USER_ID_KEY);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleRunScan = async () => {
    if (!userId) {
      return;
    }

    try {
      // Выполняем детекцию
      const data = await detectEnhancedGoLogin();
      setResult(data);

      // Создаём запись о скане
      // Явно преобразуем verdict в boolean для гарантии правильного типа
      await createScanMutation.mutateAsync({
        user: Number(userId),
        isAb: Boolean(data.verdict),
      });
    } catch (err) {
      console.error("Ошибка при выполнении проверки:", err);
    }
  };

  const isLoading = createScanMutation.isPending;
  const error = createScanMutation.error || userError;

  return (
    <Card className="w-full max-w-lg mx-auto mt-10 shadow-md border border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
          <User className="text-sky-500" /> GoLogin Detection
        </CardTitle>
      </CardHeader>

      <CardContent className="text-center space-y-4">
        {isUserLoading && <p className="text-xs text-gray-400">Инициализация пользователя...</p>}
        {userId && <p className="text-xs text-gray-500">Активный пользователь ID: {userId}</p>}

        {result && !isLoading && (
          <div className="space-y-3 mt-4">
            {result.verdict ? (
              <div className="flex flex-col items-center text-red-600">
                <AlertTriangle size={40} className="mb-1" />
                <p className="font-semibold text-lg">Антидетект</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-green-600">
                <CheckCircle2 size={40} className="mb-1" />
                <p className="font-semibold text-lg">Обычный браузер</p>
              </div>
            )}
            <p className="text-gray-500 text-sm">Score: {result.score}</p>
          </div>
        )}

        {error && (
          <p className="text-red-500 font-medium">
            {(error as any)?.response?.status === 404
              ? "Пользователь не найден. Пожалуйста, обновите страницу."
              : (error as any)?.response?.data?.message || "Ошибка при выполнении проверки"}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex justify-center">
        <Button
          onClick={handleRunScan}
          disabled={isLoading || isUserLoading || !userId}
          className="w-full max-w-xs"
        >
          {isLoading ? "Сканирование..." : "Запустить проверку"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Home;
