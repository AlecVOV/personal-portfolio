import type { ContactForm, ValidationResult } from '~/types/portfolio'

export const useFormValidation = () => {
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateName = (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 100
  }

  const validateMessage = (message: string): boolean => {
    return message.trim().length >= 10 && message.trim().length <= 1000
  }

  const validateForm = (form: ContactForm): ValidationResult => {
    const errors: Record<string, string> = {}
    
    // Name validation
    if (!form.name.trim()) {
      errors.name = 'Name is required'
    } else if (!validateName(form.name)) {
      errors.name = 'Name must be between 2-100 characters'
    }
    
    // Email validation
    if (!form.email.trim()) {
      errors.email = 'Email is required'
    } else if (!validateEmail(form.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    // Message validation
    if (!form.message.trim()) {
      errors.message = 'Message is required'
    } else if (!validateMessage(form.message)) {
      errors.message = 'Message must be between 10-1000 characters'
    }
    
    return { 
      isValid: Object.keys(errors).length === 0, 
      errors 
    }
  }

  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, '')
  }

  const sanitizeForm = (form: ContactForm): ContactForm => {
    return {
      name: sanitizeInput(form.name),
      email: sanitizeInput(form.email),
      message: sanitizeInput(form.message)
    }
  }

  return { 
    validateForm, 
    validateEmail, 
    validateName, 
    validateMessage,
    sanitizeInput,
    sanitizeForm
  }
}
