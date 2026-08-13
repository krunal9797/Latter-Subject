/**
 * Formats the subject as explicitly requested:
 * Request for KYC and Transaction Details of Fraudulent Account [ACK_NO] [BANK_NAME]
 */
export function generateSubject(ackNo: string, bankName: string): string {
  const cleanAck = ackNo ? ackNo.trim() : '';
  const cleanBank = bankName ? bankName.trim() : '';

  const ackPart = cleanAck ? `[${cleanAck}]` : '[]';
  const bankPart = cleanBank ? `[${cleanBank}]` : '[]';

  return `Request for KYC and Transaction Details of Fraudulent Account ${ackPart} ${bankPart}`;
}
