/**
 * UnderTech - Gerador de Contexto do Projeto
 * 
 * Execute: node generate-context.js
 * 
 * Este script gera um arquivo CONTEXT.txt com:
 * - Estrutura de pastas
 * - Lista de arquivos
 * - Estatísticas do projeto
 */

const fs = require('fs');
const path = require('path');

const IGNORE_FOLDERS = ['node_modules', '.git', 'database', 'dist', 'build'];
const IGNORE_FILES = ['.DS_Store', 'package-lock.json', '.gitignore'];

let stats = {
  totalFiles: 0,
  totalFolders: 0,
  htmlFiles: 0,
  cssFiles: 0,
  jsFiles: 0,
  totalLines: 0
};

function shouldIgnore(name) {
  return IGNORE_FOLDERS.includes(name) || IGNORE_FILES.includes(name);
}

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (e) {
    return 0;
  }
}

function scanDirectory(dir, prefix = '', output = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  items.forEach((item, index) => {
    if (shouldIgnore(item.name)) return;
    
    const isLast = index === items.length - 1;
    const connector = isLast ? '└──' : '├──';
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      stats.totalFolders++;
      output.push(`${prefix}${connector} 📁 ${item.name}/`);
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      scanDirectory(fullPath, newPrefix, output);
    } else {
      stats.totalFiles++;
      
      // Contar por tipo
      const ext = path.extname(item.name).toLowerCase();
      if (ext === '.html') stats.htmlFiles++;
      if (ext === '.css') stats.cssFiles++;
      if (ext === '.js') stats.jsFiles++;
      
      // Contar linhas
      const lines = countLines(fullPath);
      stats.totalLines += lines;
      
      output.push(`${prefix}${connector} 📄 ${item.name} (${lines} linhas)`);
    }
  });
  
  return output;
}

function generateContext() {
  console.log('🔍 Escaneando projeto...\n');
  
  const structure = scanDirectory('.');
  
  const output = `
╔═══════════════════════════════════════════════════════════════╗
║           📋 CONTEXTO DO PROJETO UNDERTECH                     ║
║                 Gerado em: ${new Date().toLocaleString('pt-BR')}          ║
╚═══════════════════════════════════════════════════════════════╝

📊 ESTATÍSTICAS DO PROJETO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Total de arquivos: ${stats.totalFiles}
📁 Total de pastas: ${stats.totalFolders}
📄 Arquivos HTML: ${stats.htmlFiles}
🎨 Arquivos CSS: ${stats.cssFiles}
⚙️ Arquivos JavaScript: ${stats.jsFiles}
📝 Total de linhas de código: ${stats.totalLines.toLocaleString('pt-BR')}

📂 ESTRUTURA DE PASTAS E ARQUIVOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
undertech/
${structure.join('\n')}

═══════════════════════════════════════════════════════════════

PADRÕES

## Stack
- Backend: Node.js
- Frontend: HTML/CSS/JS
- Banco: PostgreSQL

## Regras importantes
- Controllers não acessam banco diretamente
- Services concentram regra de negócio
- Nada de lógica no frontend

## Padrões
- Nomes em camelCase
- Pastas em inglês
- Variáveis em inglês
- Sem emoji nos códigos

💡 COMO USAR ESTE CONTEXTO COM O CLAUDE:

1️⃣ Copie TODO este arquivo (CONTEXT.txt)
2️⃣ Cole no início da conversa com o Claude
3️⃣ Diga: "Este é o contexto do meu projeto. Vamos trabalhar nele."

Pronto! O Claude terá visão completa do projeto! ✅

═══════════════════════════════════════════════════════════════
`;

  fs.writeFileSync('CONTEXT.txt', output, 'utf8');
  
  console.log('✅ Arquivo CONTEXT.txt gerado com sucesso!');
  console.log(`📊 ${stats.totalFiles} arquivos escaneados`);
  console.log(`📝 ${stats.totalLines.toLocaleString('pt-BR')} linhas de código\n`);
}

// Executar
generateContext();