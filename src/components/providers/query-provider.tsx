"use client";

import * as React from "react";
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
  if (isServer) {
    // Server: always create a new QueryClient for each SSR request
    return makeQueryClient();
  }

  // Browser: keep a single QueryClient instance across client renders
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
