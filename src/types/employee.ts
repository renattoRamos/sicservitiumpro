export interface Employee {
  id: string;
  foto?: string; // base64 data URL
  nome: string;
  matricula: string; // only digits
  cpf?: string; // 11 digits, only numbers; format on UI as XXX.XXX.XXX-XX
  especialidade: string;
  lotacao: string;
  coordenacao: string;
  sexo?: string;
  telefone?: string; // (XX) XXXXX-XXXX
  endereco?: string;
  dataNascimento?: string; // YYYY-MM-DD
  dataAdmissao?: string; // YYYY-MM-DD
  escalaDeTrabalho?: string;
  contrato: string;
}
