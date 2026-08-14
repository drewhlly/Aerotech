export type DocumentStatus =
  | "active"
  | "expiring"
  | "expired"
  | "missing";

export type DocumentRequirement = {
  id: string;
  title: string;
  description: string;
  category: string;
  requiredFor: string;
  mandatory: boolean;
};

export type DocumentRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  title: string;
  category: string;
  status: DocumentStatus;
  mandatory: boolean;
  required: boolean;
  issueDate: string;
  issuedDate: string;
  expiryDate: string;
  uploadedAt: string;
  uploadedBy: string;
};

export const DOCUMENT_REQUIREMENTS: DocumentRequirement[] = [
  {
    id: "employment-contract",
    title: "Employment Contract",
    description: "Signed employment agreement.",
    category: "Employment",
    requiredFor: "All employees",
    mandatory: true,
  },
  {
    id: "identity-document",
    title: "Identity Document",
    description: "Valid government-issued identification.",
    category: "Identity",
    requiredFor: "All employees",
    mandatory: true,
  },
  {
    id: "bank-details",
    title: "Bank Details",
    description: "Verified employee banking information.",
    category: "Payroll",
    requiredFor: "All employees",
    mandatory: true,
  },
  {
    id: "tax-document",
    title: "Tax Document",
    description: "Required employee tax documentation.",
    category: "Tax",
    requiredFor: "All employees",
    mandatory: true,
  },
  {
    id: "qualification",
    title: "Qualification Certificate",
    description: "Relevant educational or professional qualification.",
    category: "Qualification",
    requiredFor: "Selected roles",
    mandatory: false,
  },
];

export const DOCUMENTS: DocumentRecord[] = [
  {
    id: "doc-001",
    employeeId: "EMP-001",
    employeeName: "John Doe",
    type: "Employment Contract",
    title: "Employment Contract",
    category: "Employment",
    status: "active",
    mandatory: true,
    required: true,
    issueDate: "2026-01-10",
    issuedDate: "2026-01-10",
    expiryDate: "",
    uploadedAt: "2026-01-10",
    uploadedBy: "HR Admin",
  },
  {
    id: "doc-002",
    employeeId: "EMP-002",
    employeeName: "Jane Smith",
    type: "Identity Document",
    title: "Identity Document",
    category: "Identity",
    status: "expiring",
    mandatory: true,
    required: true,
    issueDate: "2025-09-15",
    issuedDate: "2025-09-15",
    expiryDate: "2026-09-15",
    uploadedAt: "2025-09-15",
    uploadedBy: "HR Admin",
  },
  {
    id: "doc-003",
    employeeId: "EMP-003",
    employeeName: "Michael Brown",
    type: "Bank Details",
    title: "Bank Details",
    category: "Payroll",
    status: "active",
    mandatory: true,
    required: true,
    issueDate: "2026-02-05",
    issuedDate: "2026-02-05",
    expiryDate: "",
    uploadedAt: "2026-02-05",
    uploadedBy: "HR Admin",
  },
  {
    id: "doc-004",
    employeeId: "EMP-004",
    employeeName: "Sarah Williams",
    type: "Tax Document",
    title: "Tax Document",
    category: "Tax",
    status: "expired",
    mandatory: true,
    required: true,
    issueDate: "2025-01-20",
    issuedDate: "2025-01-20",
    expiryDate: "2026-01-20",
    uploadedAt: "2025-01-20",
    uploadedBy: "HR Admin",
  },
  {
    id: "doc-005",
    employeeId: "EMP-005",
    employeeName: "David Johnson",
    type: "Qualification Certificate",
    title: "Qualification Certificate",
    category: "Qualification",
    status: "missing",
    mandatory: false,
    required: false,
    issueDate: "",
    issuedDate: "",
    expiryDate: "",
    uploadedAt: "",
    uploadedBy: "—",
  },
];

export function getDocumentById(id: string) {
  return DOCUMENTS.find((document) => document.id === id);
}

export function getDocumentsByEmployee(employeeId: string) {
  return DOCUMENTS.filter(
    (document) => document.employeeId === employeeId
  );
}

export function getActiveDocuments() {
  return DOCUMENTS.filter(
    (document) => document.status === "active"
  );
}

export function getExpiringDocuments() {
  return DOCUMENTS.filter(
    (document) => document.status === "expiring"
  );
}

export function getExpiredDocuments() {
  return DOCUMENTS.filter(
    (document) => document.status === "expired"
  );
}

export function getMissingDocuments() {
  return DOCUMENTS.filter(
    (document) => document.status === "missing"
  );
}
