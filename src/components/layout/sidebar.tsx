import Link from "next/link"
import { Scissors } from "lucide-react"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { ScrollArea } from "@/components/ui/scroll-area"

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col print:hidden">
      <Link
        href="/dashboard"
        className="flex h-16 items-center gap-2 border-b px-6 font-semibold"
      >
        <Scissors className="size-5 text-primary" />
        <span>Cielo MIS</span>
      </Link>
      <ScrollArea className="flex-1 px-3 py-4">
        <SidebarNav />
      </ScrollArea>
    </aside>
  )
}
