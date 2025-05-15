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

// frontend/src/app/api/modbus/connect/route.ts
import { NextResponse } from 'next/server';
import { connectModbus } from '@/app/lib/modbusClient';

export async function POST(req: Request) {
  try {
    const url      = new URL(req.url);
    const port     = url.searchParams.get('port')     || process.env.NEXT_PUBLIC_MODBUS_PORT!     || 'COM8';
    const baudRate = parseInt(
                       url.searchParams.get('baudrate') || process.env.NEXT_PUBLIC_MODBUS_BAUDRATE! || '115200',
                       10
                     );
    const unit     = parseInt(
                       url.searchParams.get('unit')     || process.env.NEXT_PUBLIC_MODBUS_UNIT!     || '4',
                       10
                     );

    await connectModbus(port, baudRate, unit);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro na conexão' },
      { status: 500 }
    );
  }
}

