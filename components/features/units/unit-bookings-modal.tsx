'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Booking } from '@/hooks/use-bookings'
import { ExternalLink, Calendar, User, Phone } from 'lucide-react'

interface UnitBookingsModalProps {
    isOpen: boolean
    onClose: () => void
    unitNumber: string
    bookings: Booking[]
}

export function UnitBookingsModal({ isOpen, onClose, unitNumber, bookings }: UnitBookingsModalProps) {
    const router = useRouter()

    // Sort bookings: Pending first, then Approved, Active, others
    const sortedBookings = [...bookings].sort((a, b) => {
        const statusOrder: Record<string, number> = {
            'Pending': 0,
            'Submitted': 0,
            'Approved': 1,
            'Active': 2,
            'Ending': 3,
            'Completed': 4,
            'Cancelled': 5,
            'Declined': 5
        }

        const scoreA = statusOrder[a.status] ?? 99
        const scoreB = statusOrder[b.status] ?? 99

        if (scoreA !== scoreB) return scoreA - scoreB

        // Secondary sort by date (newest first)
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-800'
            case 'Active': return 'bg-blue-100 text-blue-800'
            case 'Pending':
            case 'Submitted': return 'bg-yellow-100 text-yellow-800'
            case 'Ending': return 'bg-orange-100 text-orange-800'
            case 'Completed': return 'bg-gray-100 text-gray-800'
            case 'Cancelled':
            case 'Declined': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const handleViewDetails = (bookingId: number) => {
        router.push(`/dashboard/bookings?bookingId=${bookingId}&highlight=true`)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Bookings for Unit {unitNumber}</DialogTitle>
                    <DialogDescription>
                        {bookings.length} booking{bookings.length !== 1 ? 's' : ''} found
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 mt-4">
                    {sortedBookings.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No bookings found for this unit.
                        </div>
                    ) : (
                        sortedBookings.map((booking) => (
                            <Card key={booking.id} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-lg">{booking.customer_name}</span>
                                                <Badge className={getStatusColor(booking.status)} variant="secondary">
                                                    {booking.status}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-muted-foreground mt-2">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-3 w-3" />
                                                    {booking.customer_email}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-3 w-3" />
                                                    {booking.customer_mobile || 'N/A'}
                                                </div>
                                                <div className="flex items-center gap-2 col-span-2 mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {booking.lease_start_date ? format(new Date(booking.lease_start_date), 'MMM d, yyyy') : 'N/A'}
                                                    {' - '}
                                                    {booking.lease_end_date ? format(new Date(booking.lease_end_date), 'MMM d, yyyy') : 'Ongoing'}
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="ml-4 shrink-0 gap-1"
                                            onClick={() => handleViewDetails(booking.id)}
                                        >
                                            View Details
                                            <ExternalLink className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
