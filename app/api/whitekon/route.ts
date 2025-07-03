// app/api/whitekon/route.ts
import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

function interpretValue(value: number, register: number): number {
  const signedRegisters = [52];
  if (signedRegisters.includes(register) && value > 32767) {
    return value - 65536;
  }
  return value;
}

function getPythonCommand(port: string, baudrate: number, unit: number) {
  const scriptPath = path.join(process.cwd(), "whitekon-registers.py");
  return `python "${scriptPath}" --port=${port} --baudrate=${baudrate} --unit=${unit}`;
}

async function executeScript(command: string, timeout: number) {
    try {
        const { stdout, stderr } = await execAsync(command, { timeout });
        
        if (stderr) {
            try {
                const errorJson = JSON.parse(stderr);
                if (errorJson.error) {
                    throw new Error(errorJson.error);
                }
            } catch (e) {
                throw new Error(stderr);
            }
        }
        
        if (!stdout) {
            throw new Error("O script Python não retornou dados.");
        }

        return JSON.parse(stdout);

    } catch (error: any) {
        console.error("Erro na execução do script Python:", error.message);
        throw new Error(`Falha no script: ${error.message}`);
    }
}


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const port = searchParams.get("port");
  const baudrate = Number(searchParams.get("baudrate"));
  const unit = Number(searchParams.get("unit"));

  if (!port || !baudrate || !unit) {
    return NextResponse.json({ error: "Parâmetros de conexão incompletos" }, { status: 400 });
  }

  try {
    if (action === "connect") {
        const command = `${getPythonCommand(port, baudrate, unit)} --test`;
        const result = await executeScript(command, 8000);
        return NextResponse.json(result);
    }

    if (action === "read-all") {
        const command = `${getPythonCommand(port, baudrate, unit)} --read=0 --count=57`;
        const result = await executeScript(command, 6000);
        
        const registersArray = result.registers || [];
        const allRegisters: { [key: number]: number | null } = {};
        for (let i = 0; i < 57; i++) {
            allRegisters[i] = i < registersArray.length ? interpretValue(registersArray[i], i) : null;
        }
        return NextResponse.json(allRegisters);
    }

    if (action === "read") {
        const register = searchParams.get("register");
        if (!register) {
            return NextResponse.json({ error: "Registro não especificado" }, { status: 400 });
        }
        const command = `${getPythonCommand(port, baudrate, unit)} --read=${register}`;
        const result = await executeScript(command, 4000);
        return NextResponse.json({ value: interpretValue(result.value, Number(register)) });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { port, baudrate, unit, register, value } = await request.json();

    if (!port || !baudrate || !unit || register === undefined || value === undefined) {
      return NextResponse.json({ error: "Parâmetros de conexão ou de escrita inválidos" }, { status: 400 });
    }
    
    const command = `${getPythonCommand(port, baudrate, unit)} --write=${register} --value=${value}`;
    const result = await executeScript(command, 5000);
    
    return NextResponse.json(result);

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}