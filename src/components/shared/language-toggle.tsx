"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { setLocale } from "@/app/(dashboard)/settings/locale-actions";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const newLocale = locale === "en" ? "th" : "en";
    startTransition(async () => {
      await setLocale(newLocale);
      router.refresh();
    });
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          disabled={isPending}
          className="text-muted-foreground hover:text-foreground p-2 gap-0"
        >
          <span className="text-xs font-semibold">
            {locale === "en" ? "TH" : "EN"}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {locale === "en" ? "เปลี่ยนเป็นภาษาไทย" : "Switch to English"}
      </TooltipContent>
    </Tooltip>
  );
}
