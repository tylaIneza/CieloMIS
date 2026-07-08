"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Bell, Scissors } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { UserMenu } from "@/components/layout/user-menu"
import { flatNavItems } from "@/lib/nav-items"

interface HeaderProps {
  name: string
  email: string
  unreadNotifications: number
}

export function Header({ name, email, unreadNotifications }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const current = flatNavItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  )

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background px-4 sm:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </Button>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex h-16 items-center gap-2 border-b px-6 font-semibold"
          >
            <Scissors className="size-5 text-primary" />
            <span>Cielo MIS</span>
          </Link>
          <div className="overflow-y-auto px-3 py-4">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <h2 className="flex-1 truncate text-base font-medium">
        {current?.label ?? "Cielo MIS"}
      </h2>

      <Button variant="ghost" size="icon" asChild className="relative">
        <Link href="/notifications" aria-label="Notifications">
          <Bell className="size-5" />
          {unreadNotifications > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-destructive" />
          )}
        </Link>
      </Button>
      <ThemeToggle />
      <UserMenu name={name} email={email} />
    </header>
  )
}
