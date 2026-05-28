import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

const variantIcons: Record<string, ReactNode> = {
  success: <CheckCircle2 className="mt-[1px] h-[18px] w-[18px] shrink-0 text-[hsl(150_60%_42%)]" />,
  destructive: <XCircle className="mt-[1px] h-[18px] w-[18px] shrink-0 text-destructive" />,
  info: <Info className="mt-[1px] h-[18px] w-[18px] shrink-0 text-[hsl(210_80%_52%)]" />,
  warning: <AlertTriangle className="mt-[1px] h-[18px] w-[18px] shrink-0 text-[hsl(38_80%_60%)]" />,
};

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const icon = variant ? (variantIcons[variant] ?? null) : null;
        return (
          <Toast key={id} variant={variant} {...props}>
            {icon}
            <div className="grid min-w-0 flex-1 gap-0.5">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
