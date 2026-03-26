// src/features/profile/components/ChangePasswordForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useChangePassword } from '../hooks/useProfile';

const ChangePasswordSchema = z.object({
	currentPassword: z
		.string()
		.min(8, { error: 'Password must be at least 8 characters long' })
		.max(64, { error: 'Password must be at most 64 characters long' })
		.regex(/[a-z]/, { error: 'Password must contain at least one lowercase letter' })
		.regex(/[A-Z]/, { error: 'Password must contain at least one uppercase letter' })
		.regex(/[0-9]/, { error: 'Password must contain at least one number' }),
	
	newPassword: z
		.string()
		.min(8, { error: 'Password must be at least 8 characters long' })
		.max(64, { error: 'Password must be at most 64 characters long' })
		.regex(/[a-z]/, { error: 'Password must contain at least one lowercase letter' })
		.regex(/[A-Z]/, { error: 'Password must contain at least one uppercase letter' })
		.regex(/[0-9]/, { error: 'Password must contain at least one number' }),

	confirmNewPassword: z
		.string()
		.min(8, { error: 'Password must be at least 8 characters long' })
		.max(64, { error: 'Password must be at most 64 characters long' })
		.regex(/[a-z]/, { error: 'Password must contain at least one lowercase letter' })
		.regex(/[A-Z]/, { error: 'Password must contain at least one uppercase letter' })
		.regex(/[0-9]/, { error: 'Password must contain at least one number' }),
}).refine((data)=> data.newPassword === data.confirmNewPassword,{
	message: 'Las contraseñas no coinciden',
	path: ['confirmNewPassword']
})

type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>;

export default function ChangePasswordForm(){
	const { mutate: changePassword, isPending } = useChangePassword()
	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		reset,
		formState: {errors}
	} = useForm<ChangePasswordFormData>({
		resolver: zodResolver(ChangePasswordSchema),
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmNewPassword: ''
		}
	})

	const newPassword = watch('newPassword');

	// Validaciones de contraseña en tiempo real
	const passwordValidation = {
		length : newPassword?.length >= 8,
		uppercase : /[A-Z]/.test(newPassword || ''),
		lowercase : /[a-z]/.test(newPassword || ''),
		number : /[0-9]/.test(newPassword || ''),
	}

	const onSubmit = (data: ChangePasswordFormData) => {
		changePassword(
			{
				oldPassword: data.currentPassword,
				newPassword: data.newPassword
			},
			{
				onSuccess: () => {
					reset();
				}
			}
		)
	}

	return (
		<Card className='rounded-none border-border'>
			<CardHeader>
				<CardTitle className='tracking-widest'>Cambiar Contraseña</CardTitle>
				<CardDescription className='tracking-wide'>
					Asegúrate de usar una contraseña segura
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

					{/* Contraseña actual */}
					<div className='space-y-2'>
						<Label htmlFor="currentPassword" className='tracking-widest'>
							Contraseña actual
						</Label>
						<div className='relative'>
							<Input 
								id='currentPassword'
								type={showCurrent ? 'text' : 'password'}
								placeholder='***********'
								disabled={isPending}
								{...register('currentPassword')}
                className='tracking-wide rounded-none'
							/>
							<button
								type='button'
								onClick={()=> setShowCurrent(!showCurrent)}
								className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
								disabled={isPending}
							>
								{showCurrent ? <EyeOff size={20} />:	<Eye size={20} />}
							</button>
						</div>
						{
							errors.currentPassword && (
								<p className='text-sm text-destructive'>
									{errors.currentPassword.message}
								</p>
							)
						}
					</div>

					{/* Nueva contraseña */}
					<div className='space-y-2'>
						<Label htmlFor="newPassword" className='tracking-widest'>
							Nueva contraseña
						</Label>
						<div className='relative'>
							<Input 
								id='newPassword'
								type={showNew ? 'text' : 'password'}
								placeholder='***********'
								disabled={isPending}
								{...register('newPassword')}
                className='tracking-wide rounded-none'

							/>
							<button
								type='button'
								onClick={()=> setShowNew(!showNew)}
							className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
							disabled={isPending}
						>
							{showNew ? <EyeOff size={20} />:	<Eye size={20} />}
						</button>
						</div>

						{/* Indicadores de fortaleza */}
						{newPassword && (
							<div className='space-y-1 text-xs mt-2'>
								<PasswordRequirement 
									met={passwordValidation.length}
									text='Al menos 8 caracteres'
								/>

								<PasswordRequirement 
									met={passwordValidation.uppercase}
									text='Una letra mayúscula'
								/>
								
								<PasswordRequirement 
									met={passwordValidation.lowercase}
									text='Una letra minúscula'
								/>
								
								<PasswordRequirement 
									met={passwordValidation.number}
									text='Un número'
								/>							
							</div>
						)}

						{
							errors.newPassword && (
							<p className='text-sm text-destructive'>
								{errors.newPassword.message}
							</p>
							)
						}
					</div>

					{/* Confirmar nueva contraseña */}
					<div className='space-y-2'>
						<Label htmlFor="confirmNewPassword" className='tracking-widest'>
							Confirmar nueva contraseña
						</Label>
						<div className='relative'>
							<Input
								id='confirmNewPassword'
								type={showConfirm ? 'text' : 'password'}
								placeholder='***********'
								disabled={isPending}
								{...register('confirmNewPassword')}
                className='tracking-wide rounded-none'
							/>
							<button
								type='button'
								onClick={() => setShowConfirm(!showConfirm)}
							className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
							disabled={isPending}
						>
							{showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
						</div>
						{
							errors.confirmNewPassword && (
							<p className='text-sm text-destructive'>
								{errors.confirmNewPassword.message}
							</p>
							)
						}
					</div>

					{/* Botón */}
					<div className='pt-4'>
						<Button type='submit' disabled={isPending} className='rounded-none tracking-widest'>
							{isPending ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Cambiando contraseña...
								</>
							):(
								'Cambiar contraseña'
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}

// Componente auxiliar
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
	return (
		<div className={`flex items-center gap-2 ${met ? 'text-[var(--success)]' : 'text-muted-foreground'}`}>
			{met ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
			<span>{text}</span>
		</div>
	);
}
