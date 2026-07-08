import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  UserSquare2,
  Truck,
  ClipboardList,
  Scissors,
  Wallet,
  HandCoins,
  Boxes,
  ShoppingCart,
  Receipt,
  Wrench,
  BadgeDollarSign,
  BarChart3,
  Bell,
  History,
  Settings,
} from "lucide-react"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Business",
    items: [
      { label: "Orders", href: "/orders", icon: ClipboardList },
      { label: "Customers", href: "/customers", icon: UserSquare2 },
      { label: "Products", href: "/products", icon: ShoppingBag },
      { label: "Income", href: "/income", icon: BadgeDollarSign },
    ],
  },
  {
    label: "Workforce",
    items: [
      { label: "Employees", href: "/employees", icon: Users },
      { label: "Production", href: "/production", icon: Scissors },
      { label: "Payroll", href: "/payroll", icon: Wallet },
      { label: "Loans", href: "/loans", icon: HandCoins },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Inventory", href: "/inventory", icon: Boxes },
      { label: "Purchases", href: "/purchases", icon: ShoppingCart },
      { label: "Suppliers", href: "/suppliers", icon: Truck },
      { label: "Expenses", href: "/expenses", icon: Receipt },
      { label: "Equipment", href: "/equipment", icon: Wrench },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Reports", href: "/reports", icon: BarChart3 },
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Audit Log", href: "/audit-log", icon: History },
    ],
  },
  {
    label: "System",
    items: [{ label: "Settings", href: "/settings", icon: Settings }],
  },
]

export const flatNavItems: NavItem[] = navGroups.flatMap((g) => g.items)
