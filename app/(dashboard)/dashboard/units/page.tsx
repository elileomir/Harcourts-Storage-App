'use client'

import { useState } from 'react'
import { UnitsTable } from '@/components/features/units/units-table'
import { UnitsSummary } from '@/components/features/units/units-summary'
import { UnitDialog } from '@/components/features/units/unit-dialog'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { useUnits, Unit, UnitInput } from '@/hooks/use-units'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function UnitsPage() {
    const { units, isLoading, updateStatus, addUnit, updateUnit, deleteUnit } = useUnits()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [unitToDelete, setUnitToDelete] = useState<number | null>(null)

    const handleAdd = () => {
        setEditingUnit(null)
        setDialogOpen(true)
    }

    const handleEdit = (unit: Unit) => {
        setEditingUnit(unit)
        setDialogOpen(true)
    }

    const handleSubmit = (data: UnitInput) => {
        if (editingUnit) {
            updateUnit.mutate({ id: editingUnit.id, updates: data }, {
                onSuccess: () => {
                    toast.success('Unit updated successfully', {
                        description: `Unit ${data.unit_number} has been updated`
                    })
                },
                onError: () => {
                    toast.error('Failed to update unit', {
                        description: 'Please try again'
                    })
                }
            })
        } else {
            addUnit.mutate(data, {
                onSuccess: () => {
                    toast.success('Unit created successfully', {
                        description: `Unit ${data.unit_number} has been added`
                    })
                },
                onError: () => {
                    toast.error('Failed to create unit', {
                        description: 'Please try again'
                    })
                }
            })
        }
    }

    const handleDeleteClick = (id: number) => {
        setUnitToDelete(id)
        setDeleteConfirmOpen(true)
    }

    const handleConfirmDelete = () => {
        if (unitToDelete) {
            deleteUnit.mutate(unitToDelete, {
                onSuccess: () => {
                    toast.success('Unit deleted successfully')
                    setDeleteConfirmOpen(false)
                    setUnitToDelete(null)
                },
                onError: () => {
                    toast.error('Failed to delete unit', {
                        description: 'Please try again'
                    })
                }
            })
        }
    }

    const handleStatusUpdate = (id: number, status: string) => {
        updateStatus.mutate({ id, status }, {
            onSuccess: () => {
                toast.success('Status updated', {
                    description: `Unit status changed to ${status}`
                })
            },
            onError: () => {
                toast.error('Failed to update status')
            }
        })
    }

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-primary">Unit Management</h1>
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" /> Add Unit
                </Button>
            </div>
            <UnitsSummary units={units || []} />
            <UnitsTable
                units={units || []}
                onStatusUpdate={handleStatusUpdate}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />
            <UnitDialog
                key={editingUnit?.id || 'new'}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                unit={editingUnit}
                onSubmit={handleSubmit}
            />
            <ConfirmationDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                onConfirm={handleConfirmDelete}
                title="Delete Unit"
                description="Are you sure you want to delete this unit? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    )
}
