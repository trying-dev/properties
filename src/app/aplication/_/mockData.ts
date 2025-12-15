import { ApplicantInfo, ProfileId, profileIds } from './types'

export { profileIds }

export const mockDataByProfile: Record<ProfileId, ApplicantInfo> = {
  formal: {
    fullName: 'Carlos Andrés Rodríguez',
    email: 'carlos.rodriguez@empresa.com',
    phone: '+57 310 555 1234',
    documentType: 'cedula',
    documentNumber: '1012345678',
    monthlyIncome: '5500000',
  },
  independent: {
    fullName: 'María Fernanda López',
    email: 'mf.lopez@freelance.com',
    phone: '+57 315 555 5678',
    documentType: 'cedula',
    documentNumber: '1023456789',
    monthlyIncome: '6200000',
  },
  retired: {
    fullName: 'Jorge Alberto Martínez',
    email: 'jorge.martinez@gmail.com',
    phone: '+57 320 555 9012',
    documentType: 'cedula',
    documentNumber: '1034567890',
    monthlyIncome: '4800000',
  },
  entrepreneur: {
    fullName: 'Ana Patricia Gómez',
    email: 'ana.gomez@miempresa.com',
    phone: '+57 312 555 3456',
    documentType: 'cedula',
    documentNumber: '900123456',
    monthlyIncome: '8500000',
  },
  investor: {
    fullName: 'Roberto Carlos Sánchez',
    email: 'roberto.sanchez@inversiones.com',
    phone: '+57 318 555 7890',
    documentType: 'cedula',
    documentNumber: '987654321',
    monthlyIncome: '12000000',
  },
  student: {
    fullName: 'Laura Valentina Moreno',
    email: 'laura.moreno@universidad.edu.co',
    phone: '+57 314 555 2345',
    documentType: 'cedula',
    documentNumber: '456789123',
    monthlyIncome: '2500000',
  },
  foreignLocal: {
    fullName: 'Michael Anderson',
    email: 'michael.anderson@company.com',
    phone: '+57 316 555 6789',
    documentType: 'pasaporte',
    documentNumber: 'AA1234567',
    monthlyIncome: '7500000',
  },
  nomad: {
    fullName: 'Emma Johnson',
    email: 'emma.johnson@remote.io',
    phone: '+57 319 555 0123',
    documentType: 'pasaporte',
    documentNumber: 'P12345678',
    monthlyIncome: '9500000',
  },
}
