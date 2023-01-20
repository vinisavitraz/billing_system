<h1>Sistema de cobrança</h1>

## Tecnologias :rocket:

- NestJS (Typescript)
- MySQL
- PrismaORM

## Rodando o serviço

### Docker

Para rodar a aplicacao, é necessário ter o docker instalado.

### Comandos utéis: 

#### Iniciar a aplicacao

$ docker-compose up -d --build                                

####  Assim que o container estiver rodando, rodar o comando para criar a base de dados:

$ docker exec billing_system-api-1 npx prisma migrate reset --force

Após isso, a aplicação já está disponível para receber requests

#### Finalizar a aplicação:

$ docker-compose down --remove-orphans      

#### Acesso ao banco de dados

Depois do container estiver rodando, o acesso a base de dados fica disponível via MySQL usando as seguintes credenciais: 

Host: localhost
Port: 3306
Database: billing_system
User: root
Senha: admin

## Endpoints disponíveis:

#### Criar boletos com arquivo CSV

Exemplo de arquivo: 

``` mock_data.csv
name,governmentId,email,debtAmount,debtDueDate,debtId
John [Doe,11111111111,johndoe@kanastra.com.br,1000000.00,2022-10-12,8291](mailto:Doe,11111111111,johndoe@kanastra.com.br,1000000.00,2022-10-12,8291) 
```

Endpoint: POST `/billing`

Exemplo de request: 

curl --location --request POST 'localhost:3000/billing' \
--form 'billings=@"/Users/viniciussavitraz/Downloads/mock_data.csv"'

Response:

{"status":"Added to queue"}

#### Realizar pagamento do boleto

Após o cadastro de novos boletos, o pagamento fica disponível por esse endpoint
O valor pode ser pago inteiro ou parcialmente. No caso de parcial, o boleto continua pendente e pode receber novos pagamentos até o vencimento

Endpoint: POST `/billing/pay`

Exemplo de request: 

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

$ npm run test:e2e --runInBand

# Test coverage

$ npm run test:cov