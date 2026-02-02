export interface CorporateContact {
  department: string;
  emails: string[];
  phone?: string; // Armazenado como dígitos para facilitar a criação do link do WhatsApp
}

export const CORPORATE_CONTACTS: CorporateContact[] = [
  {
    department: "RH da Servitium (Controle e Ajuste de Ponto)",
    emails: ["ponto1@servitium.com.br", "rh@servitium.com.br"],
    phone: "81997919189",
  },
  {
    department: "Operacional da Servitium (Controle de Implantação de Férias)",
    emails: ["operacional@servitium.com.br"],
    phone: "81998501391",
  },
  {
    department: "Departamento Pessoal da Servitium (Controle de Documentação)",
    emails: ["dp@servitium.com.br"],
    phone: "81982565086",
  },
  {
    department: "Gestão de Contrato Servitium",
    emails: ["gestaodecontratos1@servitium.com.br"],
    phone: undefined, // Sem telefone para este departamento
  },
];