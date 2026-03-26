// src/features/profile/components/ProfileImageUpload.tsx
import {useRef, useState} from 'react';
import { Camera, Loader2, Upload } from 'lucide-react';

import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import { Card, CardContent, CardDescription , CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useUploadProfileImage } from '../hooks/useProfile';

export default function ProfileImageUpload(){
	const user = useAuthStore((state)=> state.user);
	const {mutate: uploadImage, isPending} = useUploadProfileImage();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [preview, setPreview] = useState<string | null>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
		const file =  e.target.files?.[0];
		if(!file) return;

		// Validar tipo de archivo
		if(!file.type.startsWith('image/')){
			alert('Por favor selecciona un archivo de imagen');
			return;
		}

		// Validar tamaño de archivo 
		if(file.size > 5 * 1024 * 1024){
			alert('El tamaño máximo de un archivo es de 5 MB');
			return;
		}

		// Crear preview
		const reader = new FileReader();
		reader.onloadend = () =>{
			setPreview(reader.result as string);
		}
		reader.readAsDataURL(file);

		// Subir imagen
		uploadImage(file, {
			onSuccess: ()=>{
				setPreview(null);
			},
			onError: ()=>{
				setPreview(null);
			}
		})
	}

	const handleButtonClick = ()=>{
		fileInputRef.current?.click();
	}

	return(
		<Card className='rounded-none border-border'>
			<CardHeader>
				<CardTitle className='tracking-widest'>Foto de perfil</CardTitle>
				<CardDescription className='tracking-wide'>
					Sube una foto para personalizar tu perfil.
				</CardDescription>
			</CardHeader>
			<CardContent className='flex flex-col items-center space-y-4'>
				{/* Avatar */}
				<div className='relative'>
					<Avatar className='w-32 h-32'>
						<AvatarImage 
							src={preview || user?.profileImage}
							alt={user?.name}
						/>
						<AvatarFallback className='bg-primary text-primary-foreground text-3xl'>
							{user?.name?.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>

					{/* Loading Overlay */}
					{isPending && (
						<div className='absolute inset-0 bg-black/50 rounded-full flex items-center justify-center'>
							<Loader2 className='w-8 h-8 text-white animate-spin' />
						</div>
					)}

					{/* Camera Icon */}
					<button 
						type='button'
						onClick={handleButtonClick}
						disabled={isPending}
						className='absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full hover:bg-accent transition-colors disabled:opacity-50'
					>
						<Camera size={20}/>
					</button>
				</div>

				{/* Input file oculto */}
				<input 
					type="file"
					ref={fileInputRef}
					accept='image/*'
					onChange={handleFileChange}
					className='hidden'
					disabled={isPending}				
				/>

				{/* Botón de subida */}
				<Button
					variant='outline'
					onClick={handleButtonClick}
					disabled={isPending}
					className='w-full rounded-none tracking-widest'
				>
					{isPending ? (
						<>
							<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							Subiendo...
						</>
					):(
						<>
							<Upload className='mr-2 h-4 w-4'/>
							Cambiar foto
						</>
					)}

				</Button>

				{/* Información */}
				<div className='text-xs text-muted-foreground text-center space-y-1'>
					<p>Tamaño máximo 5MB</p>
					<p>Formatos: JPG, PNG, GIF</p>
				</div>
			</CardContent>
		</Card>
	)

}
