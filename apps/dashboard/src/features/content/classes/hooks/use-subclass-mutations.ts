import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreateSubclassInput, UpdateSubclassInput } from '@rpg/contracts'

import { createSubclass, deleteSubclass, updateSubclass } from '../api/subclasses-api'
import { subclassesQueryKey } from './use-subclasses'

export function useCreateSubclass(campaignId: string, classId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateSubclassInput) => createSubclass(campaignId, classId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: subclassesQueryKey(campaignId, classId) })
    },
  })
}

export function useUpdateSubclass(campaignId: string, classId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ subclassId, input }: { subclassId: string; input: UpdateSubclassInput }) =>
      updateSubclass(campaignId, classId, subclassId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: subclassesQueryKey(campaignId, classId) })
    },
  })
}

export function useDeleteSubclass(campaignId: string, classId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (subclassId: string) => deleteSubclass(campaignId, classId, subclassId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: subclassesQueryKey(campaignId, classId) })
    },
  })
}
