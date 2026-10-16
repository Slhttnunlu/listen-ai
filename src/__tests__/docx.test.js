import JSZip from 'jszip';
import { extractDocxText, extractTextFromDocumentXml } from '../services/docx';

describe('DOCX extraction', () => {
  test('preserves paragraphs, line breaks, tabs, Turkish text and XML entities', () => {
    const xml = `
      <w:document xmlns:w="word">
        <w:body>
          <w:p><w:r><w:t>İlk &amp; önemli</w:t></w:r><w:tab/><w:r><w:t>not</w:t></w:r></w:p>
          <w:p><w:r><w:t>İkinci</w:t></w:r><w:br/><w:r><w:t>satır &#x1F642;</w:t></w:r></w:p>
        </w:body>
      </w:document>`;
    expect(extractTextFromDocumentXml(xml)).toBe('İlk & önemli not\nİkinci\nsatır 🙂');
  });

  test('extracts word/document.xml from a DOCX archive', async () => {
    const archive = new JSZip();
    archive.file(
      'word/document.xml',
      '<w:document><w:body><w:p><w:r><w:t>DOCX içeriği</w:t></w:r></w:p></w:body></w:document>'
    );
    const buffer = await archive.generateAsync({ type: 'arraybuffer' });
    await expect(extractDocxText(buffer)).resolves.toBe('DOCX içeriği');
  });

  test('rejects corrupt archives and archives without document content', async () => {
    await expect(extractDocxText(new Uint8Array([1, 2, 3]))).rejects.toThrow('bozuk');
    const emptyArchive = await new JSZip().generateAsync({ type: 'arraybuffer' });
    await expect(extractDocxText(emptyArchive)).rejects.toThrow('okunabilir belge');
  });
});
