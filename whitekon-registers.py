# whitekon-registers.py


import serial
import minimalmodbus
import argparse
import sys
import json

def main():
    parser = argparse.ArgumentParser(description="Comunicação com o dispositivo WhiteKon via Modbus.")
    parser.add_argument("--port", required=True, help="Porta serial (ex: COM8)")
    parser.add_argument("--baudrate", type=int, default=115200, help="Baud rate (default: 115200)")
    parser.add_argument("--unit", type=int, default=4, help="Endereço Modbus (default: 4)")
    parser.add_argument("--test", action="store_true", help="Modo teste - apenas verifica conexão")
    parser.add_argument("--read", type=int, help="Lê um registro específico")
    parser.add_argument("--write", type=int, help="Escreve em um registro específico")
    parser.add_argument("--value", type=int, help="Valor para escrita em um único registro")
    parser.add_argument("--count", type=int, default=1, help="Quantidade de registros para ler")
    
    args = parser.parse_args()
    
    instrument = None
    try:
        instrument = minimalmodbus.Instrument(args.port, args.unit)
        instrument.serial.baudrate = args.baudrate
        instrument.serial.bytesize = 8
        instrument.serial.parity = minimalmodbus.serial.PARITY_NONE
        instrument.serial.stopbits = 1
        instrument.serial.timeout = 1.5
        instrument.mode = minimalmodbus.MODE_RTU
        instrument.clear_buffers_before_each_transaction = True

        if args.test:
            instrument.read_register(0, functioncode=3) 
            print(json.dumps({"status": "connected"}))
        
        elif args.read is not None:
            if args.count == 1:
                value = instrument.read_register(args.read, functioncode=3)
                print(json.dumps({"value": value}))
            else:
                values = instrument.read_registers(args.read, args.count, functioncode=3)
                print(json.dumps({"registers": values}))
        
        elif args.write is not None and args.value is not None:
            instrument.write_register(args.write, args.value, functioncode=6)
            print(json.dumps({"success": True}))
        
        sys.stdout.flush()

    except Exception as e:
        error_response = {"error": str(e)}
        print(json.dumps(error_response), file=sys.stderr)
        sys.stderr.flush()
        sys.exit(1)

if __name__ == "__main__":
    main()
