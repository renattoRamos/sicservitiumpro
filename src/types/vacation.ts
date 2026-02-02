export interface Vacation {
  id: string;
  employeeId: string; // ID do funcionário
  employeeName: string; // Nome do funcionário para exibição
  plannedMonth: number; // Mês previsto (1-12)
  plannedYear: number; // Ano previsto
  sellDays: 'none' | 'first10' | 'last10'; // Vender 10 dias: nenhum, 10 primeiros, 10 últimos
  notificationDaysBefore: number; // Dias antes para notificação
  status: 'pending' | 'in_progress' | 'completed'; // Status das férias
}