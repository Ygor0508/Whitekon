// import { NextResponse } from "next/server";
// import { exec } from "child_process";
// import { promisify } from "util";
// import path from "path";

// const execAsync = promisify(exec);

// let connected = false;
// let port = "";
// let baudrate = 115200;
// let unit = 4;

// function interpretValue(value: number, register: number): number {
//   const signedRegisters = [52]; // Registrador de OFFSET que pode ser negativo

//   if (signedRegisters.includes(register) && value > 32767) {
//     return value - 65536; // Converte de UINT16 para INT16
//   }

//   // Retorna o valor como está, o frontend cuidará da exibição de 65535
//   return value;
// }

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const action = searchParams.get("action");

//   if (action === "connect") {
//     const portParam = searchParams.get("port");
//     const baudrateParam = searchParams.get("baudrate");
//     const unitParam = searchParams.get("unit");

//     if (!portParam) {
//       return NextResponse.json({ error: "Porta não especificada" }, { status: 400 });
//     }

//     port = portParam;
//     baudrate = baudrateParam ? Number.parseInt(baudrateParam) : 115200;
//     unit = unitParam ? Number.parseInt(unitParam) : 4;

//     try {
//       const scriptPath = path.join(process.cwd(), "whitekon-registers.py");
//       const { stdout, stderr } = await execAsync(
//         `python "${scriptPath}" --port=${port} --baudrate=${baudrate} --unit=${unit} --test`,
//         { timeout: 10000 }
//       );

//       if (stdout.includes("CONNECTED")) {
//         connected = true;
//         return NextResponse.json({ status: "connected" });
//       } else {
//         connected = false;
//         return NextResponse.json({ status: "failed", error: stderr || stdout }, { status: 500 });
//       }
//     } catch (e: any) {
//       connected = false;
//       return NextResponse.json({ status: "failed", error: e.message }, { status: 500 });
//     }
//   }

//   if (action === "disconnect") {
//     connected = false;
//     return NextResponse.json({ status: "disconnected" });
//   }

//   if (action === "status") {
//     if (connected) {
//       try {
//         const scriptPath = path.join(process.cwd(), "whitekon-registers.py");
//         await execAsync(
//           `python "${scriptPath}" --port=${port} --baudrate=${baudrate} --unit=${unit} --check-status`,
//           { timeout: 3000 }
//         );
//       } catch (e) {
//         connected = false;
//       }
//     }
//     return NextResponse.json({ connected });
//   }

//   if (action === "read" || action === "data") {
//     if (!connected) {
//       return NextResponse.json({ error: "Não conectado" }, { status: 400 });
//     }

//     const registerParam = searchParams.get("register");
//     const countParam = searchParams.get("count");

//     if (!registerParam) {
//       return NextResponse.json({ error: "Registro não especificado" }, { status: 400 });
//     }

//     const register = Number.parseInt(registerParam);
//     const count = countParam ? Number.parseInt(countParam) : 1;

//     try {
//       const scriptPath = path.join(process.cwd(), "whitekon-registers.py");
//       const { stdout, stderr } = await execAsync(
//         `python "${scriptPath}" --port=${port} --baudrate=${baudrate} --unit=${unit} --read=${register} --count=${count}`,
//         { timeout: 8000 }
//       );

//       if (stderr && stderr.includes("ERROR")) {
//         throw new Error(stderr);
//       }

//       const lines = stdout.trim().split('\n').map(line => line.trim()).filter(line => /^\d+$/.test(line));

//       if (count === 1) {
//         const rawValue = lines.length > 0 ? Number.parseInt(lines[0]) : null;
//         return NextResponse.json({ value: rawValue !== null ? interpretValue(rawValue, register) : null });
//       } else {
//         const values = lines.map((line, index) => {
//             const rawValue = Number.parseInt(line);
//             return interpretValue(rawValue, register + index);
//         });
//         return NextResponse.json({ values });
//       }
//     } catch (e: any) {
//       return NextResponse.json({ error: e.message }, { status: 500 });
//     }
//   }

//   if (action === "read-all") {
//     if (!connected) {
//       return NextResponse.json({ error: "Não conectado" }, { status: 400 });
//     }

//     try {
//       const scriptPath = path.join(process.cwd(), "whitekon-registers.py");
//       const totalRegisters = 57;
//       const { stdout, stderr } = await execAsync(
//         `python "${scriptPath}" --port=${port} --baudrate=${baudrate} --unit=${unit} --read=0 --count=${totalRegisters}`,
//         { timeout: 20000 }
//       );
      
//       if (stderr && stderr.includes("ERROR")) {
//         throw new Error("Falha ao ler o bloco de registros.");
//       }

//       const lines = stdout.trim().split("\n").map(line => line.trim()).filter(line => /^\d+$/.test(line));
//       const allRegisters: { [key: number]: number | null } = {};

//       for (let i = 0; i < totalRegisters; i++) {
//         if (i < lines.length) {
//           const rawValue = Number.parseInt(lines[i]);
//           allRegisters[i] = interpretValue(rawValue, i);
//         } else {
//           allRegisters[i] = null;
//         }
//       }

//       const successCount = Object.values(allRegisters).filter(v => v !== null).length;

//       return NextResponse.json({
//         registers: allRegisters,
//         summary: { total: totalRegisters, success: successCount, failed: totalRegisters - successCount },
//       });

//     } catch (e: any) {
//       return NextResponse.json({ error: `Erro ao ler todos os registros: ${e.message}` }, { status: 500 });
//     }
//   }

//   return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
// }

// export async function POST(request: Request) {
//   if (!connected) {
//     return NextResponse.json({ error: "Não conectado" }, { status: 400 });
//   }
//   try {
//     const { register, value } = await request.json();

//     if (register === undefined || value === undefined) {
//       return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
//     }
    
//     const scriptPath = path.join(process.cwd(), "whitekon-registers.py");
//     const { stdout, stderr } = await execAsync(
//       `python "${scriptPath}" --port=${port} --baudrate=${baudrate} --unit=${unit} --write=${register} --value=${value}`,
//       { timeout: 5000 }
//     );
    
//     if (stderr && stderr.includes("ERROR")) {
//       throw new Error(stderr);
//     }
    
//     // A escrita bem-sucedida no script retorna "OK"
//     if (stdout.includes("OK")) {
//       return NextResponse.json({ success: true });
//     } else {
//       return NextResponse.json({ success: false, error: "Falha na escrita" }, { status: 500 });
//     }
//   } catch (e: any) {
//     return NextResponse.json({ error: e.message }, { status: 500 });
//   }
// }






import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

// Função para interpretar valores (especialmente negativos)
function interpretValue(value: number, register: number): number {
  const signedRegisters = [52]; // Registrador de OFFSET que pode ser negativo
  if (signedRegisters.includes(register) && value > 32767) {
    return value - 65536; // Converte de UINT16 para INT16
  }
  return value;
}

// Função para construir o comando base do Python
function getPythonCommand(port: string, baudrate: number, unit: number) {
  const scriptPath = path.join(process.cwd(), "whitekon-registers.py");
  // Garante que o caminho do script esteja entre aspas para lidar com espaços
  return `python "${scriptPath}" --port=${port} --baudrate=${baudrate} --unit=${unit}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  
  // Ação de 'connect' agora é apenas um teste de conexão
  if (action === "connect") {
    const port = searchParams.get("port");
    const baudrate = Number(searchParams.get("baudrate"));
    const unit = Number(searchParams.get("unit"));

    if (!port || !baudrate || !unit) {
      return NextResponse.json({ error: "Parâmetros de conexão incompletos" }, { status: 400 });
    }

    try {
      const command = `${getPythonCommand(port, baudrate, unit)} --test`;
      const { stdout, stderr } = await execAsync(command, { timeout: 10000 });

      if (stdout.includes("CONNECTED")) {
        return NextResponse.json({ status: "connected" });
      } else {
        return NextResponse.json({ status: "failed", error: stderr || stdout || "Resposta desconhecida do script." }, { status: 500 });
      }
    } catch (e: any) {
      return NextResponse.json({ status: "failed", error: e.message }, { status: 500 });
    }
  }

  // Ação de 'disconnect' não faz nada no backend, é um controle do cliente.
  if (action === "disconnect") {
    return NextResponse.json({ status: "disconnected" });
  }

  // Ações de leitura agora exigem todos os parâmetros de conexão.
  if (action === "read" || action === "read-all") {
    const port = searchParams.get("port");
    const baudrate = Number(searchParams.get("baudrate"));
    const unit = Number(searchParams.get("unit"));

    if (!port || !baudrate || !unit) {
      return NextResponse.json({ error: "Parâmetros de conexão não fornecidos para leitura." }, { status: 400 });
    }
    
    let command: string;
    let timeout = 8000;

    if (action === "read-all") {
      const totalRegisters = 57; // De 0 a 56
      command = `${getPythonCommand(port, baudrate, unit)} --read=0 --count=${totalRegisters}`;
      timeout = 20000;
    } else {
      const register = searchParams.get("register");
      const count = searchParams.get("count") || '1';
      if (!register) {
        return NextResponse.json({ error: "Registro não especificado" }, { status: 400 });
      }
      command = `${getPythonCommand(port, baudrate, unit)} --read=${register} --count=${count}`;
    }

    try {
      const { stdout, stderr } = await execAsync(command, { timeout });
      
      if (stderr) { // Qualquer saída em stderr é um erro
        throw new Error(stderr);
      }

      const lines = stdout.trim().split('\n').map(line => line.trim()).filter(line => /^\d+$/.test(line));

      if (action === "read-all") {
        const allRegisters: { [key: number]: number | null } = {};
        for (let i = 0; i < 57; i++) {
          allRegisters[i] = i < lines.length ? interpretValue(Number(lines[i]), i) : null;
        }
        return NextResponse.json({ registers: allRegisters });
      } else if (searchParams.get("count") && Number(searchParams.get("count")) > 1) {
          const registerStart = Number(searchParams.get("register"));
          const values = lines.map((line, index) => interpretValue(Number.parseInt(line), registerStart + index));
          return NextResponse.json({ values });
      } else {
        const register = Number(searchParams.get("register"));
        const rawValue = lines.length > 0 ? Number.parseInt(lines[0]) : null;
        return NextResponse.json({ value: rawValue !== null ? interpretValue(rawValue, register) : null });
      }
    } catch (e: any) {
      return NextResponse.json({ error: `Erro ao executar script: ${e.message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const { port, baudrate, unit, register, value, values } = await request.json();

    if (!port || !baudrate || !unit || register === undefined || (value === undefined && values === undefined)) {
      return NextResponse.json({ error: "Parâmetros de conexão ou de escrita inválidos" }, { status: 400 });
    }
    
    let command: string;
    if (values) { // Escrita de múltiplos registradores
        const valuesString = values.join(',');
        command = `${getPythonCommand(port, baudrate, unit)} --write=${register} --values=${valuesString}`;
    } else { // Escrita de um único registrador
        command = `${getPythonCommand(port, baudrate, unit)} --write=${register} --value=${value}`;
    }
    
    const { stdout, stderr } = await execAsync(command, { timeout: 5000 });
    
    if (stderr) {
      throw new Error(stderr);
    }
    
    if (stdout.includes("OK")) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "Falha na escrita: resposta inesperada do script" }, { status: 500 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}