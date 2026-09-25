export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  
  // Validate input
  if (!body?.public_id) {
    throw createError({
      statusCode: 400,
      message: 'Public ID is required'
    })
  }
  
  // Validate config
  if (!config.public.cloudinaryCloudName || !config.cloudinaryApiKey || !config.cloudinaryApiSecret) {
    throw createError({
      statusCode: 500,
      message: 'Cloudinary credentials not configured'
    })
  }
  
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${config.public.cloudinaryCloudName}/resources/image/upload`
  
  console.log('Attempting to delete image:', body.public_id)
  
  try {
    const response = await $fetch(cloudinaryUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.cloudinaryApiKey}:${config.cloudinaryApiSecret}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: {
        public_ids: [body.public_id]
      }
    })
    
    console.log('Delete response:', response)
    return response
  } catch (error: any) {
    console.error('Cloudinary Delete Error:', {
      message: error.message,
      statusCode: error.statusCode,
      data: error.data,
      public_id: body.public_id
    })
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.error?.message || 'Failed to delete image from Cloudinary'
    })
  }
})