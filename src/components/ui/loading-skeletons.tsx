
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[200px]" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-[100px]" />
          <Skeleton className="h-8 w-[100px]" />
        </div>
      </div>
      <div className="border rounded-xl overflow-hidden">
        <div className="bg-muted/50 h-10 w-full flex items-center px-4 gap-4">
          {Array(cols).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array(rows).fill(0).map((_, i) => (
          <div key={i} className="h-12 w-full flex items-center px-4 gap-4 border-t">
            {Array(cols).fill(0).map((_, j) => (
              <Skeleton key={j} className="h-3 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardHomeSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="border-0 rounded-[2.5rem] shadow-xl bg-white overflow-hidden h-[400px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          <Skeleton className="h-full w-full rounded-none" />
          <div className="p-10 lg:p-16 space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-32 w-full rounded-[2rem]" />
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {Array(5).fill(0).map((_, i) => (
          <Card key={i} className="rounded-[2rem] overflow-hidden bg-white h-[280px]">
            <Skeleton className="aspect-square w-full" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="border-2 rounded-[2rem] overflow-hidden bg-white shadow-lg">
      <CardHeader className="bg-primary/5 border-b p-6">
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="p-8 h-[300px] flex items-end justify-around gap-4">
        {Array(8).fill(0).map((_, i) => (
          <Skeleton 
            key={i} 
            className="w-12 rounded-t-lg bg-muted/40" 
            style={{ height: `${Math.floor(Math.random() * 60) + 20}%` }} 
          />
        ))}
      </CardContent>
    </Card>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array(3).fill(0).map((_, i) => (
        <Card key={i} className="p-8 rounded-3xl space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-12 w-16" />
        </Card>
      ))}
    </div>
  );
}
