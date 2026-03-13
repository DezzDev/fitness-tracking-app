import { useEffect } from "react";
import { useBlocker } from "react-router-dom";


/**
 * Hook para prevenir navegación con cambios no guardados
 */
export function useUnsavedChanges(
	hasUnsavedChanges: boolean,
	message = '¿Seguro que quieres salir? Los cambios no guardados se perderán.'
){
	// Bloquear navegación con react-router-dom
	const blocker = useBlocker(
		({currentLocation, nextLocation}) => 
			hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
	)

	// Bloquear cierre de ventana
	useEffect(()=>{
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (hasUnsavedChanges){
				e.preventDefault();
				e.returnValue = message;
				return message;
			}
		}

		window.addEventListener('beforeunload', handleBeforeUnload)

		return ()=> {
			window.removeEventListener('beforeunload', handleBeforeUnload)
		};
	}, [hasUnsavedChanges, message])

	return blocker
}