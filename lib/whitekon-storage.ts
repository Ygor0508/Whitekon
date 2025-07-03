// lib/whitekon-storage.ts

import type { WhiteKon } from "./types"

const STORAGE_KEY = "whitekon-devices"
export class WhiteKonStorage {
  static getAll(): WhiteKon[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []

      const devices = JSON.parse(stored)
      return devices.map((device: any) => ({
        ...device,
        createdAt: new Date(device.createdAt),
        updatedAt: new Date(device.updatedAt),
        lastConnection: device.lastConnection ? new Date(device.lastConnection) : undefined,
      }))
    } catch (error) {
      console.error("Erro ao carregar dispositivos:", error)
      return []
    }
  }

  static save(devices: WhiteKon[]): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(devices))
    } catch (error) {
      console.error("Erro ao salvar dispositivos:", error)
    }
  }

  static add(device: Omit<WhiteKon, "id" | "createdAt" | "updatedAt">): WhiteKon {
    const devices = this.getAll()
    const newDevice: WhiteKon = {
      ...device,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    devices.push(newDevice)
    this.save(devices)
    return newDevice
  }

  static update(id: string, updates: Partial<WhiteKon>): WhiteKon | null {
    const devices = this.getAll()
    const index = devices.findIndex((d) => d.id === id)

    if (index === -1) return null

    devices[index] = {
      ...devices[index],
      ...updates,
      updatedAt: new Date(),
    }

    this.save(devices)
    return devices[index]
  }

  static delete(id: string): boolean {
    const devices = this.getAll()
    const filtered = devices.filter((d) => d.id !== id)

    if (filtered.length === devices.length) return false

    this.save(filtered)
    return true
  }

  static getById(id: string): WhiteKon | null {
    const devices = this.getAll()
    return devices.find((d) => d.id === id) || null
  }

  static getByRtuAddress(rtuAddress: number): WhiteKon | null {
    const devices = this.getAll()
    return devices.find((d) => d.rtuAddress === rtuAddress) || null
  }
}