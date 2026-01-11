import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast relative overflow-hidden rounded-xl border border-border/60 bg-background/95 text-foreground shadow-[0_12px_35px_rgba(15,23,42,0.2)] backdrop-blur-md pl-4 pr-6 py-3 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-primary/60 data-[type=success]:before:bg-emerald-500 data-[type=error]:before:bg-rose-500 data-[type=warning]:before:bg-amber-500 data-[type=info]:before:bg-sky-500",
          title: "text-sm font-semibold tracking-tight",
          description: "text-xs text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "rounded-full border border-border/60 bg-background/70 text-foreground/70 transition hover:text-foreground hover:bg-muted",
          icon: "text-foreground/70",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
