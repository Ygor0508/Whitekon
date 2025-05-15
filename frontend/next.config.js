/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify: true,  // REMOVIDO: não é mais reconhecido na sua versão do Next.js

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Garante que o Next.js não tente bundlar esses módulos nativos
      config.externals = [
        ...config.externals,
        // nome do pacote        // como ele será importado em runtime
        { 'modbus-serial': 'commonjs modbus-serial' },
        { 'serialport':    'commonjs serialport' }
      ]
    }
    return config
  }
}

module.exports = nextConfig
