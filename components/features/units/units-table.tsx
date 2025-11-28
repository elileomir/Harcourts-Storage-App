import { useState, useRef, useEffect } from 'react'
import { Search, Filter, List, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { UnitBookingsModal } from './unit-bookings-modal'
import { useBookings } from '@/hooks/use-bookings'
import { useSearchParams } from 'next/navigation'
import { Unit } from '@/hooks/use-units'

interface UnitsTableProps {
    units: Unit[]
    onStatusUpdate: (id: number, status: string) => void
    onEdit: (unit: Unit) => void
    onDelete: (id: number) => void
}

export function UnitsTable({ units, onStatusUpdate, onEdit, onDelete }: UnitsTableProps) {
    const searchParams = useSearchParams()
    const highlightId = searchParams.get('unitId')
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [facilityFilter, setFacilityFilter] = useState('all')
    const [selectedUnitForBookings, setSelectedUnitForBookings] = useState<Unit | null>(null)
    const rowRefs = useRef<Record<number, HTMLTableRowElement | null>>({})

    const { bookings } = useBookings()

    useEffect(() => {
        if (highlightId && rowRefs.current[Number(highlightId)]) {
            rowRefs.current[Number(highlightId)]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            rowRefs.current[Number(highlightId)]?.classList.add('bg-primary/10')
            setTimeout(() => {
                rowRefs.current[Number(highlightId)]?.classList.remove('bg-primary/10')
            }, 2000)
        }
    }, [highlightId])

    const facilities = Array.from(new Set(units.map(u => u.facility))).sort()

    const filteredUnits = units.filter(unit => {
        const matchesSearch =
            unit.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            unit.facility.toLowerCase().includes(searchTerm.toLowerCase()) ||
            unit.unit_type.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || unit.status === statusFilter
        const matchesFacility = facilityFilter === 'all' || unit.facility === facilityFilter

        return matchesSearch && matchesStatus && matchesFacility
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Available': return 'bg-[#2C9143] text-white border-[#2C9143]'
            case 'Submitted': return 'bg-[#C4642F] text-white border-[#C4642F]'
            case 'Unavailable': return 'bg-destructive text-white border-destructive'
            default: return 'bg-muted text-foreground border-muted'
        }
    }

    const getUnitBookings = (unitId: number) => {
        return bookings?.filter(b => b.unit_id === unitId) || []
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search units..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Select value={facilityFilter} onValueChange={setFacilityFilter}>
                        <SelectTrigger className="w-[180px] h-8">
                            <div className="flex items-center gap-2">
                                <Filter className="h-3 w-3" />
                                <SelectValue placeholder="Filter by facility" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Facilities</SelectItem>
                            {facilities.map(facility => (
                                <SelectItem key={facility} value={facility}>{facility}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] h-8">
                            <div className="flex items-center gap-2">
                                <Filter className="h-3 w-3" />
                                <SelectValue placeholder="Filter by status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="Submitted">Submitted</SelectItem>
                            <SelectItem value="Unavailable">Unavailable</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Unit Number</TableHead>
                            <TableHead>Facility</TableHead>
                            <TableHead>Type & Size</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUnits.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No units found matching your criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUnits.map((unit) => (
                                <TableRow
                                    key={unit.id}
                                    ref={el => { rowRefs.current[unit.id] = el }}
                                    className="transition-colors duration-500"
                                >
                                    <TableCell className="font-medium">{unit.unit_number}</TableCell>
                                    <TableCell>{unit.facility}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{unit.unit_type}</span>
                                            <span className="text-xs text-muted-foreground">{unit.size}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>${unit.price}/mo</span>
                                            <span className="text-xs text-muted-foreground">Bond: ${unit.bond}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={unit.status}
                                            onValueChange={(value) => onStatusUpdate(unit.id, value)}
                                        >
                                            <SelectTrigger
                                                className={`h-7 w-auto min-w-[110px] gap-1 rounded-[4px] border px-2.5 py-1 text-xs font-semibold shadow-none focus:ring-0 ${getStatusColor(unit.status)}`}
                                                style={{ backgroundColor: unit.status === 'Available' ? '#2C9143' : unit.status === 'Submitted' ? '#C4642F' : unit.status === 'Unavailable' ? '#DC2626' : undefined }}
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Available">Available</SelectItem>
                                                <SelectItem value="Submitted">Submitted</SelectItem>
                                                <SelectItem value="Unavailable">Unavailable</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setSelectedUnitForBookings(unit)}
                                                title="View bookings for this unit"
                                            >
                                                <List className="h-4 w-4" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => onEdit(unit)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit Unit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => onStatusUpdate(unit.id, 'Available')}>
                                                        Mark Available
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onStatusUpdate(unit.id, 'Unavailable')}>
                                                        Mark Unavailable
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => onDelete(unit.id)} className="text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Unit
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {selectedUnitForBookings && (
                <UnitBookingsModal
                    isOpen={!!selectedUnitForBookings}
                    onClose={() => setSelectedUnitForBookings(null)}
                    unitNumber={selectedUnitForBookings.unit_number}
                    bookings={getUnitBookings(selectedUnitForBookings.id)}
                />
            )}
        </div>
    )
}
