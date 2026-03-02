// src/features/profile/components/AccountSettings.tsx
import { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/store/authStore';
import { useDeleteAccount } from '../hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { set } from 'zod';


export default function AccountSettings() {
	const user = useAuthStore((state) => state.user);
	const navigate = useNavigate();
	const { mutate: deleteAccount, isPending } = useDeleteAccount();
	const [ showDeleteDialog, setShowDeleteDialog ] = useState(false);
	const [ confirmText, setConfirmText ] = useState('');

	// Estados de configuración (estos se guardan en la base de datos)
	const [ emailNotifications, setEmailNotifications ] = useState(true);
	const [ pushNotifications, setPushNotifications ] = useState(true);
	const [ marketingEmails, setMarketingEmails ] = useState(false);

	const handleDeleteAccount = () => {
		deleteAccount(undefined, {
			onSuccess: () => {
				setShowDeleteDialog(false);
				navigate('/login');
			}
		})
	}

	const canDelete = confirmText.toLowerCase() === 'eliminar';

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Configuración de cuenta</CardTitle>
					<CardDescription>
						Administra tus preferencias y configuración
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-6'>
					{/* Estado de cuenta */}
					<div className='space-y-3'>

						<div className='flex items-center justify-between'>
							<div>
								<h3 className='font-medium'>Estado de cuenta</h3>
								<p className='text-sm text-gray-500'>
									Tu cuenta está actualmente activa.
								</p>
							</div>
							<Badge variant={'default'} className='bg-green-500'>
								Activa
							</Badge>
						</div>

						<div className='flex items-center justify-between'>
							<div>
								<h3 className='font-medium'>Rol</h3>
								<p className='text-sm text-gray-500'>
									Nivel de acceso en la plataforma.
								</p>
							</div>
							<Badge variant={'outline'} >
								{user?.role === 'admin' ? 'Administrador' : 'Usuario'}
							</Badge>
						</div>

						<div className='flex items-center justify-between'>
							<div>
								<h3 className='font-medium'>Miembro desde</h3>
								<p className='text-sm text-gray-500'>
									Fecha de registro
								</p>
							</div>
							<span className='text-sm font-medium'>
								{user?.createdAt
									? new Date(user.createdAt).toLocaleDateString('es-ES', {
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})
									: 'Sin fecha'
								}
							</span>
						</div>
					</div>

					<Separator />

					{/* Notificaciones */}
					<div className='space-y-4'>
						<h3 className='font-medium'>Notificaciones</h3>

						<div className="flex items-center justify-between">
							<div className="space-y-0 5">
								<Label htmlFor='email-notifications'>
									Notificaciones por email
								</Label>
								<p className='text-sm text-gray-500'>
									Recibe emails sobre tu actividad
								</p>
							</div>
							<Switch
								id='email-notifications'
								checked={emailNotifications}
								onCheckedChange={setEmailNotifications}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0 5">
								<Label htmlFor='push-notifications'>
									Notificaciones push
								</Label>
								<p className='text-sm text-gray-500'>
									Recibe notificaciones en tu dispositivo
								</p>
							</div>
							<Switch
								id='push-notifications'
								checked={pushNotifications}
								onCheckedChange={setPushNotifications}
							/>
						</div>
						
						<div className="flex items-center justify-between">
							<div className="space-y-0 5">
								<Label htmlFor='marketing-emails'>
									Emails de marketing
								</Label>
								<p className='text-sm text-gray-500'>
									Recibe notificaciones y ofertas especiales
								</p>
							</div>
							<Switch
								id='marketing-emails'
								checked={marketingEmails}
								onCheckedChange={setMarketingEmails}
							/>
						</div>
					</div>

					<Separator />
					{/* Zona de peligro */}
					<div className="space-y-4">

						<div className="flex items-center gap-2">
							<AlertTriangle className='w-5 h-5 text-red-600' />
							<h3 className='font-medium text-red-600'>Zona de peligro</h3>
						</div>

						<div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
							<div>
								<h4 className="font-medium text-red-900"> Eliminar cuenta</h4>
								<p className="text-sm text-red-700 mt-1">
									Una vez eliminada tu cuenta, no podrás recuperar tu
									información. Esta acción es permanente.
								</p>
							</div>

							<Button
								variant={'destructive'}
								onClick={()=> setShowDeleteDialog(true)}
								className='w-full sm:w-auto'
							>
								<Trash2 className='mr-2 h-4 w-4' />
								Eliminar cuenta
							</Button>
						</div>
					</div>
				</CardContent>
			</Card >

			{/* Dialogo de confirmación para eliminar cuenta */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-red-600">
							<AlertTriangle className="w-5 h-5" />
							¿Eliminar cuenta?
						</DialogTitle>
						<DialogDescription className="space-y-3">
							<p>
								Esta acción es <strong>permanente</strong> y no se puede
								deshacer. Se eliminarán:
							</p>
							<ul className="list-disc list-inside space-y-1 text-sm">
								<li>Todos tus entrenamientos</li>
								<li>Tu historial de progreso</li>
								<li>Tus objetivos y récords personales</li>
								<li>Toda tu información personal</li>
							</ul>
							<p className="pt-2">
								Para confirmar, escribe <strong>"eliminar"</strong> en el campo
								de abajo:
							</p>
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-2">
						<input
							type="text"
							placeholder='Escribe "eliminar"'
							value={confirmText}
							onChange={(e) => setConfirmText(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
							disabled={isPending}
						/>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowDeleteDialog(false)}
							disabled={isPending}
						>
							Cancelar
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteAccount}
							disabled={!canDelete || isPending}
						>
							{isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Eliminando...
								</>
							) : (
								'Eliminar permanentemente'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}

