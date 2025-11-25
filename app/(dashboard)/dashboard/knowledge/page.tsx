'use client'

import { useState } from 'react'
import { KnowledgeTable } from '@/components/features/knowledge/knowledge-table'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { useKnowledge, KnowledgeItem } from '@/hooks/use-knowledge'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function KnowledgePage() {
    const { knowledge, isLoading, addKnowledge, updateKnowledge, deleteKnowledge } = useKnowledge()
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<number | null>(null)

    const handleAddKnowledge = (item: Omit<KnowledgeItem, 'id'>) => {
        addKnowledge.mutate(item, {
            onSuccess: () => {
                toast.success('Article created successfully')
            },
            onError: () => {
                toast.error('Failed to create article', {
                    description: 'Please try again'
                })
            }
        })
    }

    const handleUpdateKnowledge = (item: KnowledgeItem) => {
        updateKnowledge.mutate(item, {
            onSuccess: () => {
                toast.success('Article updated successfully')
            },
            onError: () => {
                toast.error('Failed to update article', {
                    description: 'Please try again'
                })
            }
        })
    }

    const handleDeleteClick = (id: number) => {
        setItemToDelete(id)
        setDeleteConfirmOpen(true)
    }

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            deleteKnowledge.mutate(itemToDelete, {
                onSuccess: () => {
                    toast.success('Article deleted successfully')
                    setDeleteConfirmOpen(false)
                    setItemToDelete(null)
                },
                onError: () => {
                    toast.error('Failed to delete article', {
                        description: 'Please try again'
                    })
                }
            })
        }
    }

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-primary">Knowledge Base</h1>
            </div>
            <KnowledgeTable
                data={knowledge || []}
                onAdd={handleAddKnowledge}
                onUpdate={handleUpdateKnowledge}
                onDelete={handleDeleteClick}
            />
            <ConfirmationDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                onConfirm={handleConfirmDelete}
                title="Delete Article"
                description="Are you sure you want to delete this article? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    )
}
