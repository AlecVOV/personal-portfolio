import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  
  const { data, error } = await client
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }

  return data
})