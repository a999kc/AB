import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { detectEnhancedGoLogin } from "../services/detection";
import { createUser, createScan } from "../services/ax";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, User, Loader2, Fingerprint } from "lucide-react";

interface DetectionResult {
  verdict: boolean;
  score: number;
  flags: { name: string; info?: any }[];
}

const USER_ID_KEY = "userId";

const Home = () => {
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: userId,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ["userId"],
    queryFn: async () => {
      const existingUser = localStorage.getItem(USER_ID_KEY);
      if (existingUser) return existingUser;

      const user = await createUser();
      localStorage.setItem(USER_ID_KEY, user.id.toString());
      return user.id.toString();
    },
    staleTime: Infinity,
    retry: 1,
  });

  const createScanMutation = useMutation({
    mutationFn: (data: { user: number; isAb: boolean }) => createScan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scans"] });
    },
    onError: (error: any) => {
      if (error.response?.status === 404) {
        localStorage.removeItem(USER_ID_KEY);
        queryClient.setQueryData(["userId"], null);
      }
    },
  });

  useEffect(() => {
    const handleBeforeUnload = () => localStorage.removeItem(USER_ID_KEY);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleRunScan = async () => {
    if (!userId) return;

    setIsScanning(true);
    setResult(null);

    try {
      const data = await detectEnhancedGoLogin();
      setResult(data);

      await createScanMutation.mutateAsync({
        user: Number(userId),
        isAb: Boolean(data.verdict),
      });
    } catch (err) {
      console.error("Ошибка при выполнении проверки:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const isLoading = createScanMutation.isPending || isScanning;
  const error = createScanMutation.error || userError;

  return (
    <div className="min-h-screen bg-Linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-2xl mx-auto mt-12">
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">

          <CardContent className="space-y-6 pt-6">
           
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Пользователь</span>
              </div>
              {isUserLoading ? (
                <span className="text-xs text-muted-foreground">Загрузка...</span>
              ) : userId ? (
                <Badge variant="secondary" className="font-mono">
                  ID: {userId}
                </Badge>
              ) : null}
            </div>

            
            {result && !isLoading && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <div className={`rounded-xl p-6 text-center border-2 transition-all ${
                  result.verdict
                    ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                    : "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                }`}>
                  <div className="flex flex-col items-center gap-3">
                    {result.verdict ? (
                      <>
                        <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
                        <h3 className="text-xl font-bold text-red-700 dark:text-red-300">Антидетект обнаружен</h3>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                        <h3 className="text-xl font-bold text-green-700 dark:text-green-300">Чистый браузер</h3>
                      </>
                    )}
                  </div>
                </div>

               
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Уровень подозрительности</span>
                    <span className="font-mono font-bold">{result.score}%</span>
                  </div>
                  <Progress 
                    value={result.score} 
                    className={`h-3 ${
                      result.score > 70 ? "bg-red-100" : result.score > 30 ? "bg-yellow-100" : "bg-green-100"
                    }`}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {result.score > 70 ? "Высокий риск" : result.score > 30 ? "Средний риск" : "Низкий риск"}
                  </p>
                </div>
              </div>
            )}

            
            {error && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Ошибка</AlertTitle>
                <AlertDescription>
                  {(error as any)?.response?.status === 404
                    ? "Пользователь не найден. Обновите страницу."
                    : (error as any)?.response?.data?.message || "Не удалось выполнить проверку"}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-6 pb-8">
            <Button
              onClick={handleRunScan}
              disabled={isLoading || isUserLoading || !userId}
              size="lg"
              className="w-full max-w-md mx-auto shadow-lg transition-all hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Сканирование...
                </>
              ) : (
                <>
                  <Fingerprint className="mr-2 h-5 w-5" />
                  Запустить проверку
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Результат сохраняется в истории сканов
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Home;