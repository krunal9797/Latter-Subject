export interface SubjectTemplate {
  id: string;
  label: string;
  category: 'KYC' | 'Court Order' | 'Lien / Freeze';
  template: string; // e.g. "Request for KYC and Transaction Details of Fraudulent Account [ACK] [BANK]"
}

export const SUBJECT_TEMPLATES: SubjectTemplate[] = [
  {
    id: 'kyc-request',
    label: 'KYC & Transaction Details Request',
    category: 'KYC',
    template: 'Request for KYC and Transaction Details of Fraudulent Account',
  },
  {
    id: 'court-order-info',
    label: 'Account Info to Prepare Court Order',
    category: 'Court Order',
    template: 'Provide Information related to Accounts to prepare a court order',
  },
  {
    id: 'lien-freeze',
    label: 'Account Freezing & Lien Request',
    category: 'Lien / Freeze',
    template: 'Request for Marking Lien and Freezing of Fraudulent Account',
  },
];
