// import { NextResponse } from 'next/server';
// import { writeRegister } from '@/app/lib/modbusClient';

// export async function POST(req: Request) {
//   try {
//     const { address, value } = await req.json();
//     await writeRegister(address, value);
//     return NextResponse.json({ success: true });
//   } catch (err: any) {
//     return NextResponse.json(
//       { success: false, error: err.message || 'Erro na escrita' },
//       { status: 500 }
//     );
//   }
// }

//
import { NextResponse } from 'next/server';
import { writeRegister } from '@/app/lib/modbusClient';

export async function POST(req: Request) {
  try {
    const { address, value } = await req.json();
    await writeRegister(address, value);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Erro na escrita Modbus:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erro na escrita' },
      { status: 500 }
    );
  }
}
