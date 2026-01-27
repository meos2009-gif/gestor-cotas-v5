export interface Socio {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  ativo: boolean;
  dataInscricao: string;
  tipoQuota: 'mensal' | 'anual';
}
