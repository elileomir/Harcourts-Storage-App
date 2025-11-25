import { listUsers } from '@/app/actions/auth'
import { UsersTable } from '@/components/features/users/users-table'
import { InviteUserDialog } from '@/components/features/users/invite-user-dialog'
import { AlertCircle } from 'lucide-react'

export default async function UsersPage() {
    const users = await listUsers()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary">User Management</h1>
                    <p className="text-muted-foreground">Manage admin access to the dashboard.</p>
                </div>
                <InviteUserDialog />
            </div>

            {!process.env.SUPABASE_SERVICE_ROLE_KEY && (
                <div className="flex items-center gap-2 rounded-md bg-amber-50 p-4 text-amber-800">
                    <AlertCircle className="h-5 w-5" />
                    <p>
                        <strong>Configuration Required:</strong> To manage users, you must add your
                        <code>SUPABASE_SERVICE_ROLE_KEY</code> to <code>.env.local</code>.
                    </p>
                </div>
            )}

            <UsersTable initialUsers={users} />
        </div>
    )
}
