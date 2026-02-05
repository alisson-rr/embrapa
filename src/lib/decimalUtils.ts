// Utilitário para tratamento de números decimais
// Frontend exibe com vírgula, API recebe com ponto

/**
 * Converte valor do frontend (vírgula) para API (ponto)
 * @param value Valor do input (pode ter vírgula ou ponto)
 * @returns string com ponto decimal para API
 */
export const formatForAPI = (value: string): string => {
  if (!value) return '';
  return value.replace(',', '.');
};

/**
 * Converte valor da API (ponto) para frontend (vírgula)
 * @param value Valor da API (ponto decimal)
 * @returns string com vírgula para exibição
 */
export const formatForDisplay = (value: string | number): string => {
  if (!value) return '';
  return String(value).replace('.', ',');
};

/**
 * Valida se o valor é um número válido
 * @param value Valor a validar
 * @returns boolean
 */
export const isValidNumber = (value: string): boolean => {
  if (!value) return false;
  const normalized = value.replace(',', '.');
  return !isNaN(Number(normalized)) && isFinite(Number(normalized));
};

/**
 * Converte string para número
 * @param value Valor a converter
 * @returns number ou null se inválido
 */
export const parseNumber = (value: string): number | null => {
  if (!value) return null;
  const normalized = value.replace(',', '.');
  const num = Number(normalized);
  return isNaN(num) || !isFinite(num) ? null : num;
};
