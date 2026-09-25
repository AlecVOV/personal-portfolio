export const useAdminCrud = <T extends Record<string, any>>(tableName: string) => {
  const client = useSupabaseClient()

  const getAll = async (orderBy = 'sort_order'): Promise<T[]> => {
    const { data, error } = await client
      .from(tableName)
      .select('*')
      .order(orderBy)
    if (error) throw error
    return data as T[]
  }

  const getById = async (id: string): Promise<T | null> => {
    const { data, error } = await client
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as T
  }

  const create = async (record: Partial<T>): Promise<T> => {
    const { data, error } = await client
      .from(tableName)
      .insert(record)
      .select()
      .single()
    if (error) throw error
    return data as T
  }

  const update = async (id: string, record: Partial<T>): Promise<T> => {
    const { data, error } = await client
      .from(tableName)
      .update(record)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as T
  }

  const remove = async (id: string): Promise<void> => {
    const { error } = await client
      .from(tableName)
      .delete()
      .eq('id', id)
    if (error) throw error
  }

  return { getAll, getById, create, update, remove }
}
