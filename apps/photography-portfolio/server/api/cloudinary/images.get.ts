export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Log config to verify environment variables are loaded
  console.log('Cloudinary Config Check:', {
    hasCloudName: !!config.public.cloudinaryCloudName,
    hasApiKey: !!config.cloudinaryApiKey,
    hasApiSecret: !!config.cloudinaryApiSecret
  })
  
  if (!config.public.cloudinaryCloudName || !config.cloudinaryApiKey || !config.cloudinaryApiSecret) {
    throw createError({
      statusCode: 500,
      message: 'Cloudinary credentials not configured'
    })
  }
  
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${config.public.cloudinaryCloudName}/resources/image`
  
  try {
    const response = await $fetch(cloudinaryUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.cloudinaryApiKey}:${config.cloudinaryApiSecret}`).toString('base64')}`
      },
      params: {
        max_results: 500,
        type: 'upload' // Add type parameter
      }
    })
    
    console.log('Cloudinary response:', response)
    return response
  } catch (error: any) {
    console.error('Cloudinary API Error:', {
      message: error.message,
      statusCode: error.statusCode,
      data: error.data
    })
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.error?.message || 'Failed to fetch images from Cloudinary'
    })
  }
})