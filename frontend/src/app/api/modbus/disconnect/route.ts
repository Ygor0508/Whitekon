// import { NextResponse } from 'next/server';
// import { disconnectModbus } from '@/app/lib/modbusClient';

// export async function DELETE() {
//   try {
//     disconnectModbus();
//     return NextResponse.json({ success: true });
//   } catch (err: any) {
//     return NextResponse.json(
//       { success: false, error: err.message || 'Erro ao desconectar' },
//       { status: 500 }
//     );
//   }
// }

//
import { NextResponse } from 'next/server';
import { closeModbusClient } from '@/app/lib/modbusClient';

export async function DELETE() {
  try {
    await closeModbusClient();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Erro ao desconectar Modbus:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erro na desconexão' },
      { status: 500 }
    );
  }
}
