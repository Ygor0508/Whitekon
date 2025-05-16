// // frontend/src/app/api/modbus/read/route.ts
// import { NextResponse } from 'next/server';
// import { readRegisters } from '@/app/lib/modbusClient';

// export async function GET(req: Request) {
//   try {
//     const url   = new URL(req.url);
//     const start = parseInt(url.searchParams.get('start') || '0', 10);
//     const count = parseInt(url.searchParams.get('count') || '1', 10);

//     const data = await readRegisters(start, count);
//     return NextResponse.json({ success: true, data });
//   } catch (err: any) {
//     return NextResponse.json(
//       { success: false, error: err.message || 'Erro na leitura' },
//       { status: 500 }
//     );
//   }
// }


//

import { NextResponse } from 'next/server';
import { readRegisters } from '@/app/lib/modbusClient';

export async function GET(req: Request) {
  try {
    const url   = new URL(req.url);
    const start = parseInt(url.searchParams.get('start') || '0', 10);
    const count = parseInt(url.searchParams.get('count') || '1', 10);

    console.log(`→ GET /api/modbus/read?start=${start}&count=${count}`);
    const data = await readRegisters(start, count);
    console.log('← Leitura bem-sucedida:', data);

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('=== ERRO NA ROTA /api/modbus/read ===');
    console.error(err.stack || err);

    return NextResponse.json(
      { success: false, error: err.message || 'Erro na leitura' },
      { status: 500 }
    );
  }
}
