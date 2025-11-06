import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { fetchScan, deleteScan } from "../services/ax";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "./ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "./ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { format } from "date-fns";

const scanQueryOptions = (scanId: number) => {
  return queryOptions({
    queryKey: ["scan", scanId],
    queryFn: () => fetchScan(scanId),
  });
};

const ScanComponent = () => {
  const { id } = useParams({ from: "/scan/$id" });
  const scanId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const query = useQuery(scanQueryOptions(scanId));

  const { data: scan, isLoading, isError } = query;

  const mutation = useMutation({
    mutationFn: () => deleteScan(scanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scans"] });
      navigate({ to: "/history" });
    },
    onError: (error) => {
      console.error("Ошибка при удалении скана:", error);
    },
  });

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  if (isError || !scan) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <Alert className="h-5 w-5" />
            <p>Скан не найден или произошла ошибка</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Скан {scan.id}</h1>
          <Badge variant={scan.isAb ? "destructive" : "default"}>
            {scan.isAb ? "Ab" : "Default"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Создано: {format(new Date(scan.createdAt), "d MMMM yyyy, HH:mm")}
        </p>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-muted-foreground">ID скана</p>
            <p className="font-medium text-lg">{scan.id}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Пользователь</p>
            <p className="font-medium text-lg">{scan.user}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="destructive"
          className="flex-1"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Удаление..." : "Удалить скан"}
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => navigate({ to: "/history" })}>
          Назад к истории
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ScanComponent;
