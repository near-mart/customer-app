"use client";
import React from "react";
import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function QueryProvider({ children }) {
    const queryClient = React.useRef(
        new QueryClient({
            defaultOptions: {
                queries: {
                    refetchOnWindowFocus: false,
                    retry: 1,
                    staleTime: 1000 * 60 * 2, // 2 minutes
                },
            },
        })
    );


    return (
        <QueryClientProvider client={queryClient.current}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
