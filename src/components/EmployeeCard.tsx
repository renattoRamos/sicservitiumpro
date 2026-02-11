import React from 'react';
import { Employee } from '@/types/employee';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { Phone, User, Briefcase, MapPin, Hash, IdCard } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface EmployeeCardProps {
    employee: Employee;
    onEdit: (employee: Employee) => void;
    onDelete: (id: string) => void;
    index: number;
}

export function EmployeeCard({ employee, onEdit, onDelete, index }: EmployeeCardProps) {
    const { toast } = useToast();

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast({
                title: 'Copiado!',
                description: `${label} copiado para a área de transferência.`,
            });
        } catch (err) {
            toast({
                title: 'Erro ao copiar',
                description: 'Não foi possível copiar.',
                variant: 'destructive',
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="h-full"
        >
            <Card className="h-full group border-2 border-primary/5 rounded-2xl bg-white overflow-hidden transition-all duration-300 neo-card">
                <CardHeader className="p-4 bg-slate-50/30 border-b border-primary/5">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="size-16 rounded-xl border-2 border-primary/20 overflow-hidden bg-white shrink-0 shadow-sm">
                                <img
                                    src={employee.foto || '/placeholder.svg'}
                                    alt={employee.nome}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <div className="absolute -bottom-1 -right-1 size-5 bg-primary text-white flex items-center justify-center rounded-lg text-[10px] font-bold shadow-md">
                                {employee.sexo === 'M' ? 'M' : 'F'}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3
                                className="font-bold text-lg leading-tight truncate hover:text-primary cursor-pointer underline-offset-4 hover:underline transition-colors"
                                onClick={() => copyToClipboard(employee.nome, 'Nome')}
                            >
                                {employee.nome}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wider">
                                <Briefcase className="size-3 text-primary/60" />
                                <span>{employee.especialidade}</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                                <Hash className="size-4 text-primary/70" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-tight">Matrícula</span>
                                <button
                                    onClick={() => copyToClipboard(employee.matricula, 'Matrícula')}
                                    className="font-medium hover:text-primary transition-colors text-left"
                                >
                                    {employee.matricula}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                                <IdCard className="size-4 text-primary/70" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-tight">CPF</span>
                                <button
                                    onClick={() => employee.cpf && copyToClipboard(employee.cpf.replace(/[.-]/g, ''), 'CPF')}
                                    className="font-medium hover:text-primary transition-colors text-left"
                                >
                                    {employee.cpf || '-'}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                                <MapPin className="size-4 text-primary/70" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-tight">Lotação</span>
                                <span className="font-medium truncate">{employee.lotacao}</span>
                            </div>
                        </div>

                        {employee.telefone && (
                            <div className="flex items-center gap-3 text-sm">
                                <div className="size-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                                    <Phone className="size-4 text-green-600" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-tight">WhatsApp</span>
                                    <a
                                        href={`https://wa.me/55${employee.telefone.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium hover:text-green-600 transition-colors"
                                    >
                                        {employee.telefone}
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="p-3 bg-slate-50/40 border-t border-primary/5 flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 rounded-xl text-xs h-9 font-bold uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                        onClick={() => onEdit(employee)}
                    >
                        <AiOutlineEdit className="mr-1.5 size-4" /> Editar
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1 rounded-xl text-xs h-9 font-bold uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                            >
                                <AiOutlineDelete className="mr-1.5 size-4" /> Excluir
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl border-2">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="font-black uppercase tracking-tight text-destructive">Remover Funcionário?</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-600">
                                    Esta ação removerá permanentemente <span className="font-bold text-slate-900">{employee.nome}</span> do sistema.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl font-bold uppercase tracking-widest text-xs">Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => onDelete(employee.id)}
                                    className="rounded-xl font-bold uppercase tracking-widest text-xs bg-destructive hover:bg-destructive/90 shadow-sm"
                                >
                                    Confirmar Exclusão
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
