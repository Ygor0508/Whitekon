// lib/whitekon-service.ts

//  Tipos de Parâmetros
interface ConnectionParams {
  port: string;
  baudrate: number;
  unit: number;
}

interface CommandOptions {
  timeout?: number;
}

// --- Funções Exportadas ---

/**
 * Testa a conexão com um dispositivo específico.
 */
export async function testConnection(
  params: ConnectionParams,
  options: CommandOptions = {}
): Promise<boolean> {
  const url = `/api/whitekon?action=connect&port=${encodeURIComponent(params.port)}&baudrate=${params.baudrate}&unit=${params.unit}`;
  
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(options.timeout || 8000) });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Falha na API: ${response.status}`);
    }
    const data = await response.json();
    return data.status === "connected";
  } catch (error) {
    console.error(`Erro em testConnection para RTU ${params.unit}:`, error);
    return false;
  }
}

/**
 * Lê um único registro de um dispositivo.
 */
export async function readRegister(
  params: ConnectionParams,
  register: number,
  options: CommandOptions = {}
): Promise<number | null> {
  const url = `/api/whitekon?action=read&port=${encodeURIComponent(params.port)}&baudrate=${params.baudrate}&unit=${params.unit}&register=${register}`;

  const response = await fetch(url, { signal: AbortSignal.timeout(options.timeout || 4000) });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Erro ao ler registro ${register}`);
  }
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.value;
}

/**
 * Lê todos os registros de um dispositivo.
 */
export async function readAllRegisters(
  params: ConnectionParams,
  options: CommandOptions = {}
): Promise<{ [key: number]: number | null }> {
  const url = `/api/whitekon?action=read-all&port=${encodeURIComponent(params.port)}&baudrate=${params.baudrate}&unit=${params.unit}`;
  
  const response = await fetch(url, { signal: AbortSignal.timeout(options.timeout || 6000) });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao ler todos os registros");
  }
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data;
}

/**
 * Escreve um valor em um único registro de um dispositivo.
 */
export async function writeRegister(
  params: ConnectionParams,
  register: number,
  value: number,
  options: CommandOptions = {}
): Promise<boolean> {
  const response = await fetch("/api/whitekon", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      port: params.port,
      baudrate: params.baudrate,
      unit: params.unit,
      register: register,
      value: value,
    }),
    signal: AbortSignal.timeout(options.timeout || 5000),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Erro ao escrever no registro ${register}`);
  }
  const result = await response.json();
  return result.success === true;
}