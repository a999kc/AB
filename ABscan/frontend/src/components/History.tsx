import { useState } from "react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchScans } from "../services/ax";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowUpDown } from "lucide-react";

interface Scan {
  id: number;
  user: number;
  isAb: boolean;
  createdAt: string;
}

const scansQueryOptions = () => {
  return queryOptions({
    queryKey: ["scans"],
    queryFn: fetchScans,
  });
};

const History = () => {
  const [searchId, setSearchId] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const query = useQuery(scansQueryOptions());

  const { isLoading, isError, data } = query;

  const scansData: Scan[] = data || [];

  const filteredScans = scansData.filter((scan) => {
    if (!searchId) return true;
    return scan.id === Number(searchId);
  });

  const sortedScans = [...filteredScans].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === "asc"
        ? Number(a.isAb) - Number(b.isAb)
        : Number(b.isAb) - Number(a.isAb);
    }
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>Ошибка при загрузке данных</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">История сканов</CardTitle>
          <CardDescription>Просмотр и фильтрация всех выполненных сканов</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="number"
              placeholder="Поиск по ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full sm:w-40"
            />

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as "date" | "status")}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Сортировать по..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">По дате</SelectItem>
                <SelectItem value="status">По статусу</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="w-full sm:w-auto"
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {sortOrder === "asc" ? "По возрастанию" : "По убыванию"}
            </Button>
          </div>

          {sortedScans.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID скана</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата создания</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedScans.map((scan) => (
                    <TableRow key={scan.id} className="hover:bg-muted/50 cursor-pointer">
                      <TableCell>
                        <Link
                          to="/scan/$id"
                          params={{ id: scan.id }}
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {scan.id}
                        </Link>
                      </TableCell>
                      <TableCell>{scan.user}</TableCell>
                      <TableCell>
                        <Badge variant={scan.isAb ? "destructive" : "default"}>
                          {scan.isAb ? "Ab" : "Default"}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(scan.createdAt), "dd MMM yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">История сканов пуста</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
