import { useEffect, useState } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
export function AutoOpenTooltip({
    children,
    content,
}: {
    children: React.ReactNode;
    content: string;
}) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // Show tooltip briefly when page loads
        const timer1 = setTimeout(() => setOpen(true), 500);  // open after 0.5s
        const timer2 = setTimeout(() => setOpen(false), 3000); // close after 3s
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    return (
        <TooltipProvider >
            <Tooltip open={open} >
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent side="top" className="text-sm font-medium text-white bg-pink-600">
                    {content}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
