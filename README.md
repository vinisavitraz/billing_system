<h1>Sistema de cobrança</h1>

<p align="center">
<a href="#tecnologies-rocket">Tecnologias</a>&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;
<a href="#about-memo">About</a>&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;
<a href="#how-to-contribute-">How to Contribute</a>&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;
<a href="#utils-">Utils</a>&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;
</p>

---

## Tecnologias :rocket:

- NestJS (Typescript)
- MySQL
- PrismaORM

## Rodando o serviço

### Docker

$ docker-compose up -d --build                                

Assim que o container estiver rodando, rodar o comando para criar a base de dados:

$ docker exec billing_system-api-1 npx prisma migrate reset --force

Após isso, a aplicação já está disponível para receber requests

Finalizar a aplicação:

$ docker-compose down --remove-orphans      

### Acesso ao banco de dados

Depois do container estiver rodando, o acesso a base de dados fica disponível via MySQL usando as seguintes credenciais: 

Host: localhost
Port: 3306
Database: billing_system
User: root
Senha: admin

## Endpoints disponíveis:

### Criar boletos com arquivo CSV

Endpoint: POST `/billing`

Request example: 

curl --location --request POST 'localhost:3000/billing' \
--form 'billings=@"/Users/viniciussavitraz/Downloads/mock_data.csv"'

Response:

{"status":"Added to queue"}

### Realizar pagamento

O valor pode ser pago inteiro ou parcialmente. No caso de parcil, o boleto continua pendente até o vencimento

Endpoint: POST `/billing/pay`

curl --location --request POST 'localhost:3000/billing/pay' \
--header 'Content-Type: application/json' \
--data-raw '{
  "debtId": "1242",
  "paidAt": "2023-01-22 10:00:00",
  "paidAmount": 738,
  "paidBy": "John Doe"
}'

Response:

{"debtStatus":"paid"}

ou

{"debtStatus":"pending_payment"}



## Testes


# Unit tests

$ npm run test

# E2E tests

$ npm run test:e2e

# Test coverage

$ npm run test:cov