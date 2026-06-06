export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    educativo: 'Educativo',
    datas_especiais: 'Datas Especiais',
    papelaria: 'Papelaria',
  }
  return labels[category] ?? category
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    educativo: 'bg-blue-100 text-blue-700',
    datas_especiais: 'bg-pink-100 text-pink-700',
    papelaria: 'bg-green-100 text-green-700',
  }
  return colors[category] ?? 'bg-gray-100 text-gray-700'
}

export function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(digits[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  return remainder === parseInt(digits[10])
}

export function maskCPF(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
}
