import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export type Unit = {
    id: number
    unit_number: string
    facility: string
    unit_type: string
    size: string
    price: string
    bond: string
    access_hours: string
    status: 'Available' | 'Submitted' | 'Unavailable'
}

export type UnitInput = Omit<Unit, 'id'>

export function useUnits() {
    const supabase = createClient()
    const queryClient = useQueryClient()

    const { data: units, isLoading, error } = useQuery({
        queryKey: ['units'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('storage_units')
                .select('*')
                .order('facility', { ascending: true })
                .order('unit_number', { ascending: true })

            if (error) throw error
            return data as Unit[]
        },
    })

    const updateStatus = useMutation({
        mutationFn: async ({ id, status }: { id: number; status: string }) => {
            const { error } = await supabase
                .from('storage_units')
                .update({ status })
                .eq('id', id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['units'] })
        },
    })

    const addUnit = useMutation({
        mutationFn: async (newUnit: UnitInput) => {
            const { error } = await supabase
                .from('storage_units')
                .insert([newUnit])

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['units'] })
        },
    })

    const updateUnit = useMutation({
        mutationFn: async ({ id, updates }: { id: number; updates: Partial<Unit> }) => {
            const { error } = await supabase
                .from('storage_units')
                .update(updates)
                .eq('id', id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['units'] })
        },
    })

    const deleteUnit = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('storage_units')
                .delete()
                .eq('id', id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['units'] })
        },
    })

    return { units, isLoading, error, updateStatus, addUnit, updateUnit, deleteUnit }
}
