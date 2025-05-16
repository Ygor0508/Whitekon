// // frontend/src/app/api/modbus/connect/route.ts
// import { NextResponse } from 'next/server';
// import { connectModbus } from '@/app/lib/modbusClient';

// export async function POST(req: Request) {
//   try {
//     const url        = new URL(req.url);
//     const port       = url.searchParams.get('port')
//                         || process.env.NEXT_PUBLIC_MODBUS_PORT!
//                         || 'COM8';
//     const baudRate   = parseInt(
//                         url.searchParams.get('baudrate')
//                         || process.env.NEXT_PUBLIC_MODBUS_BAUDRATE!
//                         || '115200',
//                         10
//                       );
//     const unitId     = parseInt(
//                         url.searchParams.get('unit')
//                         || process.env.NEXT_PUBLIC_MODBUS_UNIT!
//                         || '4',
//                         10
//                       );

//     await connectModbus(port, baudRate, unitId);
//     return NextResponse.json({ success: true });
//   } catch (err: any) {
//     return NextResponse.json(
//       { success: false, error: err.message || 'Erro na conexão' },
//       { status: 500 }
//     );
//   }
// }

// 

// import { NextResponse } from 'next/server';
// import ModbusRTU from 'modbus-serial';
// import { setModbusClient, closeModbusClient } from '@/app/lib/modbusClient';

// export async function POST(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const port     = searchParams.get('port')!;
//   const baudrate = Number(searchParams.get('baudrate'));
//   const unit     = Number(searchParams.get('unit'));

//   // Fecha instância anterior e aguarda a liberação da porta
//   await closeModbusClient();
//   await new Promise(r => setTimeout(r, 1000));

//   const client = new ModbusRTU();
//   try {
//     await client.connectRTUBuffered(port, { baudRate: baudrate });
//     client.setID(unit);
//     setModbusClient(client);
//     return NextResponse.json({ success: true });
//   } catch (err: any) {
//     console.error('Erro ao conectar Modbus:', err);
//     await closeModbusClient();
//     return NextResponse.json(
//       { success: false, error: err.message || 'Erro desconhecido na conexão' },
//       { status: 500 }
//     );
//   }
// }

//

import { NextResponse } from 'next/server';
import ModbusRTU from 'modbus-serial';
import { setModbusClient, closeModbusClient } from '@/app/lib/modbusClient';

export async function POST(req: Request) {
  const params    = new URL(req.url).searchParams;
  const port      = params.get('port')!;               // ex: "COM8"
  const baudrate  = Number(params.get('baudrate'));
  const unitId    = Number(params.get('unit'));

  // 1) fechar client anterior e aguardar liberação da porta
  await closeModbusClient();
  await new Promise(r => setTimeout(r, 5000));         // espera 5s

  const client = new ModbusRTU();
  try {
    // 2) normalizar nome da porta no Windows
    const path = /^COM\d+$/i.test(port) ? `\\\\.\\${port}` : port;

    // 3) passar todas as opções seriais idênticas ao Python
    await client.connectRTUBuffered(path, {
      baudRate: baudrate,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      rtscts: false,
      xon: false,
      xoff: false,
      xany: false
    });
    client.setID(unitId);
    setModbusClient(client);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('=== ERRO NA ROTA /api/modbus/connect ===');
    console.error(err.stack || err);
    await closeModbusClient();
    return NextResponse.json(
      { success: false, error: err.message || 'Erro na conexão' },
      { status: 500 }
    );
  }
}


