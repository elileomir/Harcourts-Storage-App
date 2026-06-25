'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Booking } from '@/hooks/use-bookings'

interface BookingDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    booking: Booking | null
    onSubmit: (id: number, updates: Partial<Booking>) => void
    units: Array<{ id: number; unit_number: string; facility: string }>
}

export function BookingDialog({ open, onOpenChange, booking, onSubmit, units }: BookingDialogProps) {
    const [formData, setFormData] = useState({
        customer_name: booking?.customer_name || '',
        customer_email: booking?.customer_email || '',
        customer_mobile: booking?.customer_mobile || '',
        unit_id: booking?.unit_id || 0,
        lease_start_date: booking?.lease_start_date ? booking.lease_start_date.split('T')[0] : '',
        lease_end_date: booking?.lease_end_date ? booking.lease_end_date.split('T')[0] : '',
        docusign_link: booking?.docusign_link || '',
        status: booking?.status || 'Pending',
        scheduled_status: booking?.scheduled_status || '',
        scheduled_status_date: booking?.scheduled_status_date
            ? booking.scheduled_status_date.split('T')[0]
            : ''
    })

    const clearSchedule = () => {
        setFormData({ ...formData, scheduled_status: '', scheduled_status_date: '' })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (booking) {
            const hasSchedule =
                !!formData.scheduled_status && !!formData.scheduled_status_date
            onSubmit(booking.id, {
                customer_name: formData.customer_name,
                customer_email: formData.customer_email,
                customer_mobile: formData.customer_mobile || null,
                unit_id: formData.unit_id,
                lease_start_date: formData.lease_start_date,
                lease_end_date: formData.lease_end_date || null,
                docusign_link: formData.docusign_link || null,
                status: formData.status,
                scheduled_status: hasSchedule ? formData.scheduled_status : null,
                scheduled_status_date: hasSchedule ? formData.scheduled_status_date : null
            })
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Booking</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="customer_name" className="text-right">Name</Label>
                        <Input
                            id="customer_name"
                            value={formData.customer_name}
                            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="customer_email" className="text-right">Email</Label>
                        <Input
                            id="customer_email"
                            type="email"
                            value={formData.customer_email}
                            onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="customer_mobile" className="text-right">Mobile</Label>
                        <Input
                            id="customer_mobile"
                            type="tel"
                            value={formData.customer_mobile}
                            onChange={(e) => setFormData({ ...formData, customer_mobile: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="unit_id" className="text-right">Unit</Label>
                        <Select
                            value={formData.unit_id.toString()}
                            onValueChange={(value) => setFormData({ ...formData, unit_id: parseInt(value) })}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                                {units.map((unit) => (
                                    <SelectItem key={unit.id} value={unit.id.toString()}>
                                        Unit {unit.unit_number} - {unit.facility}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="lease_start_date" className="text-right">Lease Start</Label>
                        <Input
                            id="lease_start_date"
                            type="date"
                            value={formData.lease_start_date}
                            onChange={(e) => setFormData({ ...formData, lease_start_date: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="lease_end_date" className="text-right">Lease End</Label>
                        <Input
                            id="lease_end_date"
                            type="date"
                            value={formData.lease_end_date}
                            onChange={(e) => setFormData({ ...formData, lease_end_date: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="docusign_link" className="text-right">DocuSign Link</Label>
                        <Input
                            id="docusign_link"
                            type="url"
                            value={formData.docusign_link}
                            onChange={(e) => setFormData({ ...formData, docusign_link: e.target.value })}
                            className="col-span-3"
                            placeholder="https://..."
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value: string) => setFormData({ ...formData, status: value as Booking['status'] })}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Ending">Ending</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-3 rounded-md border bg-sky-50/40 p-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium text-sky-900">Schedule status change</Label>
                            {(formData.scheduled_status || formData.scheduled_status_date) && (
                                <button
                                    type="button"
                                    onClick={clearSchedule}
                                    className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                                >
                                    Clear schedule
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="scheduled_status" className="text-right text-sm">Status</Label>
                            <Select
                                value={formData.scheduled_status || undefined}
                                onValueChange={(value) => setFormData({ ...formData, scheduled_status: value })}
                            >
                                <SelectTrigger id="scheduled_status" className="col-span-3">
                                    <SelectValue placeholder="No change scheduled" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Approved">Approved</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Ending">Ending</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="scheduled_status_date" className="text-right text-sm">On date</Label>
                            <Input
                                id="scheduled_status_date"
                                type="date"
                                value={formData.scheduled_status_date}
                                onChange={(e) => setFormData({ ...formData, scheduled_status_date: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
