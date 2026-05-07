// src/features/profile/components/AccountSettings.tsx
import { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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


export default function AccountSettings() {
	const user = useAuthStore((state) => state.user);
	const navigate = useNavigate();
	const { mutate: deleteAccount, isPending } = useDeleteAccount();
	const [ showDeleteDialog, setShowDeleteDialog ] = useState(false);
	const [ confirmText, setConfirmText ] = useState('');

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
			<Card className='rounded-none border-border'>
				<CardHeader>
					<CardTitle className='tracking-widest'>Configuración de cuenta</CardTitle>
					<CardDescription className='tracking-wide'>
						Administra tus preferencias y configuración
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-6'>
					{/* Estado de cuenta */}
					<div className='space-y-3'>

						<div className='flex items-center justify-between'>
							<div>
								<h3 className='font-medium tracking-widest'>Estado de cuenta</h3>
							<p className='text-sm text-muted-foreground tracking-wide'>
									Tu cuenta está actualmente activa.
								</p>
							</div>
							<Badge variant={'default'} className='bg-(--success)'>
								Activa
							</Badge>
						</div>

						<div className='flex items-center justify-between'>
							<div>
								<h3 className='font-medium tracking-widest'>Rol</h3>
							<p className='text-sm text-muted-foreground tracking-wide'>
									Nivel de acceso en la plataforma.
								</p>
							</div>
							<Badge variant={'outline'} className='rounded-none tracking-widest'>
								{user?.role === 'admin' ? 'Administrador' : 'Usuario'}
							</Badge>
						</div>

						<div className='flex items-center justify-between'>
							<div>
								<h3 className='font-medium tracking-widest'>Miembro desde</h3>
							<p className='text-sm text-muted-foreground tracking-wide'>
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

					{/* <Separator /> */}

					{/* Notificaciones */}
					{/* <div className='space-y-4'>
						<h3 className='font-medium tracking-widest'>Notificaciones</h3>

						<div className="flex items-center justify-between">
							<div className="space-y-0 5">
								<Label htmlFor='email-notifications' className='tracking-widest'>
									Notificaciones por email
								</Label>
							<p className='text-sm text-muted-foreground tracking-wide'>
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
								<Label htmlFor='push-notifications' className='tracking-widest'>
									Notificaciones push
								</Label>
							<p className='text-sm text-muted-foreground tracking-wide'>
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
								<Label htmlFor='marketing-emails' className='tracking-widest'>
									Emails de marketing
								</Label>
							<p className='text-sm text-muted-foreground tracking-wide'>
									Recibe notificaciones y ofertas especiales
								</p>
							</div>
							<Switch
								id='marketing-emails'
								checked={marketingEmails}
								onCheckedChange={setMarketingEmails}
							/>
						</div>
					</div> */}

					<Separator />
					{/* Zona de peligro */}
					<div className="space-y-4">

						<div className="flex items-center gap-2">
							<AlertTriangle className='w-5 h-5 text-destructive' />
							<h3 className='font-medium text-destructive tracking-widest'>Zona de peligro</h3>
						</div>

						<div className="bg-destructive/10 border border-destructive/20 rounded-none p-4 space-y-3">
							<div>
								<h4 className="font-medium text-destructive tracking-widest"> Eliminar cuenta</h4>
								<p className="text-sm text-destructive/80 mt-1 tracking-wide">
									Una vez eliminada tu cuenta, no podrás recuperar tu
									información. Esta acción es permanente.
								</p>
							</div>

							<Button
								variant={'destructive'}
								onClick={()=> setShowDeleteDialog(true)}
								className='w-full sm:w-auto rounded-none tracking-widest'
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
				<DialogContent className='rounded-none border-border'>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-destructive tracking-widest">
							<AlertTriangle className="w-5 h-5" />
							¿Eliminar cuenta?
						</DialogTitle>
						<DialogDescription className="space-y-3 tracking-wide">
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
							className="w-full px-3 py-2 border border-border rounded-none bg-(--surface) text-foreground 
                tracking-wide focus:outline-none focus:ring-2 focus:ring-destructive"
							disabled={isPending}
						/>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowDeleteDialog(false)}
							disabled={isPending}
              className='rounded-none tracking-widest'
						>
							Cancelar
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteAccount}
							disabled={!canDelete || isPending}
              className='rounded-none tracking-widest'
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

