# Generar secret aleatorio de 64 caracteres
 
 ``` bash
	node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
 ```