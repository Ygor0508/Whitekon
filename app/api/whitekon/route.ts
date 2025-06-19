import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"

const execAsync = promisify(exec)

// Variáveis para controlar a conexão real
let connected = false
let port = ""
let baudrate = 115200
let unit = 4

// Função para interpretar valores UINT16 como INT16 quando necessário
function interpretValue(value: number, register: number): number | null {
  // Registros que podem ter valores negativos (INT16)
  const signedRegisters = [52] // OFFSET pode ser negativo

  // Valores especiais que indicam erro ou não disponível
  if (value === 65535) {
    return null // Valor não disponível
  }

  // Converte UINT16 para INT16 se necessário
  if (signedRegisters.includes(register) && value > 32767) {
    return value - 65536
  }

  return value
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  if (action === "connect") {
    const portParam = searchParams.get("port")
    const baudrateParam = searchParams.get("baudrate")
    const unitParam = searchParams.get("unit")

    if (!portParam) {
      return NextResponse.json({ status: "failed", error: "Porta não especificada" }, { status: 400 })
    }

    port = portParam
    baudrate = baudrateParam ? Number.parseInt(baudrateParam) : 115200
    unit = unitParam ? Number.parseInt(unitParam) : 4

    console.log(`Tentando conectar: porta=${port}, baudrate=${baudrate}, unidade=${unit}`)

    try {
      const scriptPath = path.join(process.cwd(), "whitekon-registers.py")
      console.log(
        `Executando script: python "${scriptPath}" --port=${port} --baudrate=${baudrate} --unit=${unit} --test`,
      )

      const execPromise = execAsync(
        `python "${scriptPath}" --port=${port} --baudrate=${baudrate} --unit=${unit} --test`,
        { timeout: 10000 },
      )

      const { stdout, stderr } = await execPromise

      console.log("Saída do script:", stdout)
      if (stderr) console.error("Erro do script:", stderr)

      if (stdout.includes("CONNECTED")) {
        connected = true
        return NextResponse.json({ status: "connected" })
      } else {
        connected = false
        return NextResponse.json(
          {
            status: "failed",
            error: stderr || stdout || "Falha na conexão. Verifique se o dispositivo está conectado.",
          },
          { status: 400 },
        )
      }
    } catch (execError: any) {
      console.error("Erro ao executar script Python:", execError)

      if (execError.killed && execError.signal === "SIGTERM") {
        return NextResponse.json(
          {
            status: "failed",
            error: "Timeout ao tentar conectar. O dispositivo não está respondendo.",
          },
          { status: 408 },
        )
      }

      if (execError.message && execError.message.includes("ENOENT")) {
        return NextResponse.json(
          {
            status: "failed",
            error:
              "Script Python não encontrado. Verifique se o arquivo whitekon-registers.py está no diretório correto.",
          },
          { status: 500 },
        )
      }

      return NextResponse.json(
        {
          status: "failed",
          error: `Erro ao executar script: ${execError.message || "Erro desconhecido"}`,
        },
        { status: 500 },
      )
    }
  }

  if (action === "disconnect") {
    try {
      connected = false
      return NextResponse.json({ status: "disconnected" })
    } catch (error) {
      console.error("Erro ao desconectar:", error)
      return NextResponse.json({ error: "Erro ao desconectar" }, { status: 500 })
    }
  }

  if (action === "status") {
    try {
      if (connected) {
        const scriptPath = path.join(process.cwd(), "whitekon-registers.py")
        const { stdout } = await execAsync(
          `python "${scriptPath}" --port=${port} --baudrate=${baudrate} --unit=${unit} --check-status`,
          { timeout: 3000 },
        )
        connected = stdout.includes("STATUS:CONNECTED")
      }
      return NextResponse.json({ connected })
    } catch (error) {
      console.error("Erro ao verificar status:", error)
      connected = false
      return NextResponse.json({ connected: false })
    }
  }

  // Nova implementação para action=data
  if (action === "data") {
    if (!connected) {
      return NextResponse.json({ error: "Não conectado" }, { status: 400 })
    }

    const registerParam = searchParams.get("register")
    const countParam = searchParams.get("count")

    try {
      const scriptPath = path.join(process.cwd(), "whitekon-registers.py")

      if (registerParam) {
        // Leitura de registro específico
        const register = Number.parseInt(registerParam)
        const count = countParam ? Number.parseInt(countParam) : 1

        console.log(`Lendo registro ${register}, count=${count}`)

        const { stdout, stderr } = await execAsync(
          `python "${scriptPath}" --port=${port} --baudrate=${baudrate} --unit=${unit} --read=${register} --count=${count}`,
          { timeout: 8000 },
        )

        if (stderr && stderr.includes("ERROR")) {
          return NextResponse.json({ error: `Erro na leitura: ${stderr}` }, { status: 500 })
        }

        // Filtra e processa as linhas
        const lines = stdout
          .trim()
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => /^\d+$/.test(line))

        if (count === 1) {
          const rawValue = lines.length > 0 ? Number.parseInt(lines[0]) : null
          const value = rawValue !== null ? interpretValue(rawValue, register) : null
          console.log(`Registro ${register}: ${rawValue} -> ${value}`)
          return NextResponse.json({ value })
        } else {
          const values = lines.map((line, index) => {
            const rawValue = Number.parseInt(line)
            return interpretValue(rawValue, register + index)
          })
          console.log(`Registros ${register}-${register + count - 1}:`, values)
          return NextResponse.json({ values })
        }
      } else {
        // Leitura padrão para dashboard - registros essenciais com interpretação correta
        console.log("Lendo dados para dashboard...")

        const importantRegisters = [5, 6, 7, 8, 9, 10, 11, 15, 16, 17, 18, 19, 20, 21]
        const dashboardData: any = {
          brancura: {},
          temperatura: {},
          rgb: {},
          blue_calibracao: {},
          amostras: null,
          alarmes: null,
        }

        // Lê registros importantes individualmente
        for (const reg of importantRegisters) {
          try {
            const { stdout, stderr } = await execAsync(
              `python "${scriptPath}" --port=${port} --baudrate=${baudrate} --unit=${unit} --read=${reg}`,
              { timeout: 3000 },
            )

            if (!stderr || !stderr.includes("ERROR")) {
              const lines = stdout
                .trim()
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => /^\d+$/.test(line))

              if (lines.length > 0) {
                const rawValue = Number.parseInt(lines[0])
                const value = interpretValue(rawValue, reg)

                // Mapeia para a estrutura de dados com interpretação correta
                switch (reg) {
                  case 5:
                    dashboardData.brancura.media = value !== null ? value / 10.0 : null
                    break
                  case 6:
                    // Temperatura de calibração - se for 65535, é inválida
                    dashboardData.temperatura.calibracao = value !== null && value !== 65535 ? value / 10.0 : null
                    break
                  case 7:
                    dashboardData.temperatura.online = value !== null ? value / 10.0 : null
                    break
                  case 8:
                    dashboardData.blue_calibracao.preto = value
                    break
                  case 9:
                    dashboardData.blue_calibracao.branco = value
                    break
                  case 10:
                    dashboardData.alarmes = value
                    break
                  case 11:
                    dashboardData.brancura.desvio_padrao = value !== null ? value / 100.0 : null
                    break
                  case 15:
                    dashboardData.rgb.red = value
                    break
                  case 16:
                    dashboardData.rgb.green = value
                    break
                  case 17:
                    dashboardData.rgb.blue = value
                    break
                  case 18:
                    dashboardData.rgb.clear = value
                    break
                  case 19:
                    dashboardData.amostras = value
                    break
                  case 20:
                    dashboardData.brancura.sem_correcao = value !== null ? value / 10.0 : null
                    break
                  case 21:
                    dashboardData.brancura.online = value !== null ? value / 10.0 : null
                    break
                }

                console.log(`Registro ${reg} lido: ${rawValue} -> ${value}`)
              }
            }
          } catch (error) {
            console.error(`Erro ao ler registro ${reg}:`, error)
            // Continua com o próximo registro
          }

          // Pequeno delay entre leituras
          await new Promise((resolve) => setTimeout(resolve, 50))
        }

        console.log("Dados do dashboard coletados:", JSON.stringify(dashboardData, null, 2))
        return NextResponse.json(dashboardData)
      }
    } catch (error) {
      console.error("Erro ao ler dados:", error)
      return NextResponse.json({ error: "Erro ao ler dados do dispositivo" }, { status: 500 })
    }
  }

  // Implementação para ler todos os registros (0-56)
  if (action === "read-all") {
    if (!connected) {
      return NextResponse.json({ error: "Não conectado" }, { status: 400 })
    }

    try {
      const scriptPath = path.join(process.cwd(), "whitekon-registers.py")
      const allRegisters: { [key: number]: number | null } = {}

      console.log("Iniciando leitura de todos os registros (0-56)...")

      // Lê todos os registros de 0 a 56
      for (let register = 0; register <= 56; register++) {
        try {
          const { stdout, stderr } = await execAsync(
            `python "${scriptPath}" --port=${port} --baudrate=${baudrate} --unit=${unit} --read=${register}`,
            { timeout: 3000 },
          )

          if (!stderr || !stderr.includes("ERROR")) {
            const lines = stdout
              .trim()
              .split("\n")
              .map((line) => line.trim())
              .filter((line) => /^\d+$/.test(line))

            if (lines.length > 0) {
              const rawValue = Number.parseInt(lines[0])
              const value = interpretValue(rawValue, register)
              allRegisters[register] = value
              console.log(`✓ Registro ${register}: ${rawValue} -> ${value}`)
            } else {
              allRegisters[register] = null
              console.log(`✗ Registro ${register}: sem dados`)
            }
          } else {
            allRegisters[register] = null
            console.log(`✗ Registro ${register}: erro - ${stderr}`)
          }
        } catch (error) {
          allRegisters[register] = null
          console.error(`✗ Registro ${register}: exceção - ${error}`)
        }

        // Delay entre leituras para não sobrecarregar
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      const successCount = Object.values(allRegisters).filter((v) => v !== null).length
      console.log(`Leitura concluída: ${successCount}/57 registros lidos com sucesso`)

      return NextResponse.json({
        registers: allRegisters,
        summary: {
          total: 57,
          success: successCount,
          failed: 57 - successCount,
        },
      })
    } catch (error) {
      console.error("Erro ao ler todos os registros:", error)
      return NextResponse.json({ error: "Erro ao ler todos os registros" }, { status: 500 })
    }
  }

  // Mantém compatibilidade com action=read
  if (action === "read") {
    if (!connected) {
      return NextResponse.json({ error: "Não conectado" }, { status: 400 })
    }

    const registerParam = searchParams.get("register")
    const countParam = searchParams.get("count")

    if (!registerParam) {
      return NextResponse.json({ error: "Registro não especificado" }, { status: 400 })
    }

    const register = Number.parseInt(registerParam)
    const count = countParam ? Number.parseInt(countParam) : 1

    try {
      const scriptPath = path.join(process.cwd(), "whitekon-registers.py")

      console.log(`Executando leitura: registro=${register}, count=${count}`)

      const { stdout, stderr } = await execAsync(
        `python "${scriptPath}" --port=${port} --baudrate=${baudrate} --unit=${unit} --read=${register} --count=${count}`,
        { timeout: 8000 },
      )

      if (stderr && stderr.includes("ERROR")) {
        return NextResponse.json({ error: `Erro na leitura: ${stderr}` }, { status: 500 })
      }

      const lines = stdout
        .trim()
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => /^\d+$/.test(line))

      if (count === 1) {
        const rawValue = lines.length > 0 ? Number.parseInt(lines[0]) : null
        const value = rawValue !== null ? interpretValue(rawValue, register) : null
        return NextResponse.json({ value })
      } else {
        const values = lines.map((line, index) => {
          const rawValue = Number.parseInt(line)
          return interpretValue(rawValue, register + index)
        })
        return NextResponse.json({ values })
      }
    } catch (error) {
      console.error("Erro ao ler registro:", error)
      return NextResponse.json({ error: "Erro ao ler registro do dispositivo" }, { status: 500 })
    }
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
}

export async function POST(request: Request) {
  if (!connected) {
    return NextResponse.json({ error: "Não conectado" }, { status: 400 })
  }

  try {
    const data = await request.json()
    const { register, value } = data

    if (register === undefined || value === undefined) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
    }

    console.log(`Escrevendo no registro ${register} o valor ${value}`)

    const scriptPath = path.join(process.cwd(), "whitekon-registers.py")
    const { stdout, stderr } = await execAsync(
      `python "${scriptPath}" --port=${port} --baudrate=${baudrate} --unit=${unit} --write=${register} --value=${value}`,
      { timeout: 5000 },
    )

    console.log(`Resultado da escrita:`, stdout)
    if (stderr) {
      console.error("Erro na escrita:", stderr)
    }

    if (stderr && stderr.includes("ERROR")) {
      return NextResponse.json({ error: `Erro na escrita: ${stderr}` }, { status: 500 })
    }

    if (stdout.includes("OK") || stdout.trim() === "") {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Falha na escrita do registro" }, { status: 500 })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 })
  }
}
