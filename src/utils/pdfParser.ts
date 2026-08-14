import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker for Vite / browser
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

const COMMON_BANKS = [
  'Airtel Payments Bank',
  'Paytm Payments Bank',
  'Fino Payments Bank',
  'India Post Payments Bank',
  'Jio Payments Bank',
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Bank of Baroda',
  'Punjab National Bank',
  'Union Bank of India',
  'Canara Bank',
  'IndusInd Bank',
  'IDFC First Bank',
  'Federal Bank',
  'Yes Bank',
  'Bandhan Bank',
  'Central Bank of India',
  'Indian Bank',
  'Bank of India',
  'AU Small Finance Bank',
  'Equitas Small Finance Bank',
  'Ujjivan Small Finance Bank',
];

export interface ExtractedNotice {
  ackNo: string;
  bankName: string;
  rawText?: string;
  extractedLocally: boolean;
}

/**
 * Extracts text from PDF client-side directly in the browser
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

/**
 * Parse ACK number and Bank name from raw text using pattern recognition
 */
export function parseNoticeText(text: string): { ackNo: string; bankName: string } {
  let ackNo = '';
  let bankName = '';

  // 1. Extract Acknowledgement Number (usually 14 digits or prefixed by Acknowledgement/Ack/NCR)
  const ackPatterns = [
    /Acknowledgement\s*(?:No\.?|Number|#)?\s*[:.-]?\s*([0-9]{10,18})/i,
    /Ack\s*(?:No\.?|Number|#)?\s*[:.-]?\s*([0-9]{10,18})/i,
    /NCR\s*(?:No\.?|Number|#)?\s*[:.-]?\s*([0-9]{10,18})/i,
    /Complaint\s*(?:No\.?|Number|#)?\s*[:.-]?\s*([0-9]{10,18})/i,
    /\b(3[0-9]{13})\b/, // Standard 14-digit cyber crime portal acknowledgement starting with 3
    /\b([0-9]{14})\b/,  // Any 14-digit sequence
    /\b([0-9]{12,16})\b/ // 12-16 digit sequence
  ];

  for (const pattern of ackPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      ackNo = match[1].trim();
      break;
    }
  }

  // 2. Extract Bank Name
  // First check against known bank list (case-insensitive)
  for (const bank of COMMON_BANKS) {
    const regex = new RegExp(`\\b${bank.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text)) {
      bankName = bank;
      break;
    }
  }

  // If not found in known list, look for pattern "To, ... The Manager / Nodal Officer ... [Bank Name]"
  if (!bankName) {
    const toBankMatch = text.match(/To\s*,?\s*(?:Nodal\s*officer|The\s*Manager|Manager)?\s*[\n,]*\s*([A-Za-z\s]+(?:Bank|Payments\s*Bank|Financial|Pay))/i);
    if (toBankMatch && toBankMatch[1]) {
      const candidate = toBankMatch[1].replace(/[\r\n]+/g, ' ').trim();
      if (candidate.length > 3 && candidate.length < 50) {
        bankName = candidate;
      }
    }
  }

  // If still not found, check generic Bank pattern
  if (!bankName) {
    const genericBankMatch = text.match(/([A-Z][A-Za-z\s]{2,30}(?:Payments\s*Bank|Payment\s*Bank|Bank\s*Ltd|Bank))/);
    if (genericBankMatch && genericBankMatch[1]) {
      bankName = genericBankMatch[1].trim();
    }
  }

  return { ackNo, bankName };
}
