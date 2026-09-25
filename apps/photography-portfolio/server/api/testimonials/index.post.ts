import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  const body = await readBody(event)

  const { data, error } = await client
    .from('testimonials')
    .insert({
      name: body.name,
      role: body.role,
      avatar: body.avatar || null,
      rating: body.rating || 5,
      quote: body.quote,
      status: body.status || 'published'
    })
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }

  return data
})