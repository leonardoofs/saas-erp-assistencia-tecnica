/**
 * UnderTech - Generate Secret Script
 * Gera um JWT secret criptograficamente seguro
 */

const crypto = require('crypto');

console.log('\n=================================================');
console.log('Gerador de JWT Secret Seguro');
console.log('=================================================\n');

const secret = crypto.randomBytes(64).toString('hex');

console.log('Seu novo JWT Secret:');
console.log('\n' + secret + '\n');
console.log('Copie e cole no arquivo .env na variável JWT_SECRET');
console.log('=================================================\n');
