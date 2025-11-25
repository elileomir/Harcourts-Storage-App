'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Unit, UnitInput } from '@/hooks/use-units'

interface UnitDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    unit?: Unit | null
    onSubmit: (unit: UnitInput) => void
}

export function UnitDialog({ open, onOpenChange, unit, onSubmit }: UnitDialogProps) {
    const [formData, setFormData] = useState<UnitInput>({
        unit_number: unit?.unit_number || '',
        facility: unit?.facility || '',
        unit_type: unit?.unit_type || '',
        size: unit?.size || '',
        price: unit?.price || '',
        bond: unit?.bond || '',
        access_hours: unit?.access_hours || '24/7',
        status: unit?.status || 'Available'
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{unit ? 'Edit Unit' : 'Add New Unit'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="unit_number" className="text-right">Unit #</Label>
                        <Input
                            id="unit_number"
                            value={formData.unit_number}
                            onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="facility" className="text-right">Facility</Label>
                        <Input
                            id="facility"
                            value={formData.facility}
                            onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Type</Label>
                        <Input
                            id="type"
                            value={formData.unit_type}
                            onChange={(e) => setFormData({ ...formData, unit_type: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="size" className="text-right">Size</Label>
                        <Input
                            id="size"
                            value={formData.size}
                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                            className="col-span-3"
                            placeholder="e.g., 3x6m"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">Price</Label>
                        <Input
                            id="price"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="col-span-3"
                            placeholder="Monthly price"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bond" className="text-right">Bond</Label>
                        <Input
                            id="bond"
                            value={formData.bond}
                            onChange={(e) => setFormData({ ...formData, bond: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="access_hours" className="text-right">Access</Label>
                        <Input
                            id="access_hours"
                            value={formData.access_hours}
                            onChange={(e) => setFormData({ ...formData, access_hours: e.target.value })}
                            className="col-span-3"
                            placeholder="e.g., 24/7 or 6am-10pm"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value: string) => setFormData({ ...formData, status: value as Unit['status'] })}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Available">Available</SelectItem>
                                <SelectItem value="Submitted">Submitted</SelectItem>
                                <SelectItem value="Unavailable">Unavailable</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit">{unit ? 'Save Changes' : 'Add Unit'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
