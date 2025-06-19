# import serial
# import minimalmodbus
# import argparse
# import sys
# import time
# import os
# import serial.tools.list_ports

# def main():
#     parser = argparse.ArgumentParser(description="Comunicação com o dispositivo WhiteKon via Modbus.")
#     parser.add_argument("--port", required=True, help="Porta serial (ex: COM8)")
#     parser.add_argument("--baudrate", type=int, default=115200, help="Baud rate (default: 115200)")
#     parser.add_argument("--unit", type=int, default=4, help="Endereço Modbus (default: 4)")
#     parser.add_argument("--test", action="store_true", help="Modo teste - apenas verifica conexão")
#     parser.add_argument("--check-status", action="store_true", help="Verifica status da conexão")
#     parser.add_argument("--read", type=int, help="Lê um registro específico")
#     parser.add_argument("--write", type=int, help="Escreve em um registro específico")
#     parser.add_argument("--value", type=int, help="Valor para escrita")
#     parser.add_argument("--count", type=int, default=1, help="Quantidade de registros para ler")
    
#     args = parser.parse_args()
    
#     # Imprime informações para debug
#     print(f"Iniciando script com porta={args.port}, baudrate={args.baudrate}, unit={args.unit}")
#     sys.stdout.flush()
    
#     # Lista portas disponíveis
#     available_ports = [port.device for port in serial.tools.list_ports.comports()]
#     print(f"Portas disponíveis: {available_ports}")
#     sys.stdout.flush()
    
#     # Verifica se a porta existe
#     # Modo de teste - verifica conexão real
#     if args.test:
#         try:
#             # Tenta conectar ao dispositivo real
#             instrument = minimalmodbus.Instrument(args.port, args.unit)
#             instrument.serial.baudrate = args.baudrate
#             instrument.serial.bytesize = 8
#             instrument.serial.parity = minimalmodbus.serial.PARITY_NONE
#             instrument.serial.stopbits = 1
#             instrument.serial.timeout = 1
#             instrument.mode = minimalmodbus.MODE_RTU
            
#             # Tenta ler um registro para verificar conexão
#             test_value = instrument.read_register(0)  # Lê registro 0 (MODO_OPERACAO)
#             print("CONNECTED")
#             sys.stdout.flush()
#             return
#         except Exception as e:
#             print(f"FAILED: {str(e)}")
#             sys.stdout.flush()
#             return
    
#     # Modo de verificação de status
#     if args.check_status:
#         try:
#             instrument = minimalmodbus.Instrument(args.port, args.unit)
#             instrument.serial.baudrate = args.baudrate
#             instrument.serial.bytesize = 8
#             instrument.serial.parity = minimalmodbus.serial.PARITY_NONE
#             instrument.serial.stopbits = 1
#             instrument.serial.timeout = 1
#             instrument.mode = minimalmodbus.MODE_RTU
            
#             # Tenta ler um registro para verificar se ainda está conectado
#             test_value = instrument.read_register(0)
#             print("STATUS:CONNECTED")
#             sys.stdout.flush()
#             return
#         except Exception as e:
#             print(f"STATUS:DISCONNECTED ({str(e)})")
#             sys.stdout.flush()
#             return
    
#     # Modo de leitura
#     if args.read is not None:
#         try:
#             instrument = minimalmodbus.Instrument(args.port, args.unit)
#             instrument.serial.baudrate = args.baudrate
#             instrument.serial.bytesize = 8
#             instrument.serial.parity = minimalmodbus.serial.PARITY_NONE
#             instrument.serial.stopbits = 1
#             instrument.serial.timeout = 1
#             instrument.mode = minimalmodbus.MODE_RTU
            
#             if args.count == 1:
#                 # Lê um único registro
#                 value = instrument.read_register(args.read)
#                 print(value)
#             else:
#                 # Lê múltiplos registros
#                 values = instrument.read_registers(args.read, args.count)
#                 for value in values:
#                     print(value)
            
#             sys.stdout.flush()
#             return
#         except Exception as e:
#             print(f"ERROR: {str(e)}")
#             sys.stdout.flush()
#             return
    
#     # Modo de escrita
#     if args.write is not None and args.value is not None:
#         try:
#             instrument = minimalmodbus.Instrument(args.port, args.unit)
#             instrument.serial.baudrate = args.baudrate
#             instrument.serial.bytesize = 8
#             instrument.serial.parity = minimalmodbus.serial.PARITY_NONE
#             instrument.serial.stopbits = 1
#             instrument.serial.timeout = 1
#             instrument.mode = minimalmodbus.MODE_RTU
            
#             # Escreve no registro
#             instrument.write_register(args.write, args.value)
#             print("OK")
#             sys.stdout.flush()
#             return
#         except Exception as e:
#             print(f"ERROR: {str(e)}")
#             sys.stdout.flush()
#             return

# if __name__ == "__main__":
#     try:
#         main()
#     except Exception as e:
#         print(f"ERRO CRÍTICO: {str(e)}")
#         sys.stdout.flush()

import serial
import minimalmodbus
import argparse
import sys
import time
import os
import serial.tools.list_ports

def main():
    parser = argparse.ArgumentParser(description="Comunicação com o dispositivo WhiteKon via Modbus.")
    parser.add_argument("--port", required=True, help="Porta serial (ex: COM8)")
    parser.add_argument("--baudrate", type=int, default=115200, help="Baud rate (default: 115200)")
    parser.add_argument("--unit", type=int, default=4, help="Endereço Modbus (default: 4)")
    parser.add_argument("--test", action="store_true", help="Modo teste - apenas verifica conexão")
    parser.add_argument("--check-status", action="store_true", help="Verifica status da conexão")
    parser.add_argument("--read", type=int, help="Lê um registro específico")
    parser.add_argument("--write", type=int, help="Escreve em um registro específico")
    parser.add_argument("--value", type=int, help="Valor para escrita")
    parser.add_argument("--count", type=int, default=1, help="Quantidade de registros para ler")
    
    args = parser.parse_args()
    
    # Imprime informações para debug apenas em modo verbose
    if args.test or args.check_status:
        print(f"Iniciando script com porta={args.port}, baudrate={args.baudrate}, unit={args.unit}")
        sys.stdout.flush()
        
        # Lista portas disponíveis
        available_ports = [port.device for port in serial.tools.list_ports.comports()]
        print(f"Portas disponíveis: {available_ports}")
        sys.stdout.flush()
    
    # Modo de teste - verifica conexão real
    if args.test:
        try:
            # Tenta conectar ao dispositivo real
            instrument = minimalmodbus.Instrument(args.port, args.unit)
            instrument.serial.baudrate = args.baudrate
            instrument.serial.bytesize = 8
            instrument.serial.parity = minimalmodbus.serial.PARITY_NONE
            instrument.serial.stopbits = 1
            instrument.serial.timeout = 2
            instrument.mode = minimalmodbus.MODE_RTU
            
            # Tenta ler um registro para verificar conexão
            test_value = instrument.read_register(0)  # Lê registro 0 (MODO_OPERACAO)
            print("CONNECTED")
            sys.stdout.flush()
            return
        except Exception as e:
            print(f"FAILED: {str(e)}")
            sys.stdout.flush()
            return
    
    # Modo de verificação de status
    if args.check_status:
        try:
            instrument = minimalmodbus.Instrument(args.port, args.unit)
            instrument.serial.baudrate = args.baudrate
            instrument.serial.bytesize = 8
            instrument.serial.parity = minimalmodbus.serial.PARITY_NONE
            instrument.serial.stopbits = 1
            instrument.serial.timeout = 2
            instrument.mode = minimalmodbus.MODE_RTU
            
            # Tenta ler um registro para verificar se ainda está conectado
            test_value = instrument.read_register(0)
            print("STATUS:CONNECTED")
            sys.stdout.flush()
            return
        except Exception as e:
            print(f"STATUS:DISCONNECTED ({str(e)})")
            sys.stdout.flush()
            return
    
    # Modo de leitura
    if args.read is not None:
        try:
            instrument = minimalmodbus.Instrument(args.port, args.unit)
            instrument.serial.baudrate = args.baudrate
            instrument.serial.bytesize = 8
            instrument.serial.parity = minimalmodbus.serial.PARITY_NONE
            instrument.serial.stopbits = 1
            instrument.serial.timeout = 3
            instrument.mode = minimalmodbus.MODE_RTU
            
            if args.count == 1:
                # Lê um único registro
                value = instrument.read_register(args.read)
                print(value)
            else:
                # Lê múltiplos registros
                values = instrument.read_registers(args.read, args.count)
                for value in values:
                    print(value)
            
            sys.stdout.flush()
            return
        except Exception as e:
            print(f"ERROR: {str(e)}", file=sys.stderr)
            sys.stderr.flush()
            return
    
    # Modo de escrita
    if args.write is not None and args.value is not None:
        try:
            instrument = minimalmodbus.Instrument(args.port, args.unit)
            instrument.serial.baudrate = args.baudrate
            instrument.serial.bytesize = 8
            instrument.serial.parity = minimalmodbus.serial.PARITY_NONE
            instrument.serial.stopbits = 1
            instrument.serial.timeout = 3
            instrument.mode = minimalmodbus.MODE_RTU
            
            # Escreve no registro
            instrument.write_register(args.write, args.value)
            print("OK")
            sys.stdout.flush()
            return
        except Exception as e:
            print(f"ERROR: {str(e)}", file=sys.stderr)
            sys.stderr.flush()
            return

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"ERRO CRÍTICO: {str(e)}", file=sys.stderr)
        sys.stderr.flush()
