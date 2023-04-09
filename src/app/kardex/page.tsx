'use client'

import { useForm, type SubmitHandler, useFieldArray } from 'react-hook-form'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type KardexItem = {
  sigaCode?: string
  barCode?: string
  productCode: string
  description: string
  amount: number
  lote: string
  price: number
  dueDate: string
}

type KardexForm = {
  sourceStore: string
  sourceVirtualStore: string
  targetStore: string
  targetVirtualStore: string
  purpose: string
  documentType: string
  documentNumber: string
  documentDate: string
  receptionDate: string
  reference: string
  isSale: boolean
  createdAt: Date
  items: KardexItem[]
}

type KardexFormData = KardexForm & KardexItem

async function getDocumentTypes() {
  const res = await fetch('/api/documentType')

  return res.json()
}
async function getStores() {
  const res = await fetch('/api/store')

  return res.json()
}
async function getPurposes() {
  const res = await fetch('/api/purpose')

  return res.json()
}
async function getProducts(filter?: any) {
  const searchParams = new URLSearchParams()
  searchParams.append('sigaCode', filter?.sigaCode || '')
  searchParams.append('barCode', filter?.barCode || '')
  searchParams.append('productCode', filter?.productCode || '')
  searchParams.append('description', filter?.description || '')

  const res = await fetch(`/api/products?${searchParams.toString()}`)

  return res.json()
}

interface DocumentType {
  id: string
  description: string
}
interface Store {
  id: string
  description: string
}
interface Purpose {
  id: string
  description: string
}
interface Product {
  id: string
  description: string
  barCode: string
  sigaCode: string
  amount: number
  price: number
}
export default function Kardex() {
  const router = useRouter()
  const { data: session } = useSession()
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [purposes, setPurposes] = useState<Purpose[]>([])
  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<KardexFormData>({
    defaultValues: {
      //   sourceStore: '',
      //   sourceVirtualStore: '',
      //   targetStore: '',
      //   targetVirtualStore: '',
      //   purpose: '',
      //   documentType: '',
      //   documentNumber: '',
      //   // documentDate: format(new Date(), 'yyyy-MM-dd'),
      //   // receptionDate: format(new Date(), 'yyyy-MM-dd'),
      //   reference: '',
      isSale: false,
      //   createdAt: new Date(),
      items: [
        //     // { description: '', productCode: '', amount: 0, lote: '', price: 0, dueDate: new Date() }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
    rules: {
      required: true
      // minLength: 1
    }
  })

  useEffect(() => {
    async function getData() {
      const response = await getDocumentTypes()
      setDocumentTypes(response.data)

      const storeResponse = await getStores()
      setStores(storeResponse.data)

      const purposeResponse = await getPurposes()
      setPurposes(purposeResponse.data)
    }
    getData()
  }, [])

  // console.log('errors', errors)
  // console.log('documentTypes', documentTypes)
  // console.log('stores', stores)
  // console.log('purposes', purposes)
  // console.log('Products', products)

  const addKardexItem = ({ description, id, amount, price }: Product) => {
    append({
      description,
      productCode: id,
      amount,
      lote: '',
      price: parseFloat(price.toFixed(2)),
      dueDate: format(new Date(), 'yyyy-MM-dd')
    })
  }
  const items = watch('items')
  const isSale = watch('isSale')
  console.log('items', items)

  const onSubmit: SubmitHandler<KardexFormData> = async data => {
    console.log(data)
    if (items.length === 0) {
      return
    }
    const res = await fetch('/api/kardex', {
      method: 'post',
      body: JSON.stringify(data)
    })
    const result = await res.json()
    console.log('res', result)
    if (!result.ok) {
      alert(result.error)
    } else {
      //redirect
    }
  }

  if (!session) {
    router.push('/')
  }

  return (
    <section className='grid grid-cols-[2fr_1fr] gap-2'>
      <div className='p-4 '>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-4 '>
            <div className='block '>
              <label className='mr-2 text-black-200 text-sm  ' htmlFor='documentNumber'>
                Es Salida de almacen/venta?
              </label>
              <input
                type='checkbox'
                className='py-1 pl-3 pr-10 rounded-md bg-white  text-base shadow-lg ring-1 ring-black ring-opacity-5'
                {...register('isSale')}
              />
            </div>
          </div>
          <div className='mt-4 grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-4 '>
            <div className='block '>
              <label className='mr-2 text-black-200 text-sm  ' htmlFor='sourceStore'>
                sourceStore
              </label>
              <select
                className='py-1 pl-3 pr-10 rounded-md bg-white  text-base shadow-lg ring-1 ring-black ring-opacity-5'
                id='sourceStore'
                {...register('sourceStore', { required: true })}
                defaultValue=''
              >
                <option value='' disabled>
                  --Please choose an option--
                </option>
                {stores?.map((item: Store) => (
                  <option key={item.id} value={item.id}>
                    {item.description}
                  </option>
                ))}
              </select>
              {errors.sourceStore && (
                <span className='block text-sm text-red-600'>This field is required</span>
              )}
            </div>
            <div className='block '>
              <label className='mr-2 text-black-200 text-sm  ' htmlFor='targetStore'>
                targetStore
              </label>
              <select
                className='py-1 pl-3 pr-10 rounded-md bg-white  text-base shadow-lg ring-1 ring-black ring-opacity-5'
                id='targetStore'
                {...register('targetStore', { required: true })}
                defaultValue=''
              >
                <option value='' disabled>
                  --Please choose an option--
                </option>
                {stores?.map((item: Store) => (
                  <option key={item.id} value={item.id}>
                    {item.description}
                  </option>
                ))}
              </select>
              {errors.targetStore && (
                <span className='block text-sm text-red-600'>This field is required</span>
              )}
            </div>
            <div className='block '>
              <label className='mr-2 text-black-200 text-sm  ' htmlFor='sourceVirtualStore'>
                sourceVirtualStore
              </label>
              <select
                className='py-1 pl-3 pr-10 rounded-md bg-white  text-base shadow-lg ring-1 ring-black ring-opacity-5'
                id='sourceVirtualStore'
                {...register('sourceVirtualStore', { required: true })}
                defaultValue=''
              >
                <option value='' disabled>
                  --Please choose an option--
                </option>
                {stores?.map((item: Store) => (
                  <option key={item.id} value={item.id}>
                    {item.description}
                  </option>
                ))}
              </select>
              {errors.sourceVirtualStore && (
                <span className='block text-sm text-red-600'>This field is required</span>
              )}
            </div>
            <div className='block '>
              <label className='mr-2 text-black-200 text-sm  ' htmlFor='targetVirtualStore'>
                targetVirtualStore
              </label>
              <select
                className='py-1 pl-3 pr-10 rounded-md bg-white  text-base shadow-lg ring-1 ring-black ring-opacity-5'
                id='targetVirtualStore'
                {...register('targetVirtualStore', { required: true })}
                defaultValue=''
              >
                <option value='' disabled>
                  --Please choose an option--
                </option>
                {stores?.map((item: Store) => (
                  <option key={item.id} value={item.id}>
                    {item.description}
                  </option>
                ))}
              </select>
              {errors.targetVirtualStore && (
                <span className='block text-sm text-red-600'>This field is required</span>
              )}
            </div>
            <div className='block '>
              <label className='mr-2 text-black-200 text-sm  ' htmlFor='purpose'>
                purpose
              </label>
              <select
                className='py-1 pl-3 pr-10 rounded-md bg-white  text-base shadow-lg ring-1 ring-black ring-opacity-5'
                id='purpose'
                {...register('purpose', { required: true })}
                defaultValue=''
              >
                <option value='' disabled>
                  --Please choose an option--
                </option>
                {purposes?.map((item: Purpose) => (
                  <option key={item.id} value={item.id}>
                    {item.description}
                  </option>
                ))}
              </select>
              {errors.purpose && (
                <span className='block text-sm text-red-600'>This field is required</span>
              )}
            </div>
          </div>
          <div className='mt-4 grid grid-cols-1 gap-0 md:grid-cols-3 md:gap-4 '>
            <div className='block '>
              <label className='mr-2 text-black-200 text-sm  ' htmlFor='documentType'>
                documentType
              </label>
              <select
                className='py-1 pl-3 pr-10 rounded-md bg-white  text-base shadow-lg ring-1 ring-black ring-opacity-5'
                id='documentType'
                {...register('documentType', { required: true })}
                defaultValue=''
              >
                <option value='' disabled>
                  --Please choose an option--
                </option>
                {documentTypes?.map((item: DocumentType) => (
                  <option key={item.id} value={item.id}>
                    {item.description}
                  </option>
                ))}
              </select>
              {errors.documentType && (
                <span className='block text-sm text-red-600'>This field is required</span>
              )}
            </div>
            <div className='block '>
              <label className='mr-2 text-black-200 text-sm  ' htmlFor='documentNumber'>
                documentNumber
              </label>
              <input
                className='py-1 pl-3 pr-10 rounded-md bg-white  text-base shadow-lg ring-1 ring-black ring-opacity-5'
                defaultValue='test'
                {...register('documentNumber', { required: true })}
              />
              {errors.documentNumber && (
                <span className='block text-sm text-red-600'>This field is required</span>
              )}
            </div>
            <div className='block '>
              <label className='mr-2 text-black-200 text-sm  ' htmlFor='documentDate'>
                documentDate
              </label>
              <input
                className='py-1 pl-3 pr-10 rounded-md bg-white  text-base shadow-lg ring-1 ring-black ring-opacity-5'
                type='date'
                {...register('documentDate', { required: true })}
                defaultValue={format(new Date(), 'yyyy-MM-dd')}
              />
              {errors.documentDate && (
                <span className='block text-sm text-red-600'>This field is required</span>
              )}
            </div>
            <div className='block '>
              <label className='mr-2 text-black-200 text-sm  ' htmlFor='reference'>
                reference
              </label>
              <input
                className='py-1 pl-3 pr-10 rounded-md bg-white  text-base shadow-lg ring-1 ring-black ring-opacity-5'
                defaultValue=''
                {...register('reference')}
              />
              {errors.reference && (
                <span className='block text-sm text-red-600'>This field is required</span>
              )}
            </div>
            <div className='block '>
              <label className='mr-2 text-black-200 text-sm  ' htmlFor='receptionDate'>
                receptionDate
              </label>
              <input
                className='py-1 pl-3 pr-10 rounded-md bg-white  text-base shadow-lg ring-1 ring-black ring-opacity-5'
                type='date'
                {...register('receptionDate', { required: true })}
                defaultValue={format(new Date(), 'yyyy-MM-dd')}
              />
              {errors.receptionDate && (
                <span className='block text-sm text-red-600'>This field is required</span>
              )}
            </div>
          </div>
          <div className='w-full my-4'>
            <table className='w-full table-auto border-collapse border border-slate-300'>
              <thead className='bg-indigo-400 text-white'>
                <tr>
                  <th className='border-collapse border border-slate-300'>Medicamento/Insumo</th>
                  <th className='border-collapse border border-slate-300'>Codigo</th>
                  {!isSale && (
                    <>
                      <th className='border-collapse border border-slate-300'>Fecha Vencimiento</th>
                      <th className='border-collapse border border-slate-300'>Lote</th>
                    </>
                  )}
                  <th className='border-collapse border border-slate-300'>Cantidad</th>
                  <th className='border-collapse border border-slate-300'>Precio</th>
                  <th className='border-collapse border border-slate-300'>Importe</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {fields.map((item, index) => {
                  return (
                    <tr key={index} className='even:bg-amber-100 odd:bg-blue-100'>
                      <td className='border-collapse border border-slate-300'>
                        {item.description}
                      </td>
                      <td className='border-collapse border border-slate-300'>
                        {item.productCode}
                      </td>
                      {!isSale && (
                        <>
                          <td className='border-collapse border border-slate-300'>
                            <input
                              key={item.id}
                              type='date'
                              {...register(`items.${index}.dueDate`, { required: true })}
                            />
                            {errors?.items?.[index]?.dueDate && (
                              <span className='block text-sm text-red-600'>
                                This field is required
                              </span>
                            )}
                          </td>
                          <td className='border-collapse border border-slate-300'>
                            <input
                              key={item.id}
                              {...register(`items.${index}.lote`, { required: true })}
                            />
                            {errors?.items?.[index]?.lote && (
                              <span className='block text-sm text-red-600'>
                                This field is required
                              </span>
                            )}
                          </td>
                        </>
                      )}
                      <td className='border-collapse border border-slate-300'>
                        <input
                          key={item.id}
                          {...register(`items.${index}.amount`, { required: true, min: 1 })}
                        />
                        {errors?.items?.[index]?.amount && (
                          <span className='block text-sm text-red-600'>This field is required</span>
                        )}
                      </td>
                      <td className='border-collapse border border-slate-300'>
                        <input
                          key={item.id}
                          {...register(`items.${index}.price`, { required: true, min: 0.1 })}
                        />
                        {errors?.items?.[index]?.price && (
                          <span className='block text-sm text-red-600'>This field is required</span>
                        )}
                      </td>
                      <td className='border-collapse border border-slate-300'>
                        {(items[index].price * items[index].amount).toFixed(2)}
                      </td>
                      <td>
                        <button
                          onClick={() => remove(index)}
                          className='cursor-pointer rounded-md text-red-900 py-2 px-4 text-center text-sm   shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {errors.items?.length === 0 && (
              <span className='block text-sm text-red-600'>Faltan agregar items</span>
            )}
          </div>
          <button
            type='submit'
            disabled={items.length === 0}
            className='cursor-pointer rounded-md bg-blue-800 py-2 px-4 text-center text-white shadow-sm ring-1 ring-inset ring-gray-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          >
            Submit
          </button>
        </form>
      </div>

      <ProductSearch addKardexItem={addKardexItem} />
    </section>
  )
}

const ProductSearch = ({ addKardexItem }: { addKardexItem: (product: Product) => void }) => {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    async function getData() {
      const productResponse = await getProducts()
      setProducts(productResponse.data)
    }
    getData()
  }, [])

  const { register, watch, reset } = useForm<KardexFormData>()

  useEffect(() => {
    let timerHandler: NodeJS.Timeout
    async function getData(value: any) {
      const productResponse = await getProducts(value)
      setProducts(productResponse.data)
    }

    const subscription = watch((value, { name, type }) => {
      console.log(value, name, type)
      if (timerHandler) {
        clearTimeout(timerHandler)
      }
      timerHandler = setTimeout(() => {
        getData(value)
      }, 300)
    })

    return () => {
      clearTimeout(timerHandler)
      subscription.unsubscribe()
    }
  }, [watch])

  return (
    <section className='p-4 border-2 border-green-600 mt-4    '>
      <h3>Product search</h3>
      <div className='mt-4 grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-4 '>
        <div className='block '>
          <label className='mr-2 text-black-200 text-sm  ' htmlFor='barCode'>
            barCode
          </label>
          <input
            className='w-full py-1 pl-3 pr-10 rounded-md bg-white  text-base shadow-lg ring-1 ring-black ring-opacity-5'
            {...register('barCode')}
          />
        </div>

        <div className='block '>
          <label className='mr-2 text-black-200 text-sm  ' htmlFor='sigaCode'>
            sigaCode
          </label>
          <input
            className='w-full py-1 pl-3 pr-10 rounded-md bg-white  text-base shadow-lg ring-1 ring-black ring-opacity-5'
            {...register('sigaCode')}
          />
        </div>

        <div className='block '>
          <label className='mr-2 text-black-200 text-sm  ' htmlFor='productCode'>
            productCode
          </label>
          <input
            className='w-full py-1 pl-3 pr-10 rounded-md bg-white  text-base shadow-lg ring-1 ring-black ring-opacity-5'
            {...register('productCode')}
          />
        </div>
      </div>

      <div className='block mb-4'>
        <label className='mr-2 text-black-200 text-sm  ' htmlFor='description'>
          description
        </label>
        <input
          className='w-full py-1 pl-3 pr-10 rounded-md bg-white  text-base shadow-lg ring-1 ring-black ring-opacity-5'
          {...register('description')}
        />
      </div>
      <TableContainer component={Paper} sx={{ minWidth: 500, maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align='left'>Descripcion</TableCell>
              <TableCell align='left'>Precio</TableCell>
              <TableCell align='left'>Stock</TableCell>
              <TableCell> </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map(product => (
              <TableRow key={product.id}>
                <TableCell component='th' scope='product'>
                  {product.description}
                </TableCell>
                <TableCell component='th' scope='product'>
                  {product.price.toFixed(2)}
                </TableCell>
                <TableCell style={{ width: 160 }} align='right'>
                  {product.amount}
                </TableCell>
                <TableCell style={{ width: 160 }} align='right'>
                  <button
                    onClick={() => addKardexItem(product)}
                    className='cursor-pointer rounded-md bg-green-800 py-1 px-3 text-center text-white shadow-sm text-sm'
                  >
                    +
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </section>
  )
}
