import JSZip from 'jszip';
import { validateExtractedDocument } from '../utils/document';

const XML_ENTITIES = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  quot: '"',
};

function decodeXml(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|amp|apos|gt|lt|quot);/gi, (entity, value) => {
    if (value.startsWith('#')) {
      const radix = value.startsWith('#x') ? 16 : 10;
      const offset = radix === 16 ? 2 : 1;
      const codePoint = Number.parseInt(value.slice(offset), radix);
      return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : entity;
    }
    return XML_ENTITIES[value.toLowerCase()] || entity;
  });
}

export function extractTextFromDocumentXml(xml) {
  const parts = [];
  const tokenPattern = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>|<w:tab\b[^>]*\/>|<w:br\b[^>]*\/>|<\/w:p>/gi;

  for (const match of xml.matchAll(tokenPattern)) {
    if (match[1] !== undefined) parts.push(decodeXml(match[1]));
    else if (/^<\/w:p/i.test(match[0])) parts.push('\n');
    else if (/^<w:tab/i.test(match[0])) parts.push('\t');
    else parts.push('\n');
  }

  return parts
    .join('')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

export async function extractDocxText(arrayBuffer) {
  let archive;
  try {
    archive = await JSZip.loadAsync(arrayBuffer);
  } catch {
    throw new Error('DOCX dosyası bozuk veya parola korumalı olabilir.');
  }

  const documentEntry = archive.file('word/document.xml');
  if (!documentEntry) throw new Error('DOCX içinde okunabilir belge içeriği bulunamadı.');
  const xml = await documentEntry.async('string');
  const validation = validateExtractedDocument(extractTextFromDocumentXml(xml));
  if (validation.error) throw new Error(validation.error);
  return validation.content;
}
