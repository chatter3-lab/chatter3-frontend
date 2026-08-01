const fs = require('fs');
const filePath = 'C:\\Users\\Rahman-Khan\\chatter3-frontend\\src\\App.jsx';
const src = fs.readFileSync(filePath, 'utf8');

let out = '';
let i = 0;
const N = src.length;
let templateCount = 0;
let convertedCount = 0;

function isAlphaNumOrUnderscore(ch) {
  return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === '_' || ch === '$';
}

while (i < N) {
  const c = src[i];

  // Skip single-quoted strings
  if (c === "'" ) {
    let j = i + 1;
    while (j < N) {
      if (src[j] === '\\') { j += 2; continue; }
      if (src[j] === "'") { j++; break; }
      j++;
    }
    out += src.slice(i, j);
    i = j;
    continue;
  }

  // Skip double-quoted strings
  if (c === '"') {
    let j = i + 1;
    while (j < N) {
      if (src[j] === '\\') { j += 2; continue; }
      if (src[j] === '"') { j++; break; }
      j++;
    }
    out += src.slice(i, j);
    i = j;
    continue;
  }

  // Skip line comments
  if (c === '/' && i + 1 < N && src[i+1] === '/') {
    let j = i;
    while (j < N && src[j] !== '\n') j++;
    out += src.slice(i, j);
    i = j;
    continue;
  }

  // Skip block comments
  if (c === '/' && i + 1 < N && src[i+1] === '*') {
    let j = i + 2;
    while (j < N) {
      if (src[j] === '*' && j + 1 < N && src[j+1] === '/') { j += 2; break; }
      j++;
    }
    out += src.slice(i, j);
    i = j;
    continue;
  }

  // Template literal
  if (c === '`') {
    templateCount++;
    let tplStart = i;
    i++; // skip opening `
    let parts = [];
    let strBuf = '';

    while (i < N && src[i] !== '`') {
      if (src[i] === '\\' && i + 1 < N) {
        if (src[i+1] === '$') {
          strBuf += '$';
          i += 2;
        } else if (src[i+1] === '`') {
          strBuf += '`';
          i += 2;
        } else {
          strBuf += src[i] + src[i+1];
          i += 2;
        }
      } else if (src[i] === '$' && i + 1 < N && src[i+1] === '{') {
        if (strBuf.length > 0) {
          parts.push({k:'s', v: strBuf});
          strBuf = '';
        }
        i += 2; // skip ${
        let depth = 1;
        let expr = '';
        while (i < N && depth > 0) {
          const ec = src[i];
          if (ec === '\\') {
            // Skip escaped character in expression
            expr += src[i] + (i+1 < N ? src[i+1] : '');
            i += 2;
          } else if (ec === '{') {
            depth++;
            expr += ec;
            i++;
          } else if (ec === '}') {
            depth--;
            if (depth > 0) expr += ec;
            i++;
          } else if (ec === "'" ) {
            expr += ec; i++;
            while (i < N && src[i] !== "'") {
              if (src[i] === '\\') { expr += src[i] + src[i+1]; i += 2; }
              else { expr += src[i]; i++; }
            }
            if (i < N) { expr += src[i]; i++; }
          } else if (ec === '"') {
            expr += ec; i++;
            while (i < N && src[i] !== '"') {
              if (src[i] === '\\') { expr += src[i] + src[i+1]; i += 2; }
              else { expr += src[i]; i++; }
            }
            if (i < N) { expr += src[i]; i++; }
          } else if (ec === '`') {
            // Nested template literal in expression - skip it
            expr += '`'; i++;
            while (i < N && src[i] !== '`') {
              if (src[i] === '\\') { expr += src[i] + src[i+1]; i += 2; }
              else { expr += src[i]; i++; }
            }
            if (i < N) { expr += '`'; i++; }
          } else {
            expr += ec;
            i++;
          }
        }
        parts.push({k:'e', v: expr.trim()});
      } else {
        strBuf += src[i];
        i++;
      }
    }
    if (strBuf.length > 0) {
      parts.push({k:'s', v: strBuf});
    }
    
    if (i < N) i++; // skip closing `
    else { console.error('UNTERMINATED template literal at position', tplStart); break; }

    // Build concatenation
    if (parts.length === 0) {
      out += "''";
      convertedCount++;
    } else if (parts.length === 1 && parts[0].k === 's') {
      // Pure string - use single quotes
      let s = parts[0].v;
      // Escape backslashes first
      s = s.replace(/\\/g, '\\\\');
      // Escape single quotes
      s = s.replace(/'/g, "\\'");
      // Escape newlines
      s = s.replace(/\r?\n/g, '\\n');
      s = s.replace(/\r/g, '\\r');
      // Escape tabs
      s = s.replace(/\t/g, '\\t');
      out += "'" + s + "'";
      convertedCount++;
    } else {
      // Has interpolations - build concat
      let concatParts = [];
      for (const p of parts) {
        if (p.k === 's') {
          let s = p.v;
          if (s) {
            s = s.replace(/\\/g, '\\\\');
            s = s.replace(/'/g, "\\'");
            s = s.replace(/\r?\n/g, '\\n');
            s = s.replace(/\r/g, '\\r');
            s = s.replace(/\t/g, '\\t');
            concatParts.push("'" + s + "'");
          }
        } else {
          let expr = p.v;
          // Wrap in parens if it contains commas, ternaries, or logical operators at top level
          // to avoid precedence issues
          if (expr.includes('?') || (expr.includes('||') && !expr.startsWith('(')) || (expr.includes('&&') && !expr.startsWith('('))) {
            if (!(expr.startsWith('(') && expr.endsWith(')'))) {
              expr = '(' + expr + ')';
            }
          }
          concatParts.push(expr);
        }
      }
      if (concatParts.length === 1) {
        out += concatParts[0];
      } else {
        out += concatParts.join('+');
      }
      convertedCount++;
    }
    continue;
  }

  // Regular character
  out += c;
  i++;
}

fs.writeFileSync(filePath, out, 'utf8');
let backtickCount = 0;
for (let k = 0; k < out.length; k++) { if (out.charCodeAt(k) === 96) backtickCount++; }
console.log('Templates found:', templateCount, 'Converted:', convertedCount, 'Remaining backticks:', backtickCount);
console.log('Output size:', out.length);
