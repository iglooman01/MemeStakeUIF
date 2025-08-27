import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePDF() {
    try {
        console.log('Starting PDF generation...');
        
        // Launch browser
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Read the HTML file
        const htmlPath = path.join(__dirname, 'ui-documentation.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Set content and wait for load
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // Generate PDF
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            }
        });
        
        // Save PDF
        const outputPath = path.join(__dirname, 'memestake-ui-documentation.pdf');
        fs.writeFileSync(outputPath, pdf);
        
        console.log(`PDF generated successfully: ${outputPath}`);
        
        await browser.close();
        return outputPath;
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}

generatePDF().catch(console.error);