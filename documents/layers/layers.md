🎯 Responsabilidad de Cada Capa
| Capa           | Responsabilidad                                              | NO debe hacer                          | 
| ---------------|------------------------------------------------------------- | -------------------------------------- |
| **Controller** | - Recibir request, Llamar service, Retornar response         | ❌ Lógica de negocio, ❌ Acceso a DB  |
| **Service**    | - Lógica de negocio, Validaciones complejas, Orquestar repos | ❌ Manejar req/res, ❌ SQL directo    | 
| **Repository** | - Queries SQL, Mapeo de datos, Acceso a DB                   | ❌ Lógica de negocio, ❌ Validaciones |