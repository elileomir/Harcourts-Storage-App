import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { KnowledgeItem } from '@/hooks/use-knowledge'

interface KnowledgeTableProps {
    data: KnowledgeItem[]
    onAdd: (item: Omit<KnowledgeItem, 'id'>) => void
    onUpdate: (item: KnowledgeItem) => void
    onDelete: (id: number) => void
}

export function KnowledgeTable({ data = [], onAdd, onUpdate, onDelete }: KnowledgeTableProps) {
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null)
    const [newItem, setNewItem] = useState({ question: '', answer: '' })

    const handleAdd = () => {
        onAdd(newItem)
        setNewItem({ question: '', answer: '' })
        setIsAddOpen(false)
    }

    const handleUpdate = () => {
        if (editingItem) {
            onUpdate(editingItem)
            setEditingItem(null)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Entry
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Knowledge Base Entry</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Question</label>
                                <Input
                                    value={newItem.question}
                                    onChange={(e) => setNewItem({ ...newItem, question: e.target.value })}
                                    placeholder="e.g., What are your opening hours?"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Answer</label>
                                <Textarea
                                    value={newItem.answer}
                                    onChange={(e) => setNewItem({ ...newItem, answer: e.target.value })}
                                    placeholder="e.g., We are open 9am-5pm daily."
                                />
                            </div>
                            <Button onClick={handleAdd} className="w-full">Save Entry</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[30%]">Question</TableHead>
                            <TableHead className="w-[60%]">Answer</TableHead>
                            <TableHead className="w-[10%] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    No knowledge base entries available
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.question}</TableCell>
                                    <TableCell className="whitespace-pre-wrap">{item.answer}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Dialog open={!!editingItem && editingItem.id === item.id} onOpenChange={(open) => !open && setEditingItem(null)}>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => setEditingItem(item)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Entry</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">Question</label>
                                                            <Input
                                                                value={editingItem?.question || ''}
                                                                onChange={(e) => setEditingItem(prev => prev ? { ...prev, question: e.target.value } : null)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">Answer</label>
                                                            <Textarea
                                                                value={editingItem?.answer || ''}
                                                                onChange={(e) => setEditingItem(prev => prev ? { ...prev, answer: e.target.value } : null)}
                                                            />
                                                        </div>
                                                        <Button onClick={handleUpdate} className="w-full">Update Entry</Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(item.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
