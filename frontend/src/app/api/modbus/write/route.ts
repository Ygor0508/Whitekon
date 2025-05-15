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
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message || 'Erro na escrita' },
      { status: 500 }
    );
  }
}
