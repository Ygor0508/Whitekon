# import time
# import argparse
# from pymodbus.client import ModbusSerialClient
# from pymodbus.client import ModbusTcpClient
# from pymodbus.framer.rtu_framer import ModbusRtuFramer
# import serial
# import serial.tools.list_ports
# import logging
# from dataclasses import dataclass
# from typing import Optional, Dict, Any
# import sys
# from serial.serialutil import SerialException
# import os
# import atexit
# import json

# # Configurar logging
# logging.basicConfig(
#     level=logging.INFO,
#     format='%(asctime)s - %(levelname)s - %(message)s'
# )
# logger = logging.getLogger(__name__)

# LOCK_FILE = 'whitekon.lock'
# LOCK_TIMEOUT = 300  # 5 minutos em segundos

# def create_lock_file():
#     try:
#         # Verifica se já existe um arquivo de lock
#         if os.path.exists(LOCK_FILE):
#             with open(LOCK_FILE, 'r') as f:
#                 lock_data = json.load(f)
                
#             # Verifica se o processo ainda está rodando
#             try:
#                 os.kill(lock_data['pid'], 0)
#                 # Se chegou aqui, o processo ainda existe
#                 if time.time() - lock_data['timestamp'] < LOCK_TIMEOUT:
#                     raise Exception("Outro processo já está rodando")
#             except OSError:
#                 # Processo não existe mais
#                 pass
                
#         # Cria novo arquivo de lock
#         with open(LOCK_FILE, 'w') as f:
#             json.dump({
#                 'pid': os.getpid(),
#                 'timestamp': time.time()
#             }, f)
#         logger.info(f"Arquivo de lock criado com PID {os.getpid()}")
#     except Exception as e:
#         logger.error(f"Erro ao criar arquivo de lock: {e}")
#         raise

# def remove_lock_file():
#     logger.info("Removendo arquivo de lock...")
#     try:
#         if os.path.exists(LOCK_FILE):
#             os.remove(LOCK_FILE)
#             logger.info("Arquivo de lock removido")
#     except Exception as e:
#         logger.error(f"Erro ao remover arquivo de lock: {e}")

# def check_lock_file():
#     try:
#         if not os.path.exists(LOCK_FILE):
#             return False
            
#         with open(LOCK_FILE, 'r') as f:
#             data = json.load(f)
#             pid = data.get('pid')
#             timestamp = data.get('timestamp', 0)
            
#             # Verifica timeout
#             if time.time() - timestamp > LOCK_TIMEOUT:
#                 logger.warning("Lock expirado, removendo...")
#                 remove_lock_file()
#                 return False
                
#             if pid:
#                 try:
#                     os.kill(pid, 0)  # Verifica se o processo existe
#                     logger.info(f"Lock ativo com PID {pid}")
#                     return True
#                 except OSError:
#                     logger.warning(f"Processo {pid} não existe mais, removendo lock")
#                     remove_lock_file()
#         return False
#     except Exception as e:
#         logger.error(f"Erro ao verificar arquivo de lock: {e}")
#         return False

# @dataclass
# class WhitekonRegisters:
#     # Registros do medidor de brancura
#     MODO_OPERACAO = 0
#     BRANCURA_MEDIA = 5
#     TEMP_CALIBRACAO = 6
#     TEMP_ONLINE = 7
#     BLUE_PRETO = 8
#     BLUE_BRANCO = 9
#     DESVIO_PADRAO = 11
#     RED = 15
#     GREEN = 16
#     BLUE = 17
#     CLEAR = 18
#     CONTADOR_AMOSTRAS = 19
#     BRANCURA_ONLINE = 21
#     COMANDOS_CALIBRACAO = 27
#     CONTROLE_REMOTO = 28
#     AUTOMATICO_MANUAL = 29
#     TEMPO_INTEGRACAO = 34
#     GANHO = 35
#     BRANCURA_MINIMA = 53
#     BRANCURA_MAXIMA = 54
#     ESCURO_MAXIMO = 55
#     CLARO_MINIMO = 56

# class WhitekonSensor:
#     _instance = None
#     _lock = False
#     _retry_count = 3
#     _retry_delay = 1.0  # segundos
    
#     def __new__(cls, *args, **kwargs):
#         if not cls._instance:
#             cls._instance = super().__new__(cls)
#         return cls._instance

#     def __init__(self, port='COM8', baudrate=115200, unit=4):
#         if hasattr(self, 'client'):
#             return
            
#         self.port = port
#         self.baudrate = baudrate
#         self.unit = unit
#         self.client = None
#         self.registers = WhitekonRegisters()
#         self._connected = False
#         self._last_successful_read = 0
        
#     def _try_connect(self) -> bool:
#         """Tenta estabelecer uma conexão com retry."""
#         for attempt in range(self._retry_count):
#             try:
#                 if attempt > 0:
#                     logger.info(f"Tentativa {attempt + 1} de {self._retry_count}")
#                     time.sleep(self._retry_delay)
                
#                 if self.client:
#                     try:
#                         self.client.close()
#                         remove_lock_file()
#                     except:
#                         pass
#                     self.client = None
                
#                 self.client = ModbusSerialClient(
#                     method='rtu',
#                     port=self.port,
#                     baudrate=self.baudrate,
#                     timeout=2,
#                     retry_on_empty=True,
#                     retries=3
#                 )
                
#                 if not self.client.connect():
#                     logger.error(f"Falha ao conectar à porta {self.port}")
#                     continue
                
#                 # Testa a conexão
#                 result = self.client.read_holding_registers(
#                     address=0,
#                     count=1,
#                     slave=self.unit
#                 )
                
#                 if result and not result.isError():
#                     logger.info(f"Conectado com sucesso à porta {self.port}")
#                     self._connected = True
#                     self._last_successful_read = time.time()
#                     return True
                    
#             except Exception as e:
#                 logger.error(f"Erro na tentativa {attempt + 1}: {e}")
                
#             finally:
#                 if not self._connected and self.client:
#                     try:
#                         self.client.close()
#                     except:
#                         pass
#                     self.client = None
                    
#         return False
        
#     def connect(self) -> bool:
#         """Conecta ao medidor com melhor gerenciamento de erros."""
#         if self._lock:
#             logger.warning("Já existe uma tentativa de conexão em andamento")
#             return False
            
#         try:
#             self._lock = True
            
#             # Fecha conexão existente se houver
#             self.close()
            
#             return self._try_connect()
            
#         except Exception as e:
#             logger.error(f"Erro ao conectar: {e}")
#             return False
            
#         finally:
#             self._lock = False
            
#     def close(self):
#         """Fecha a conexão com o medidor de forma segura."""
#         try:
#             if self.client:
#                 self.client.close()
#                 self.client = None
#             self._connected = False
#             logger.info("Conexão fechada")
#         except Exception as e:
#             logger.error(f"Erro ao fechar conexão: {e}")

#     def ensure_connection(self) -> bool:
#         """Garante que a conexão está ativa, reconectando se necessário."""
#         try:
#             # Se não há cliente ou última leitura foi há mais de 30 segundos
#             if (not self.client or 
#                 not self._connected or 
#                 time.time() - self._last_successful_read > 30):
                
#                 logger.info("Verificando conexão...")
#                 return self.connect()
            
#             # Testa a conexão com uma leitura
#             try:
#                 result = self.client.read_holding_registers(
#                     address=0,
#                     count=1,
#                     slave=self.unit
#                 )
                
#                 if result and not result.isError():
#                     self._last_successful_read = time.time()
#                     return True
#             except Exception as e:
#                 logger.error(f"Erro ao verificar conexão: {e}")
            
#             logger.warning("Conexão perdida, tentando reconectar...")
#             return self.connect()
            
#         except Exception as e:
#             logger.error(f"Erro ao verificar conexão: {e}")
#             return False
    
#     def read_register(self, address: int) -> Optional[int]:
#         """Lê um registro específico."""
#         max_retries = 5  # Aumentado para 5 tentativas
#         retry_delay = 0.5
        
#         for attempt in range(max_retries):
#             if not self.ensure_connection():
#                 if attempt == max_retries - 1:
#                     print(f"Falha ao reconectar após {max_retries} tentativas")
#                     return None
#                 time.sleep(retry_delay)
#                 continue
                
#             try:
#                 result = self.client.read_holding_registers(
#                     address=address,
#                     count=1,
#                     slave=self.unit
#                 )
                
#                 if result and not result.isError():
#                     return result.registers[0]
                
#                 if attempt < max_retries - 1:
#                     print(f"Tentativa {attempt + 1} falhou, tentando novamente...")
#                     time.sleep(retry_delay)
#                     continue
                    
#                 print(f"Falha na leitura do registro {address}")
#                 return None
                
#             except Exception as e:
#                 if attempt < max_retries - 1:
#                     print(f"Erro na tentativa {attempt + 1}: {e}")
#                     time.sleep(retry_delay)
#                     continue
#                 print(f"Erro ao ler registro {address}: {e}")
#                 return None
        
#         return None
    
#     def write_register(self, address: int, value: int) -> bool:
#         """Escreve em um registro específico."""
#         max_retries = 3
#         retry_delay = 0.5
        
#         for attempt in range(max_retries):
#             if not self.ensure_connection():
#                 if attempt == max_retries - 1:
#                     print(f"Falha ao reconectar após {max_retries} tentativas")
#                 continue
                
#             try:
#                 result = self.client.write_register(
#                     address=address,
#                     value=value,
#                     slave=self.unit
#                 )
                
#                 if result and not result.isError():
#                     # Verifica se o valor foi escrito corretamente
#                     verify = self.read_register(address)
#                     if verify == value:
#                         return True
                    
#                     if attempt < max_retries - 1:
#                         print(f"Valor escrito ({verify}) diferente do esperado ({value}), tentando novamente...")
#                         time.sleep(retry_delay)
#                         continue
                
#                 if attempt < max_retries - 1:
#                     print(f"Tentativa {attempt + 1} falhou, tentando novamente...")
#                     time.sleep(retry_delay)
#                     continue
                    
#                 print(f"Falha na escrita do registro {address}")
#                 return False
                
#             except Exception as e:
#                 if attempt < max_retries - 1:
#                     print(f"Erro na tentativa {attempt + 1}: {e}")
#                     time.sleep(retry_delay)
#                     continue
#                 print(f"Erro ao escrever no registro {address}: {e}")
#                 return False
        
#         return False
    
#     def get_operation_mode(self) -> Optional[int]:
#         """Obtém o modo de operação atual."""
#         return self.read_register(self.registers.MODO_OPERACAO)
        
#     def set_operation_mode(self, mode: int) -> bool:
#         """Define o modo de operação (0-Normal, 1-Calibração, 2-Limpeza, 3-Parado)."""
#         if mode not in range(4):
#             logging.error("Modo de operação inválido")
#             return False
#         return self.write_register(self.registers.MODO_OPERACAO, mode)
    
#     def get_whiteness_values(self) -> Dict[str, Any]:
#         """Obtém os valores de brancura e RGB."""
#         try:
#             # Lê todos os valores primeiro
#             brancura_media = self.read_register(self.registers.BRANCURA_MEDIA)
#             brancura_online = self.read_register(self.registers.BRANCURA_ONLINE)
#             desvio_padrao = self.read_register(self.registers.DESVIO_PADRAO)
#             temp_cal = self.read_register(self.registers.TEMP_CALIBRACAO)
#             temp_online = self.read_register(self.registers.TEMP_ONLINE)
            
#             # Função auxiliar para converter valores
#             def convert_temp(value):
#                 if value is None:
#                     return None
#                 if value > 32767:  # Valor negativo em complemento de 2
#                     value -= 65536
#                 return value / 10.0
            
#             def convert_whiteness(value):
#                 if value is None:
#                     return None
#                 return value / 10.0 if value <= 1000 else 0.0
            
#             return {
#                 'brancura': {
#                     'media': convert_whiteness(brancura_media),
#                     'online': convert_whiteness(brancura_online),
#                     'desvio_padrao': convert_whiteness(desvio_padrao)
#                 },
#                 'temperatura': {
#                     'calibracao': convert_temp(temp_cal),
#                     'online': convert_temp(temp_online)
#                 },
#                 'rgb': {
#                     'red': self.read_register(self.registers.RED),
#                     'green': self.read_register(self.registers.GREEN),
#                     'blue': self.read_register(self.registers.BLUE),
#                     'clear': self.read_register(self.registers.CLEAR)
#                 },
#                 'blue_calibracao': {
#                     'preto': self.read_register(self.registers.BLUE_PRETO),
#                     'branco': self.read_register(self.registers.BLUE_BRANCO)
#                 },
#                 'amostras': self.read_register(self.registers.CONTADOR_AMOSTRAS)
#             }
#         except Exception as e:
#             logging.error(f"Erro ao obter valores: {e}")
#             return None
    
#     def set_integration_time(self, time_code: int) -> bool:
#         """
#         Define o tempo de integração.
#         Códigos: 0=24ms, 1=50ms, 2=101ms, 3=154ms, 4=700ms
#         """
#         if time_code not in range(5):
#             logging.error("Código de tempo de integração inválido")
#             return False
#         return self.write_register(self.registers.TEMPO_INTEGRACAO, time_code)
    
#     def set_gain(self, gain_code: int) -> bool:
#         """
#         Define o ganho do sensor.
#         Códigos: 0=1x, 1=4x, 2=16x, 3=60x
#         """
#         if gain_code not in range(4):
#             logging.error("Código de ganho inválido")
#             return False
#         return self.write_register(self.registers.GANHO, gain_code)
    
#     def calibrate_dark(self) -> bool:
#         """Inicia a calibração do escuro."""
#         return self.write_register(self.registers.COMANDOS_CALIBRACAO, 0x5501)
    
#     def calibrate_white(self) -> bool:
#         """Inicia a calibração do claro."""
#         return self.write_register(self.registers.COMANDOS_CALIBRACAO, 0x5502)
    
#     def set_auto_mode(self, auto: bool) -> bool:
#         """Define modo automático (True) ou manual (False)."""
#         return self.write_register(self.registers.AUTOMATICO_MANUAL, 0 if auto else 1)
    
#     def set_brightness_limits(self, min_value: float, max_value: float) -> bool:
#         """Define os limites de brancura (em %)."""
#         try:
#             # Converte porcentagem para valor inteiro (multiplica por 10)
#             min_int = int(min_value * 10)
#             max_int = int(max_value * 10)
            
#             if not (0 <= min_int <= 1000 and 0 <= max_int <= 1000):
#                 logging.error("Valores de brancura devem estar entre 0 e 100%")
#                 return False
                
#             return (self.write_register(self.registers.BRANCURA_MINIMA, min_int) and
#                     self.write_register(self.registers.BRANCURA_MAXIMA, max_int))
#         except ValueError:
#             logging.error("Valores inválidos para limites de brancura")
#             return False
    
#     def monitor_whiteness(self, interval: float = 1.0):
#         """Monitora os valores de brancura continuamente."""
#         consecutive_errors = 0
#         max_consecutive_errors = 5
        
#         try:
#             while True:
#                 valores = self.get_whiteness_values()
#                 if valores is None:
#                     consecutive_errors += 1
#                     print(f"\nErro na leitura dos valores. Tentativa {consecutive_errors} de {max_consecutive_errors}")
                    
#                     if consecutive_errors >= max_consecutive_errors:
#                         print("\nMuitos erros consecutivos. Tentando reconectar...")
#                         if self.connect():
#                             print("Reconectado com sucesso!")
#                             consecutive_errors = 0
#                         else:
#                             print("Falha ao reconectar. Tentando novamente em 5 segundos...")
#                             time.sleep(5)
#                             continue
                    
#                     time.sleep(interval)
#                     continue
                
#                 consecutive_errors = 0  # Reseta o contador de erros
                
#                 print("\n📊 Leitura do Medidor de Brancura:")
                
#                 # Brancura
#                 print(f"\n🔍 Brancura:")
#                 if valores['brancura']['media'] is not None:
#                     print(f"  Media: {valores['brancura']['media']:.1f}%")
#                 if valores['brancura']['online'] is not None:
#                     print(f"  Online: {valores['brancura']['online']:.1f}%")
#                 if valores['brancura']['desvio_padrao'] is not None:
#                     print(f"  Desvio Padrão: {valores['brancura']['desvio_padrao']:.1f}%")
                
#                 # Temperatura
#                 print(f"\n🌡️ Temperatura:")
#                 if valores['temperatura']['calibracao'] is not None:
#                     print(f"  Calibração: {valores['temperatura']['calibracao']:.1f}°C")
#                 if valores['temperatura']['online'] is not None:
#                     print(f"  Online: {valores['temperatura']['online']:.1f}°C")
                
#                 # RGB
#                 print(f"\n🎨 Valores RGB:")
#                 for key, value in valores['rgb'].items():
#                     if value is not None:
#                         print(f"  {key.capitalize()}: {value}")
                
#                 # Calibração Blue
#                 print(f"\n📝 Calibração Blue:")
#                 if valores['blue_calibracao']['preto'] is not None:
#                     print(f"  Preto: {valores['blue_calibracao']['preto']}")
#                 if valores['blue_calibracao']['branco'] is not None:
#                     print(f"  Branco: {valores['blue_calibracao']['branco']}")
                
#                 # Amostras
#                 if valores['amostras'] is not None:
#                     print(f"\n🔢 Contador de amostras: {valores['amostras']}")
                
#                 time.sleep(interval)
                
#         except KeyboardInterrupt:
#             print("\nMonitoramento interrompido pelo usuário.")
#         except Exception as e:
#             print(f"\nErro durante o monitoramento: {e}")
#         finally:
#             self.close()

#     def is_connected(self) -> bool:
#         """Verifica se há uma conexão ativa."""
#         if not self.client:
#             return False
            
#         try:
#             result = self.client.read_holding_registers(
#                 address=0,
#                 count=1,
#                 slave=self.unit
#             )
#             return result and not result.isError()
#         except:
#             return False
    
#     def check_status(self) -> bool:
#         """Verifica o status da conexão."""
#         is_connected = self.is_connected()
#         if is_connected:
#             print("Conexão ativa")
#         else:
#             print("Sem conexão")
#         return is_connected

# def main():
#     # Registra função para remover arquivo de lock ao sair
#     atexit.register(remove_lock_file)

#     parser = argparse.ArgumentParser(description='Controle do Medidor de Brancura Whitekon')
#     parser.add_argument('--port', default='COM8', help='Porta serial (default: COM8)')
#     parser.add_argument('--baudrate', type=int, default=115200, help='Baudrate (default: 115200)')
#     parser.add_argument('--unit', type=int, default=4, help='Unit ID (default: 4)')
#     parser.add_argument('--interactive', action='store_true', help='Modo interativo')
#     parser.add_argument('--test', action='store_true', help='Modo teste - conecta e mantém conexão')
#     parser.add_argument('--check-status', action='store_true', help='Verifica status da conexão')
#     parser.add_argument('--force', action='store_true', help='Força execução mesmo se houver lock')
    
#     args = parser.parse_args()

#     # Verifica se já existe uma instância rodando
#     if not args.force and check_lock_file():
#         print("ERROR: Já existe uma instância do programa rodando")
#         sys.exit(1)

#     # Cria arquivo de lock
#     create_lock_file()
    
#     sensor = WhitekonSensor(port=args.port, baudrate=args.baudrate, unit=args.unit)
    
#     if args.check_status:
#         if sensor.is_connected():
#             print("STATUS:CONNECTED")
#             return
#         else:
#             print("STATUS:DISCONNECTED")
#             return
            
#     if args.test or args.interactive:
#         if sensor.connect():
#             print("CONNECTED")
#             sys.stdout.flush()
#             # Mantém a conexão ativa e aguarda comandos
#             try:
#                 while True:
#                     try:
#                         if args.interactive:
#                             if not sys.stdin.isatty():  # Se não for um terminal
#                                 command = sys.stdin.readline().strip()
#                                 if not command:  # Se não houver comando, continua aguardando
#                                     time.sleep(0.1)
#                                     continue
                                    
#                                 parts = command.split()
#                                 if parts[0] == 'read' and len(parts) == 3:
#                                     start = int(parts[1])
#                                     count = int(parts[2])
#                                     values = []
#                                     for i in range(count):
#                                         value = sensor.read_register(start + i)
#                                         if value is not None:
#                                             values.append(str(value))
#                                         else:
#                                             print(f"ERROR: Falha ao ler registro {start + i}")
#                                             sys.stdout.flush()
#                                             break
#                                     if values:
#                                         print('\n'.join(values))
#                                         sys.stdout.flush()
#                                     else:
#                                         print("ERROR: Nenhum valor lido")
#                                         sys.stdout.flush()
#                                 elif parts[0] == 'write' and len(parts) == 3:
#                                     address = int(parts[1])
#                                     value = int(parts[2])
#                                     if sensor.write_register(address, value):
#                                         print("OK")
#                                         sys.stdout.flush()
#                                     else:
#                                         print("ERROR: Falha na escrita")
#                                         sys.stdout.flush()
#                                 elif command == 'exit':
#                                     break
#                                 else:
#                                     print(f"ERROR: Comando inválido: {command}")
#                                     sys.stdout.flush()
#                             else:
#                                 time.sleep(0.1)
#                         else:  # Modo teste
#                             time.sleep(1)
#                             if not sensor.is_connected():
#                                 print("DISCONNECTED")
#                                 break
                            
#                     except Exception as e:
#                         print(f"ERROR: {str(e)}")
#                         sys.stdout.flush()
                        
#             except KeyboardInterrupt:
#                 print("\nEncerrando conexão...")
#             finally:
#                 sensor.close()
#                 print("DISCONNECTED")
#                 sys.stdout.flush()
#         else:
#             print("FAILED")
#             sys.stdout.flush()
#         return

#     # Modo normal (não interativo)
#     if not sensor.connect():
#         print("\nNão foi possível conectar ao medidor!")
#         print("Verifique:")
#         print("1. Se o medidor está ligado")
#         print("2. Se o cabo USB está conectado")
#         print("3. Se a porta COM está correta")
#         print("4. Se o endereço Modbus (unit=4) está correto")
#         return

#     print("CONNECTED")

# if __name__ == '__main__':
#     try:
#         main()
#     finally:
#         remove_lock_file()
