import { SUBJECT_TEMPLATES } from '../types';

/**
 * Generates subject line based on prefix, ACK number, and Bank name
 */
export function generateSubject(
  ackNo: string,
  bankName: string,
  templatePrefix: string = 'Request for KYC and Transaction Details of Fraudulent Account'
): string {
  const cleanAck = ackNo ? ackNo.trim() : '';
  const cleanBank = bankName ? bankName.trim() : '';

  const ackPart = cleanAck ? `[${cleanAck}]` : '[]';
  const bankPart = cleanBank ? `[${cleanBank}]` : '[]';

  return `${templatePrefix.trim()} ${ackPart} ${bankPart}`;
}
