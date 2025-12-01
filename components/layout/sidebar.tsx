'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Box, Users, Phone, BookOpen, LogOut, Settings, User, PhoneIncoming } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useState } from 'react'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Units', href: '/dashboard/units', icon: Box },
    { name: 'Bookings', href: '/dashboard/bookings', icon: Users },
    { name: 'Analytics', href: '/dashboard/analytics', icon: Phone },
    { name: 'Callback Requests', href: '/dashboard/callback-requests', icon: PhoneIncoming },
    { name: 'Knowledge Base', href: '/dashboard/knowledge', icon: BookOpen },
    { name: 'Settings', href: '/dashboard/settings', icon: User },
    { name: 'Users', href: '/dashboard/users', icon: Users, adminOnly: true },
    { name: 'Platform Settings', href: '/dashboard/admin/settings', icon: Settings, adminOnly: true },
]

export function Sidebar() {
    const pathname = usePathname()
    const { signOut, role } = useAuth()
    const isAdmin = role === 'admin'
    const [showSignOutDialog, setShowSignOutDialog] = useState(false)

    return (
        <div className="flex h-full w-64 flex-col border-r bg-card">
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <div className="relative h-8 w-8">
                        <Image
                            src="/harcourts-logo.svg"
                            alt="Harcourts"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <span className="text-[#091A2B]">Storage App</span>
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-4">
                    {navigation.map((item) => {
                        if (item.adminOnly && !isAdmin) return null

                        const isActive = item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname === item.href || pathname.startsWith(item.href + '/')

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'group flex items-center rounded-[4px] px-2 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'mr-3 h-5 w-5 flex-shrink-0',
                                        isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="border-t p-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setShowSignOutDialog(true)}
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign Out
                </Button>
            </div>

            <ConfirmationDialog
                open={showSignOutDialog}
                onOpenChange={setShowSignOutDialog}
                onConfirm={() => signOut()}
                title="Sign Out"
                description="Are you sure you want to sign out?"
                confirmText="Sign Out"
                variant="danger"
            />
        </div>
    )
}
