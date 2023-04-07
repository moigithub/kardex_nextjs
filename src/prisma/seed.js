const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seed() {
  await prisma.purpose.deleteMany()
  await prisma.purpose.create({
    data: {
      id: '1',
      description: 'Distribucion'
    }
  })
  await prisma.purpose.create({
    data: {
      id: '2',
      description: 'Donacion'
    }
  })
  await prisma.purpose.create({
    data: {
      id: '3',
      description: 'Devolucion x vencimiento'
    }
  })
  await prisma.purpose.create({
    data: {
      id: '4',
      description: 'Devolucion x deterioro'
    }
  })
  await prisma.purpose.create({
    data: {
      id: '5',
      description: 'Devolucion x sobrestock'
    }
  })
  await prisma.purpose.create({
    data: {
      id: '6',
      description: 'Intervencion sanitaria'
    }
  })
  // ----------
  await prisma.documentType.deleteMany()
  await prisma.documentType.create({
    data: {
      id: '1',
      description: 'Guia de remision'
    }
  })
  // ----------
  await prisma.product.deleteMany()
  await prisma.product.create({
    data: {
      id: '1',
      description: 'Amoxicilina',
      barCode: '123456789',
      sigaCode: '123456789',
      amount: 1000,
      price: 0.3,
      totalCost: 1000 * 0.3
    }
  })
  await prisma.product.create({
    data: {
      id: '2',
      description: 'Prednisona',
      barCode: '123456782',
      sigaCode: '123456782',
      amount: 200,
      price: 0.5,
      totalCost: 200 * 0.5
    }
  })
  await prisma.product.create({
    data: {
      id: '3',
      description: 'Paracetamol',
      barCode: '123456783',
      sigaCode: '123456783',
      amount: 5000,
      price: 0.2,
      totalCost: 5000 * 0.2
    }
  })
  // ----------
  await prisma.store.deleteMany({})
  await prisma.store.create({
    data: {
      id: '1',
      description: 'Central'
    }
  })
  await prisma.store.create({
    data: {
      id: '2',
      description: 'Almacen Virtual'
    }
  })
}

seed()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async e => {
    console.error(e)

    await prisma.$disconnect()

    process.exit(1)
  })
