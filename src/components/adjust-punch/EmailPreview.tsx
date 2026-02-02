import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Employee } from '@/types/employee';
import { format } from 'date-fns';
import { formatCPF } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  to: string;
  cc: string;
  subject: string;
  selected: Employee | null;
  dates: Date[];
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia!";
  if (hour < 18) return "Boa tarde!";
  return "Boa noite!";
}

export function EmailPreview({ open, onOpenChange, to, cc, subject, selected, dates }: Props) {
  const { toast } = useToast();

  const datesListText = useMemo(
    () =>
      dates
        .slice()
        .sort((a, b) => a.getTime() - b.getTime())
        .map((d) => format(d, 'dd/MM/yyyy'))
        .join('\n'),
    [dates]
  );

  const datesListHtml = useMemo(
    () =>
      dates
        .slice()
        .sort((a, b) => a.getTime() - b.getTime())
        .map((d) => format(d, 'dd/MM/yyyy'))
        .join('<br />'),
    [dates]
  );

  const greeting = getGreeting();

  const body = selected
    ? `${greeting}\n\nComo coordenador da área de manutenção da CMA SUL na ${selected.lotacao} e responsável pela equipe de manutenção, operação e administrativa das unidades da CPR SUL/CMA SUL da Servitium, gostaria de informar que o colaborador ${selected.nome}, matrícula ${selected.matricula}, CPF ${selected.cpf ? formatCPF(selected.cpf) : '-'}, da especialidade ${selected.especialidade}, do contrato ${selected.contrato}, desempenhou suas atividades normalmente conforme o horário estabelecido nos dias:\n\n${datesListText}\n\nO colaborador mencionou ter encontrado dificuldades para registrar o ponto nesses dias, o que impossibilitou a validação dos registros.\nSolicito gentilmente que sejam realizados os ajustes necessários no sistema para inclusão dos dias de trabalho do colaborador mencionado.\n\nContato do Colaborador: ${selected.telefone ?? '-'} (Whatsapp)`
    : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl shadow-none">
        <DialogHeader>
          <DialogTitle>Prévia do E-mail</DialogTitle>
          <DialogDescription>Copie os campos abaixo e envie pelo seu cliente de e-mail.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p><span className="font-medium">Destinatário:</span> {to}</p>
          <p><span className="font-medium">Cc:</span> {cc}</p>
          <p><span className="font-medium">Assunto:</span> {subject}</p>
          {selected && (
            <article className="w-full rounded-md border border-input bg-background p-4 leading-relaxed">
              <p style={{ marginBottom: '12px' }}>{greeting}</p>
              <p style={{ margin: '12px 0' }}>
                Como coordenador da CMA SUL na {selected.lotacao} e responsável pela equipe de manutenção e administrativa da Servitium, gostaria de informar que o colaborador <strong>{selected.nome}</strong>, matrícula <strong>{selected.matricula}</strong>, CPF <strong>{selected.cpf ? formatCPF(selected.cpf) : '-'}</strong>, da especialidade <strong>{selected.especialidade}</strong>, do contrato <strong>{selected.contrato}</strong>, desempenhou suas atividades normalmente conforme o horário estabelecido nos dias:
              </p>
              <p style={{ margin: '12px 0' }} dangerouslySetInnerHTML={{ __html: datesListHtml }} />
              <p style={{ margin: '12px 0' }}>
                O colaborador mencionou ter encontrado dificuldades para registrar o ponto nesses dias, o que impossibilitou a validação dos registros.
                Solicito gentilmente que sejam realizados os ajustes necessários no sistema para inclusão dos dias de trabalho do colaborador mencionado.
              </p>
              <p style={{ marginTop: '12px' }}>
                Contato do Colaborador: <strong>{selected.telefone ?? '-'}</strong> (Whatsapp)
              </p>
            </article>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={async () => {
              if (!selected) return;

              const greeting = getGreeting();
              const plainText = `Destinatário: ${to}\nCc: ${cc}\nAssunto: ${subject}\n\n${greeting}\n\nComo coordenador da área de manutenção da CMA SUL na ${selected.lotacao} e responsável pela equipe de manutenção, operação e administrativa das unidades da CPR SUL/CMA SUL da Servitium, gostaria de informar que o colaborador ${selected.nome}, matrícula ${selected.matricula}, CPF ${selected.cpf ? formatCPF(selected.cpf) : '-'}, da especialidade ${selected.especialidade}, do contrato ${selected.contrato}, desempenhou suas atividades normalmente conforme o horário estabelecido nos dias:\n\n${datesListText}\n\nO colaborador mencionou ter encontrado dificuldades para registrar o ponto nesses dias, o que impossibilitou a validação dos registros.\nSolicito gentilmente que sejam realizados os ajustes necessários no sistema para inclusão dos dias de trabalho do colaborador mencionado.\n\nContato do Colaborador: ${selected.telefone ?? '-'} (Whatsapp)`;
              const htmlContent = `
                <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #000080;">
                  <p style="margin: 0 0 12px 0;"><strong>Destinatário:</strong> ${to}</p>
                  <p style="margin: 0 0 12px 0;"><strong>Cc:</strong> ${cc}</p>
                  <p style="margin: 0 0 12px 0;"><strong>Assunto:</strong> ${subject}</p>
                  <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                  <p style="margin: 0 0 12px 0;">${greeting}</p>
                  <p style="margin: 12px 0;">
                    Como coordenador da CMA SUL na ${selected.lotacao} e responsável pela equipe de manutenção e administrativa da Servitium, gostaria de informar que o colaborador <strong>${selected.nome}</strong>, matrícula <strong>${selected.matricula}</strong>, CPF <strong>${selected.cpf ? formatCPF(selected.cpf) : '-'}</strong>, da especialidade <strong>${selected.especialidade}</strong>, do contrato <strong>${selected.contrato}</strong>, desempenhou suas atividades normalmente conforme o horário estabelecido nos dias:
                  </p>
                  <p style="margin: 12px 0;">${datesListHtml}</p>
                  <p style="margin: 12px 0;">
                    O colaborador mencionou ter encontrado dificuldades para registrar o ponto nesses dias, o que impossibilitou a validação dos registros.
                    Solicito gentilmente que sejam realizados os ajustes necessários no sistema para inclusão dos dias de trabalho do colaborador mencionado.
                  </p>
                  <p style="margin: 12px 0;">
                    Contato do Colaborador: <strong>${selected.telefone ?? '-'}</strong> (Whatsapp)
                  </p>
                </div>
              `;

              try {
                const textBlob = new Blob([plainText], { type: 'text/plain' });
                const htmlBlob = new Blob([htmlContent], { type: 'text/html' });

                const clipboardItem = new ClipboardItem({
                  'text/plain': textBlob,
                  'text/html': htmlBlob,
                });

                await navigator.clipboard.write([clipboardItem]);

                toast({
                  title: 'Copiado',
                  description: 'Conteúdo formatado copiado para a área de transferência.'
                });
              } catch (err) {
                console.error('Erro ao copiar:', err);
                // Fallback para texto simples se o ClipboardItem falhar
                try {
                  await navigator.clipboard.writeText(plainText);
                  toast({
                    title: 'Copiado (apenas texto)',
                    description: 'Houve um erro ao copiar a formatação, o texto puro foi copiado.',
                    variant: 'default'
                  });
                } catch (fallbackErr) {
                  toast({
                    title: 'Falha ao copiar',
                    description: 'Tente copiar manualmente selecionando o texto.',
                    variant: 'destructive'
                  });
                }
              }
            }}
          >
            Copiar
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
