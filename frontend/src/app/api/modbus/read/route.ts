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

// frontend/src/app/api/modbus/read/route.ts
import { NextResponse } from 'next/server';
import { readRegisters } from '@/app/lib/modbusClient';

export async function GET(req: Request) {
  try {
    const url   = new URL(req.url);
    const start = parseInt(url.searchParams.get('start') || '0', 10);
    const count = parseInt(url.searchParams.get('count') || '1', 10);

    const data = await readRegisters(start, count);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro na leitura' },
      { status: 500 }
    );
  }
}
