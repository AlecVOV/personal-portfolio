import type { AppError } from '~/types/portfolio'

export const useErrorHandler = () => {
  const error = ref<AppError | null>(null)
  const isLoading = ref(false)

  const handleError = (err: unknown, context?: string) => {
    console.error(`Error${context ? ` in ${context}` : ''}:`, err)
    
    if (err instanceof Error) {
      error.value = {
        message: err.message,
        code: err.name,
        details: context
      }
    } else if (typeof err === 'string') {
      error.value = {
        message: err,
        details: context
      }
    } else {
      error.value = {
        message: 'An unexpected error occurred',
        details: { originalError: err, context }
      }
    }
  }

  const clearError = () => {
    error.value = null
  }

  const withErrorHandling = async <T>(
    asyncFn: () => Promise<T>,
    context?: string,
    loadingState = true
  ): Promise<T | null> => {
    try {
      if (loadingState) isLoading.value = true
      clearError()
      
      const result = await asyncFn()
      return result
    } catch (err) {
      handleError(err, context)
      return null
    } finally {
      if (loadingState) isLoading.value = false
    }
  }

  const retryOperation = async <T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T | null> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (err) {
        if (attempt === maxRetries) {
          handleError(err, `Failed after ${maxRetries} attempts`)
          return null
        }
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
    return null
  }

  return {
    error: readonly(error),
    isLoading: readonly(isLoading),
    handleError,
    clearError,
    withErrorHandling,
    retryOperation
  }
}
