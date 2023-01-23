
# billing_system

Sistema de controle de cobranças


## Tecnologias

- Typescript (NestJS)
- Postgres (PrismaORM)

## Funcionalidades

- Receber arquivos CSV e gerar boletos em cima dos dados
- Enviar emails cobrando os boletos
- Receber e processar pagamentos para os boletos via webhook


## Rodando localmente

Clone o projeto

```bash
  git clone https://github.com/vinisavitraz/billing_system.git
```

Entre no diretório do projeto

```bash
  cd billing_system
```

Com o docker aberto, inicie os containers

```bash
  docker-compose up
```

Isso vai subir a aplicação e o banco. 
Após iniciar os containers, se for a primeira vez rodando o serviço, será necessário criar a base de dados

```bash
  docker exec billing_system npx prisma migrate reset --force
```

Para garantir que o serviço vai conectar a base de dados, reinicie o container principal

```bash
  docker restart billing_system
```

Agora o projeto está configurado e rodando localmente!

Para finalizar os serviços utilize

```bash
  docker-compose down --remove-orphans
```

Com a aplicação rodando, o acesso a base de dados fica disponível via Postgres usando as seguintes credenciais: 

- Host: localhost
- Port: 5432
- Database: billing_system
- User: postgres
- Senha: admin



## Documentação da API

### Enviar novo arquivo CSV

Endpoint 

```csv
  POST localhost:3000/billing
```

Modelo do arquivo CSV

```csv
  name,governmentId,email,debtAmount,debtDueDate,debtId
  John Doe,11111111111,johndoe@kanastra.com.br,1000000.00,2022-10-12,8291 
```
Exemplo via curl

```csv
  curl -F billings=@"/Users/viniciussavitraz/Downloads/mock_data.csv" localhost:3000/billing
```

Response

```json
{"status":"Added to processing queue. Billings will be created in a few seconds."}
```

### Execute o pagamento do boleto

Endpoint 

```csv
  POST localhost:3000/billing/pay
```

Request body

```json
{
	"debtId": "5979",
	"paidAt": "2023-01-30 10:00:00",
	"paidAmount": 100,
	"paidBy": "John Doe"
}
```

Exemplo via curl

```csv
  curl --location --request POST localhost:3000/billing/pay \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "debtId": "5979",
    "paidAt": "2023-01-30 10:00:00",
    "paidAmount": 100,
    "paidBy": "John Doe"
  }'
```

Response

```json
{"debtStatus":"paid"}
```

Response (Pagamento parcial - O pagamento vai ficar pendente até receber o valor total em pagamentos ou expirar)

```json
{"debtStatus":"pending_payment"}
```

## Testes

### Testes de unidade

```bash
  npm run test
```

### Testes de integração 

Para executar os testes de integração, 2 passos são necessários:

- Alterar a variável de ambiente `DATABASE_URL` no arquivo `.env` para: `postgresql://postgres:admin@localhost:5432/billing_system`
- Executar o comando abaixo com a aplicação rodando (após docker-compose up)

```bash
  npm run test:e2e
```

## Licença

[MIT](https://choosealicense.com/licenses/mit/)

