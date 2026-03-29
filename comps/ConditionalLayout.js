'use client'
import { usePathname } from 'next/navigation'
import { SidebarProvider } from '@/comps/sbc'
import LayoutWithSidebar from '@/comps/lwsidebar'

export default function ConditionalLayout({ children }) {
  const pathname = usePathname()

  if (pathname === '/') {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <LayoutWithSidebar>{children}</LayoutWithSidebar>
    </SidebarProvider>
  )
}