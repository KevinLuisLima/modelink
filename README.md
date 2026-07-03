# Modelink

Sistema web para upload, visualização e preparação de bases de dados para treinamento de modelos de Machine Learning.

## Objetivo

O Modelink busca democratizar o deploy de modelos de Machine Learning,  reduzindo a burocracia entre Ciência de Dados e produção, permitindo que usuários sem conhecimento avançado de infraestrutura transforme isso em um classificador acessível por link online.

## Tecnologias Utilizadas

### Frontend

- React
- Vite
- Vercel
- Render

### Backend

- Python
- FastAPI
- Pandas
- Uvicorn
- Supabase
- SQLite (cache/local)
- Scikit-learn


## Estrutura do Projeto

```txt
modelink/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   └── services/
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── main.jsx
│   │
│   ├── index.html
│   └── package.json
│
└── README.md
```

## Funcionalidades

### Upload de arquivos

O usuário pode enviar uma base de dados em formato `.csv`,`.tsv`,`.xls` e `.xlsx`.

### Treinamento do modelo

- Seleção da coluna target
- Escolha do algoritmo (árvore de decisão como default)
- Métricas de desempenho
- Matriz de confusão
- Acurácia

### Geração de URL pública
 
- Versionamento automático
- Persistência do modelo treinado no Supabase
- Compartilhamento por URL pública
- Identificador único (UUID) para cada modelo

### Funcionalidades planejadas

- Latência
- Drift de modelo
- Volume de requisições
- Logs
- Alertas

## Como Executar

### Backend

### 1. Entrar na pasta

```bash
cd backend
```

---

### 2. Criar ambiente virtual

#### Windows

```bash
python -m venv venv
```

---

### 3. Ativar ambiente virtual

#### Windows PowerShell

```bash
.\venv\Scripts\activate
```

---

### 4. Instalar dependências

```bash
pip install -r requirements.txt
```

---

### 5. Executar servidor

```bash
python -m uvicorn app.main:app --reload
```

---

### API disponível em:

```txt
http://localhost:8000
```

---

### Swagger automático

```txt
http://localhost:8000/docs
```

---

## Frontend

### 1. Entrar na pasta

```bash
cd frontend
```

---

### 2. Instalar dependências

```bash
npm install
```

---

### 3. Executar aplicação

```bash
npm run dev
```

---

### Frontend disponível em:

```txt
http://localhost:5173
```

## Deploy

Frontend:
- Vercel

Backend:
- Render

Banco de dados e armazenamento:
- Supabase

Após o deploy, configure:

Frontend (.env)
VITE_API_URL=https://SEU_BACKEND.onrender.com

Backend (.env)
SUPABASE_URL=...
SUPABASE_KEY=...

## Autor
Giovanna Valentina Esteves

Kevin Luís Lima

Ruan Victor de Araújo Galvão

## Licença

Projeto acadêmico desenvolvido para estudo de integração entre:

- Ciência de Dados
- Machine Learning
- Engenharia de Software
- Deploy de modelos
- Monitoramento de IA

Este projeto está licenciado sob a licença MIT.
