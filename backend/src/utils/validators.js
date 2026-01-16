/**
 * UnderTech - Validadores
 * Funções utilitárias para validação de dados
 */

/**
 * Valida CPF
 * 
 * @param {string} cpf - CPF para validar
 * @returns {boolean} true se válido
 */
const validarCPF = (cpf) => {
  if (!cpf) return false;

  // Remover formatação
  const cpfLimpo = cpf.replace(/\D/g, '');

  // Validar tamanho
  if (cpfLimpo.length !== 11) return false;

  // Validar sequências iguais (111.111.111-11, etc)
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

  // Validar primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  const digitoVerificador1 = resto >= 10 ? 0 : resto;

  if (digitoVerificador1 !== parseInt(cpfLimpo.charAt(9))) {
    return false;
  }

  // Validar segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  const digitoVerificador2 = resto >= 10 ? 0 : resto;

  if (digitoVerificador2 !== parseInt(cpfLimpo.charAt(10))) {
    return false;
  }

  return true;
};

/**
 * Valida email
 * 
 * @param {string} email - Email para validar
 * @returns {boolean} true se válido
 */
const validarEmail = (email) => {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valida telefone brasileiro
 * 
 * @param {string} telefone - Telefone para validar
 * @returns {boolean} true se válido
 */
const validarTelefone = (telefone) => {
  if (!telefone) return false;
  const telefoneLimpo = telefone.replace(/\D/g, '');
  // Aceita 10 (fixo) ou 11 (celular) dígitos
  return telefoneLimpo.length === 10 || telefoneLimpo.length === 11;
};

/**
 * Valida CEP brasileiro
 * 
 * @param {string} cep - CEP para validar
 * @returns {boolean} true se válido
 */
const validarCEP = (cep) => {
  if (!cep) return false;
  const cepLimpo = cep.replace(/\D/g, '');
  return cepLimpo.length === 8;
};

/**
 * Valida se string não está vazia (após trim)
 * 
 * @param {string} valor - Valor para validar
 * @returns {boolean} true se não vazio
 */
const validarNaoVazio = (valor) => {
  return valor && valor.trim().length > 0;
};

/**
 * Valida comprimento mínimo
 * 
 * @param {string} valor - Valor para validar
 * @param {number} minimo - Comprimento mínimo
 * @returns {boolean} true se atende o mínimo
 */
const validarComprimentoMinimo = (valor, minimo) => {
  if (!valor) return false;
  return valor.trim().length >= minimo;
};

/**
 * Valida comprimento máximo
 * 
 * @param {string} valor - Valor para validar
 * @param {number} maximo - Comprimento máximo
 * @returns {boolean} true se não excede o máximo
 */
const validarComprimentoMaximo = (valor, maximo) => {
  if (!valor) return true;
  return valor.trim().length <= maximo;
};

/**
 * Valida data no formato YYYY-MM-DD
 * 
 * @param {string} data - Data para validar
 * @returns {boolean} true se válida
 */
const validarData = (data) => {
  if (!data) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(data)) return false;
  
  const dateObj = new Date(data);
  return dateObj instanceof Date && !isNaN(dateObj);
};

/**
 * Valida se data está no futuro
 * 
 * @param {string} data - Data para validar
 * @returns {boolean} true se no futuro
 */
const validarDataFutura = (data) => {
  if (!validarData(data)) return false;
  const dateObj = new Date(data);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return dateObj > hoje;
};

/**
 * Valida número positivo
 * 
 * @param {number|string} numero - Número para validar
 * @returns {boolean} true se positivo
 */
const validarNumeroPositivo = (numero) => {
  const num = parseFloat(numero);
  return !isNaN(num) && num > 0;
};

module.exports = {
  validarCPF,
  validarEmail,
  validarTelefone,
  validarCEP,
  validarNaoVazio,
  validarComprimentoMinimo,
  validarComprimentoMaximo,
  validarData,
  validarDataFutura,
  validarNumeroPositivo
};