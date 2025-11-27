'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteUser, updateUserRole } from '@/app/actions/auth'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface User {
    id?: string
    email?: string
    role?: string
    created_at?: string
}

interface UsersTableProps {
    initialUsers: User[]
}

export function UsersTable({ initialUsers }: UsersTableProps) {
    const [users, setUsers] = useState(initialUsers)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)
    const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null)
    const supabase = createClient()

    // Set up real-time subscription for profile changes
    useEffect(() => {
        const channel = supabase
            .channel('profiles-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'profiles'
                },
                async (payload) => {
                    if (payload.eventType === 'INSERT') {
                        // Fetch the full user data including email from auth
                        const newProfile = payload.new as { id: string; role: string; created_at: string }
                        const { data: { user } } = await supabase.auth.admin.getUserById(newProfile.id)
                        if (user) {
                            setUsers(prev => [...prev, {
                                id: user.id,
                                email: user.email,
                                role: newProfile.role,
                                created_at: user.created_at
                            }])
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        const updated = payload.new as { id: string; role: string }
                        setUsers(prev => prev.map(u =>
                            u.id === updated.id ? { ...u, role: updated.role } : u
                        ))
                    } else if (payload.eventType === 'DELETE') {
                        const deleted = payload.old as { id: string }
                        setUsers(prev => prev.filter(u => u.id !== deleted.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, []) // supabase client is stable and doesn't need to be in deps

    const handleDeleteUser = async (user: User) => {
        if (!user.id) return

        setDeletingId(user.id)
        try {
            const result = await deleteUser(user.id)
            if (result.success) {
                toast.success(`User ${user.email} deleted successfully`)
                setUsers(users.filter(u => u.id !== user.id))
            } else {
                toast.error(result.error || 'Failed to delete user')
            }
        } catch {
            toast.error('An unexpected error occurred')
        } finally {
            setDeletingId(null)
            setUserToDelete(null)
        }
    }

    const handleRoleChange = async (userId: string, newRole: string) => {
        setUpdatingRoleId(userId)
        try {
            const result = await updateUserRole(userId, newRole)
            if (result.success) {
                toast.success('User role updated successfully')
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
            } else {
                toast.error(result.error || 'Failed to update role')
            }
        } catch {
            toast.error('An unexpected error occurred')
        } finally {
            setUpdatingRoleId(null)
        }
    }

    return (
        <>
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user, index) => (
                                <TableRow key={user.id || index}>
                                    <TableCell>
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>
                                                {user.email?.substring(0, 2).toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{user.email || '-'}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={user.role || 'user'}
                                            onValueChange={(value) => user.id && handleRoleChange(user.id, value)}
                                            disabled={updatingRoleId === user.id}
                                        >
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue>
                                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                        {user.role || 'user'}
                                                    </Badge>
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user">
                                                    <Badge variant="secondary">user</Badge>
                                                </SelectItem>
                                                <SelectItem value="admin">
                                                    <Badge variant="default">admin</Badge>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setUserToDelete(user)}
                                            disabled={deletingId === user.id}
                                        >
                                            {deletingId === user.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                                            ) : (
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{userToDelete?.email}</strong>? This will remove the user from both authentication and the profiles table. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => userToDelete && handleDeleteUser(userToDelete)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
