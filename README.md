# Image Compression Service

Pequeno serviço de compressão de imagens em pub/sub, no qual um publisher efetua um upload, enviando os metadados da imagem para uma fila, e um subscriber irá processá-lo, comprimindo e salvando localmente três versões da imagem com qualidades diferentes (low, medium e high).

---

## Tecnologias Utilizadas

- **Node.js**
- **NestJS**
- **TypeScript**
- **RabbitMQ** para processamento de mensagens
- **MongoDB** para armazenamento de metadados de cada task
- **Docker & Docker Compose**
- **Sharp**: biblioteca para processamento de imagens

---

## Características da Aplicação

- **Monorepo (microservices)**
- **Padrão Pub/Sub**
- **Armazenamento de variáveis de ambiente em .env**

## Pré-requisitos

- Git
- Node.js
- Docker & Docker Compose (caso queira rodar em container)
- MongoDB (local ou container)
- RabbitMQ (local ou container)
- Insomnia, Postman ou serviço semelhante

---

## Rodando Localmente

1. **Clone o repositório**

```bash
 git clone https://github.com/PedroVRibeiro/image-compressor
```

2. **Acesse o diretório dos microserviços**

```bash
cd apps/
```

3. **Acesse o diretório de cada serviço (upload-service e compressor-service) e renomeie o arquivo .env.example para .env**

```bash
cd upload-service/
E
cd compressor-service/
```
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**e então:**
```bash
CMD (Windows): rename .env.example .env
```

```bash
Powershell (Windows): Rename-Item .env.example .env
```

```bash
Linux ou MacOS: mv .env.example .env
```

4. **Executar Docker Compose**

```sh
 docker compose up -d
```

5. **No serviço de sua escolha você poderá realizar o upload de imagem enviando um POST com body no formato multi-part/file (nome do campo: file) para a URL:**

```sh
 localhost:3000/uploads
```

6. **As imagens serão salvas no diretório:**

```sh
 image-compressor/apps/compressed/{taskId}
```

7. **Caso queira verificar individualmente o status de uma task envie um GET com o taskId para a URL:**

```sh
 localhost:3002/status/{taskId}
```

8. **Caso queira visualizar os dados diretamente, acesse o mongo-express na url a seguir:**

```sh
 localhost:8001

 username: guest
 password: guest
```

9. **Para rodar os testes unitários, utilize o seguinte comando:**

```sh
 npm run test
```

## Decisões de design:

- **Foi utilizado o modo monorepo do Nest, ao invés de Turborepo ou NX, por questões de estudo**
