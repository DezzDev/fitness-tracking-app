// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<div className="text-center">
				<h1 className="text-9xl font-bold text-gray-200">404</h1>
				<h2 className="text-3xl font-bold text-gray-900 mt-4">
					Página no encontrada
				</h2>
				<p className="text-gray-600 mt-2 mb-8">
					La página que buscas no existe o ha sido movida.
				</p>
				<Link to="/dashboard">
					<Button>Volver al Dashboard</Button>
				</Link>
			</div>
		</div>
	);
}