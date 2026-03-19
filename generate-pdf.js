const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generatePDF() {
  const inputFile = path.join(__dirname, 'docs', 'BUSINESS_PLAN.md');
  const outputFile = path.join(__dirname, 'docs', 'BUSINESS_PLAN.pdf');
  
  // Read markdown content
  const mdContent = fs.readFileSync(inputFile, 'utf-8');
  
  // Convert markdown to HTML (simple conversion)
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      margin: 20mm;
    }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
    }
    h1 {
      color: #1a5490;
      font-size: 24pt;
      border-bottom: 3px solid #1a5490;
      padding-bottom: 10px;
      margin-top: 30px;
    }
    h2 {
      color: #2c3e50;
      font-size: 18pt;
      margin-top: 25px;
      border-bottom: 1px solid #bdc3c7;
      padding-bottom: 5px;
    }
    h3 {
      color: #34495e;
      font-size: 14pt;
      margin-top: 20px;
    }
    h4 {
      color: #555;
      font-size: 12pt;
      margin-top: 15px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 10pt;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #1a5490;
      color: white;
    }
    tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    code {
      background-color: #f4f4f4;
      padding: 2px 5px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 10pt;
    }
    blockquote {
      border-left: 4px solid #1a5490;
      margin: 15px 0;
      padding: 10px 20px;
      background-color: #f8f9fa;
      font-style: italic;
    }
    ul, ol {
      margin: 10px 0;
      padding-left: 25px;
    }
    li {
      margin: 5px 0;
    }
    hr {
      border: none;
      border-top: 2px solid #1a5490;
      margin: 30px 0;
    }
    .cover {
      text-align: center;
      padding: 100px 20px;
      page-break-after: always;
    }
    .cover h1 {
      border: none;
      font-size: 36pt;
      margin-bottom: 20px;
    }
    .cover .subtitle {
      font-size: 18pt;
      color: #666;
      margin-top: 50px;
    }
    .cover .date {
      font-size: 14pt;
      color: #999;
      margin-top: 30px;
    }
    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>
  <div class="cover">
    <h1>CatchLog</h1>
    <div class="subtitle">Business & Marketing Plan</div>
    <div class="subtitle" style="font-size: 14pt; margin-top: 20px;">Digitales Fangbuch für deutsche Angler</div>
    <div class="date">März 2026</div>
  </div>
  ${convertMarkdownToHTML(mdContent)}
</body>
</html>
  `;
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  // Generate PDF
  await page.pdf({
    path: outputFile,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  });
  
  await browser.close();
  console.log(`PDF generated: ${outputFile}`);
}

function convertMarkdownToHTML(md) {
  return md
    // Headers
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Code
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    // Blockquotes
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Horizontal rules
    .replace(/^\s*[-]{3,}\s*$/gim, '<hr>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
    // Unordered lists
    .replace(/^\s*[-\*]\s+(.*$)/gim, '<li>$1</li>')
    // Ordered lists
    .replace(/^\s*\d+\.\s+(.*$)/gim, '<li>$1</li>')
    // Tables (simplified)
    .replace(/\|(.+)\|/g, (match, content) => {
      const cells = content.split('|').map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    })
    // Line breaks
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br>')
    // Wrap in paragraph
    .replace(/^(.+)$/gim, '<p>$1</p>')
    // Clean up empty paragraphs
    .replace(/<p><\/p>/gim, '')
    // Fix list items
    .replace(/<p><li>(.+?)<\/li><\/p>/gim, '<li>$1</li>')
    // Wrap lists
    .replace(/(<li>.+<\/li>\s*)+/gim, '<ul>$&</ul>')
    // Page breaks before h1
    .replace(/<h1>/gim, '<div class="page-break"></div><h1>')
    // Fix first h1
    .replace(/<div class="page-break"><\/div><h1>/, '<h1>');
}

generatePDF().catch(console.error);
