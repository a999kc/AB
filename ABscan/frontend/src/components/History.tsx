import { useState } from "react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchScans } from "../services/ax";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";

import { Card, CardContent, CardHeader} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowUpDown, History as HistoryIcon, Search, Filter } from "lucide-react";
import type { FetchScansParams } from "../services/ax";

interface Scan {
  id: number;
  user: number;
  isAb: boolean;
  createdAt: string;
}

const scansQueryOptions = (params: FetchScansParams) => {
  return queryOptions({
    queryKey: ["scans", params],
    queryFn: () => fetchScans(params),
  });
};

const History = () => {
  const [searchId, setSearchId] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const queryParams = {
    ...(searchId && { searchId }),
    sortBy,
    sortOrder,
  };

  const query = useQuery(scansQueryOptions(queryParams));
  const { isLoading, isError, data } = query;
  const scans: Scan[] = Array.isArray(data) ? data : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-6xl mx-auto mt-8">
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-4 w-96 mx-auto mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Skeleton className="h-10 flex-1 sm:w-40" />
                <Skeleton className="h-10 flex-1 sm:w-48" />
                <Skeleton className="h-10 w-full sm:w-auto" />
              </div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>Не удалось загрузить историю сканов. Попробуйте позже.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-4">
      <div className="max-w-6xl mx-auto mt-8">
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">


          <CardContent className="space-y-6 pt-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              {/* Search by ID */}
              <div className="relative flex-1 sm:w-40">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="number"
                  placeholder="ID скана"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              {/* Sort by */}
              <div className="flex-1 sm:w-48">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as "date" | "status")}>
                  <SelectTrigger className="w-full">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Сортировать по..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">По дате</SelectItem>
                    <SelectItem value="status">По статусу</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort order */}
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="w-full sm:w-auto"
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                {sortOrder === "asc" ? "По возрастанию" : "По убыванию"}
              </Button>
            </div>

            {/* Table */}
            {scans.length > 0 ? (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Пользователь</TableHead>
                      <TableHead className="font-semibold">Статус</TableHead>
                      <TableHead className="font-semibold">Дата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scans.map((scan, index) => (
                      <TableRow
                        key={scan.id}
                        className={`transition-all hover:bg-muted/50 ${
                          index % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-muted/5"
                        }`}
                      >
                        <TableCell className="font-mono">
                          <Link
                            to="/scan/$id"
                            params={{ id: scan.id }}
                            className="text-primary font-medium hover:underline underline-offset-4"
                          >
                            #{scan.id}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {scan.user}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={scan.isAb ? "destructive" : "default"}
                            className="font-medium"
                          >
                            {scan.isAb ? "Антидетект" : "Обычный"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(scan.createdAt), "dd MMM yyyy, HH:mm")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-16 space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50">
                  <HistoryIcon className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-muted-foreground">
                  {searchId ? "Скан не найден" : "История пуста"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {searchId
                    ? `Скана с ID #${searchId} не существует.`
                    : "Здесь будут отображаться все ваши проверки браузера."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default History;