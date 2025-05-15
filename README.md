# Whitekon - Interface de Controle

Interface web para controle e monitoramento do medidor de brancura Whitekon.

## Funcionalidades

- 🌐 Conexão Modbus RTU/TCP
  - Seleção de porta serial
  - Configuração de baudrate
  - Suporte a múltiplos dispositivos (Unit ID)

- ⚙️ Calibração e Configuração
  - Leitura de valores RGB em tempo real
  - Calibração de preto e branco
  - Ajuste de tempo de integração
  - Configuração de ganho

- 📏 Polinômios de Correção
  - Configuração dos coeficientes a, b, c
  - Leitura e escrita de registradores

- 🌡️ Indicadores
  - Monitoramento de temperatura
  - Leitura de brancura média e online
  - Desvio padrão
  - Contagem de amostras

- 🔍 Monitoramento Modbus
  - Leitura de registradores customizada
  - Visualização em decimal e hexadecimal
  - Atualização automática

## Tecnologias

- Frontend:
  - Next.js 14
  - TypeScript
  - TailwindCSS
  - React 18

- Backend:
  - Python 3.8+
  - pymodbus
  - pyserial

## Instalação

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
pip install pymodbus pyserial
python whitekon.py --help
```

## Uso

1. Inicie o frontend:
```bash
cd frontend
npm run dev
```

2. Acesse http://localhost:3000

3. Na página inicial:
   - Selecione a porta COM
   - Configure o baudrate
   - Defina o Unit ID
   - Clique em "Conectar"

4. Utilize as diferentes seções para:
   - Calibrar o sensor
   - Configurar polinômios
   - Monitorar indicadores
   - Ler registradores Modbus

## Desenvolvimento

### Estrutura do Projeto

```
frontend/
  ├── src/
  │   ├── app/
  │   │   ├── (routes)/
  │   │   │   ├── calibracao/
  │   │   │   ├── polinomios/
  │   │   │   ├── indicadores/
  │   │   │   └── monitoramento/
  │   │   ├── api/
  │   │   │   └── modbus/
  │   │   ├── layout.tsx
  │   │   └── page.tsx
  │   ├── components/
  │   ├── contexts/
  │   ├── hooks/
  │   ├── lib/
  │   ├── types/
  │   └── utils/
  ├── public/
  └── package.json

backend/
  └── whitekon.py
```

### API Endpoints

- `POST /api/modbus/connect`
  - Conecta ao dispositivo
  - Parâmetros: `{ port, baudRate, unitId }`

- `POST /api/modbus/disconnect`
  - Desconecta do dispositivo

- `GET /api/modbus/ports`
  - Lista portas COM disponíveis

- `POST /api/modbus/read`
  - Lê registradores
  - Parâmetros: `{ start, count }`

- `POST /api/modbus/write`
  - Escreve em registrador
  - Parâmetros: `{ address, value }`

## Licença

Desenvolvido por Garten Automação © 2025 