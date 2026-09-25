// Admin CRUD for one collection through /api/admin/crud/<collection> (auth enforced server-side).
export const useAdminCrud = <T extends Record<string, any>>(tableName: string) => {
  const base = `/api/admin/crud/${tableName}`

  const getAll = async (orderBy = 'sort_order'): Promise<T[]> => {
    const items = await $fetch<T[]>(base)
    return [...items].sort((a, b) => {
      const x = a[orderBy], y = b[orderBy]
      if (x === y) return 0
      if (x === undefined || x === null) return 1
      if (y === undefined || y === null) return -1
      return x < y ? -1 : 1
    })
  }

  const getById = (id: string): Promise<T> => $fetch<T>(`${base}/${id}`)

  const create = (record: Partial<T>): Promise<T> =>
    $fetch<T>(base, { method: 'POST', body: record })

  const update = (id: string, record: Partial<T>): Promise<T> =>
    $fetch<T>(`${base}/${id}`, { method: 'PUT', body: record })

  const remove = async (id: string): Promise<void> => {
    await $fetch(`${base}/${id}`, { method: 'DELETE' })
  }

  return { getAll, getById, create, update, remove }
}
