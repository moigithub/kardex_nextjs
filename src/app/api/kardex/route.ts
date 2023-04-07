import { NextResponse } from 'next/server'
import { prisma } from '../../../prisma/db'

export async function POST(request: Request, response: Response) {
  const data = await request.json()
  console.log('reques login', data)
  console.log('reques login body', request.body)
  try {
    await prisma.$transaction(async tx => {
      await tx.kardex.create({
        data: {
          fromStore: { connect: { id: data.sourceStore } },
          fromVirtualStore: { connect: { id: data.sourceVirtualStore } },
          toStore: { connect: { id: data.targetStore } },
          toVirtualStore: { connect: { id: data.targetVirtualStore } },
          purpose: { connect: { id: data.purpose } },
          documentType: { connect: { id: data.documentType } },
          documentNumber: data.documentNumber,
          documentDate: new Date(data.documentDate),
          receptionDate: new Date(data.receptionDate),
          reference: data.reference,
          isSale: true,
          KardexDetail: {
            create: data.items.map((item: any) => ({
              product: { connect: { id: item.productCode } },
              amount: parseInt(item.amount),
              lote: item.lote,
              dueDate: new Date(item.dueDate),
              price: parseFloat(item.price)
            }))
          }
        }
      })

      /**
       * precio ponderado
       * precio total / cant = p.unit (solo calc cuando es compra)
       */
      //update stock count
      // if is purchase ...
      //   increase totalCost with incoming price*amount,
      //   and increase amount
      //   and recalculate price = totalCost  / amount
      // if sale, no need to recalculate price
      //   only increase amount and increase totalCost like above

      for (const item of data.items) {
        const product = await tx.product.findFirst({ where: { id: item.productCode } })

        if (!product) {
          console.log('product not found', item)
          throw new Error(`no product`)
        }

        const incomingCost = parseFloat(item.amount) * parseFloat(item.price)

        if (data.isSale) {
          const newCost = (product?.totalCost || 0) - incomingCost
          console.log('sale cost', product?.totalCost, incomingCost, newCost)
          const newAmount = (product?.amount || 0) - parseInt(item.amount)

          // check if we have enough stock to sell, else return error
          // break the transaction
          if (newAmount < 0) {
            console.log('not enough stock', product)
            throw new Error(`not have product enough to sell`)
          }

          // handle concurrency, by adding a version field
          // if no match found update.count will be 0
          const udpatedProduct = await tx.product.updateMany({
            where: { id: product?.id, version: product?.version },
            data: {
              totalCost: newCost,
              amount: newAmount,
              version: {
                increment: 1
              }
            }
          })

          if (udpatedProduct.count === 0) {
            console.log('no product with same version (concurrency collision)', product)
            throw new Error(`No product available! Please try again.`)
          }

          // update stock
          /** stocks products with closer due date should be sell first
           *
           * soldCount = item.amount
           * loop (soldCount->0)
           *    search on stock for productid match ordered by due date ascending and stock>0
           *    if it have enough stock, decrease currentCount by soldCount
           *    else decrease soldCount -=currentCount, and set stock.currentCount to 0
           *    n search next stock product
           */
          let soldCount = parseInt(item.amount)
          while (soldCount > 0) {
            const stockProducts = await tx.stock.findMany({
              where: { productId: product?.id, currentCount: { gt: 0 } },
              orderBy: {
                dueDate: 'asc'
              }
            })

            if (stockProducts.length === 0) {
              // no products available
              console.log('no product stock', product)
              throw new Error(`Product ${product.description} without stock!.`)
            }

            const stockProduct = stockProducts[0]
            // if product count is higher than what we need
            if (stockProduct.currentCount > soldCount) {
              await tx.stock.update({
                where: { id: stockProduct.id },
                data: {
                  currentCount: stockProduct.currentCount - soldCount
                }
              })
              soldCount = 0
            } else {
              // stock product dont have enough stock
              // decrease what it have n search for next stock product
              soldCount -= stockProduct.currentCount
              await tx.stock.update({
                where: { id: stockProduct.id },
                data: {
                  currentCount: 0
                }
              })
            }
          }
        } else {
          // purchase
          const newCost = (product?.totalCost || 0) + incomingCost
          console.log('purchase cost', product?.totalCost, incomingCost, newCost)
          const newAmount = (product?.amount || 0) + parseInt(item.amount)
          const newPrice = newCost / newAmount

          // handle concurrency, by adding a version field
          // if no match found update.count will be 0
          const udpatedProduct = await tx.product.updateMany({
            where: { id: product?.id, version: product?.version },
            data: {
              totalCost: newCost,
              amount: newAmount,
              price: newPrice,
              version: {
                increment: 1
              }
            }
          })

          if (udpatedProduct.count === 0) {
            console.log('no product with same version (concurrency collision)', product)
            throw new Error(`Product updating collision! Please try again.`)
          }

          // register stock for incoming products
          await tx.stock.create({
            data: {
              originalCount: parseInt(item.amount),
              currentCount: parseInt(item.amount),
              lote: item.lote,
              dueDate: new Date(item.dueDate),
              price: parseFloat(item.price),
              Product: { connect: { id: product?.id } }
            }
          })
        }
      }
    })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error(error)

    return NextResponse.json(
      { ok: false, error: error.message },
      {
        status: 400
      }
    )
  }
}

/**

 * save data in stock table (it could have different lotes/due dates for same product)
 * IF sale mode, must discount stock amount on the rows with nearly to due date first
 * wrap all db request on a transaction
 */

/**
 * handle concurrency
 * ---
 * ie: have 2 point of sale (POS)
 * currently on stock: paracetamol 100 units available
 * both want to sell at same time
 * POS1 selling 70 units
 * POS2 selling 80 units
 */
