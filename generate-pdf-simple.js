import pdf from 'html-pdf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePDF() {
    try {
        console.log('Starting PDF generation with html-pdf...');
        
        // Read the HTML file
        const htmlPath = path.join(__dirname, 'ui-documentation.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        const options = {
            format: 'A4',
            border: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            },
            quality: '100',
            dpi: 150
        };
        
        return new Promise((resolve, reject) => {
            pdf.create(htmlContent, options).toFile('memestake-ui-documentation.pdf', (err, res) => {
                if (err) {
                    console.error('Error generating PDF:', err);
                    reject(err);
                } else {
                    console.log('PDF generated successfully:', res.filename);
                    resolve(res.filename);
                }
            });
        });
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}

generatePDF().catch(console.error);