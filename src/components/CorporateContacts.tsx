import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Copy } from 'lucide-react'; // Importar o ícone Copy
import { CORPORATE_CONTACTS } from '@/constants/corporate-contacts';
import { useToast } from '@/hooks/use-toast'; // Importar useToast

export function CorporateContacts() {
  const { toast } = useToast();

  const formatPhoneNumberForDisplay = (phoneDigits: string) => {
    if (!phoneDigits) return '';
    const d = phoneDigits.replace(/\D/g, '');
    if (d.length === 11) {
      return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
    }
    return phoneDigits; // Fallback if not 11 digits
  };

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      toast({
        title: 'E-mail copiado!',
        description: `${email} foi copiado para a área de transferência.`,
      });
    } catch (err) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o e-mail para a área de transferência.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {CORPORATE_CONTACTS.map((contact, index) => (
        <Card key={index} className="neo-card transition-[transform,box-shadow] duration-300">
          <CardHeader>
            <CardTitle className="text-lg">{contact.department}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">E-mails:</p>
              {contact.emails.map((email, emailIndex) => (
                <div
                  key={emailIndex}
                  onClick={() => handleCopyEmail(email)}
                  className="flex items-center gap-2 text-primary hover:bg-primary/5 p-2 -ml-2 rounded-lg transition-colors cursor-pointer group"
                  title="Clique para copiar o e-mail"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="text-sm truncate">{email}</span>
                  <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
            {contact.phone && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Telefone:</p>
                <a
                  href={`https://wa.me/55${contact.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:bg-primary/5 p-2 -ml-2 rounded-lg transition-colors"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  <span className="text-sm">{formatPhoneNumberForDisplay(contact.phone)} (WhatsApp)</span>
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}