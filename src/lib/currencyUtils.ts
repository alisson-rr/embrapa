// Utilitário para tratamento de moeda brasileira
// Frontend exibe "R$ 1.234,56", API recebe "1234.56"

/**
 * Formata valor para exibição no frontend (BRL)
 * @param value Valor numérico
 * @returns string formatada "R$ 1.234,56"
 */
export const formatCurrencyForDisplay = (value: number | string): string => {
  if (!value) return '';
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) : value;
  if (isNaN(num)) return '';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(num);
};

/**
 * Limpa valor de moeda para enviar para API
 * @param value Valor formatado "R$ 1.234,56"
 * @returns string "1234.56"
 */
export const cleanCurrencyForAPI = (value: string): string => {
  if (!value) return '';
  // Remove R$, espaços, pontos e substitui vírgula por ponto
  return value
    .replace('R$', '')
    .replace(/\s/g, '')
    .replace('.', '')
    .replace(',', '.')
    .trim();
};

/**
 * Formata input enquanto usuário digita
 * @param value Valor digitado pelo usuário
 * @returns string formatada com R$
 */
export const formatCurrencyInput = (value: string): string => {
  if (!value) return '';
  
  // Remove tudo exceto números e vírgula
  let cleanValue = value.replace(/[^\d,]/g, '');
  
  // Se estiver vazio, retorna vazio
  if (!cleanValue) return '';
  
  // Converte para número
  const num = parseFloat(cleanValue.replace(',', '.'));
  if (isNaN(num)) return '';
  
  // Formata como moeda brasileira
  return formatCurrencyForDisplay(num);
};

/**
 * Valida se o valor de moeda é válido
 * @param value Valor a validar
 * @returns boolean
 */
export const isValidCurrency = (value: string): boolean => {
  if (!value) return false;
  const cleanValue = cleanCurrencyForAPI(value);
  const num = parseFloat(cleanValue);
  return !isNaN(num) && isFinite(num) && num >= 0;
};
