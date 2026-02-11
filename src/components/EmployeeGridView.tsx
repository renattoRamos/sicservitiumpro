import React, { useMemo, useState } from 'react';
import { Employee } from '@/types/employee';
import { EmployeeCard } from './EmployeeCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

interface EmployeeGridViewProps {
    data: Employee[];
    onEdit: (employee: Employee) => void;
    onDelete: (id: string) => void;
    searchQuery?: string;
    onSearchQueryChange?: (v: string) => void;
}

export function EmployeeGridView({
    data,
    onEdit,
    onDelete,
    searchQuery,
    onSearchQueryChange,
}: EmployeeGridViewProps) {
    const [internalQuery, setInternalQuery] = useState('');
    const query = searchQuery ?? internalQuery;
    const setQuery = onSearchQueryChange ?? setInternalQuery;

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Adjust for grid layout (2x4 or 4x2)

    const sortedAndFiltered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const base = q
            ? data.filter(e => [e.nome, e.matricula, e.cpf, e.especialidade].filter(Boolean).some(v => String(v).toLowerCase().includes(q)))
            : data;

        // Default sort by name for consistent grid
        return [...base].sort((a, b) => a.nome.localeCompare(b.nome));
    }, [data, query]);

    const totalPages = Math.ceil(sortedAndFiltered.length / itemsPerPage);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedAndFiltered.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedAndFiltered, currentPage, itemsPerPage]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between bg-white p-4 rounded-sm border-2 border-primary/5 shadow-sm">
                <div className="relative max-w-md w-full">
                    <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", query && "hidden")} />
                    <Input
                        value={query}
                        onChange={e => { setQuery(e.target.value); setCurrentPage(1); }}
                        placeholder="Buscar funcionários..."
                        className="pl-10 pr-8 rounded-sm border-primary/10 focus-visible:ring-primary h-11"
                    />
                    {query && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent hover:text-foreground"
                            onClick={() => { setQuery(''); setCurrentPage(1); }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 bg-primary/5 rounded-sm border border-primary/10">
                        <span className="text-xs font-bold uppercase tracking-widest text-primary/70">
                            {sortedAndFiltered.length} Encontrados
                        </span>
                    </div>
                </div>
            </div>

            {paginatedData.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center bg-white rounded-sm border-2 border-dashed border-primary/10">
                    <LayoutGrid className="size-12 text-primary/20 mb-4" />
                    <p className="text-muted-foreground font-medium">Nenhum funcionário encontrado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedData.map((employee, index) => (
                        <EmployeeCard
                            key={employee.id || employee.matricula}
                            employee={employee}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            index={index}
                        />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <Pagination className="mt-8">
                    <PaginationContent className="gap-2">
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => handlePageChange(currentPage - 1)}
                                className={cn(
                                    "hover:bg-transparent text-primary font-medium transition-opacity",
                                    currentPage === 1 ? "opacity-30 pointer-events-none" : "cursor-pointer"
                                )}
                            />
                        </PaginationItem>

                        <div className="flex items-center gap-1 mx-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                                })
                                .map((page, i, arr) => {
                                    const showEllipsis = i > 0 && page - arr[i - 1] > 1;
                                    return (
                                        <React.Fragment key={page}>
                                            {showEllipsis && <span className="text-muted-foreground px-1">...</span>}
                                            <PaginationItem>
                                                <PaginationLink
                                                    onClick={() => handlePageChange(page)}
                                                    isActive={currentPage === page}
                                                    className={cn(
                                                        "size-10 transition-all font-bold rounded-lg border-none",
                                                        currentPage === page
                                                            ? "bg-white text-primary shadow-md hover:bg-white"
                                                            : "bg-transparent text-muted-foreground hover:text-primary hover:bg-primary/5"
                                                    )}
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        </React.Fragment>
                                    );
                                })}
                        </div>

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => handlePageChange(currentPage + 1)}
                                className={cn(
                                    "hover:bg-transparent text-primary font-medium transition-opacity",
                                    currentPage === totalPages ? "opacity-30 pointer-events-none" : "cursor-pointer"
                                )}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}
