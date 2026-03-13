import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export default function Pagination({
	currentPage,
	totalPages,
	onPageChange
}: PaginationProps) {
	if (totalPages <= 1) return null;

	return (
		<div className="flex items-center justify-center gap-4">
			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
			>
				<ChevronLeft className="h-4 w-4 mr-1" />
				Anterior
			</Button>

			<span className="text-sm text-muted-foreground">
				Página <span className="font-semibold text-foreground">{currentPage}</span> de{' '}
				<span className="font-semibold text-foreground">{totalPages}</span>
			</span>

			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
			>
				Siguiente
				<ChevronRight className="h-4 w-4 ml-1" />
			</Button>
		</div>
	);
}
