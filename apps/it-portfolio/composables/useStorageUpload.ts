export const useStorageUpload = () => {
  const client = useSupabaseClient()

  const uploadFile = async (
    bucket: string,
    filePath: string,
    file: File
  ): Promise<string> => {
    const { error } = await client.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true })

    if (error) throw error

    const { data } = client.storage.from(bucket).getPublicUrl(filePath)
    return data.publicUrl
  }

  const deleteFile = async (bucket: string, filePath: string): Promise<void> => {
    const { error } = await client.storage
      .from(bucket)
      .remove([filePath])
    if (error) throw error
  }

  return { uploadFile, deleteFile }
}
