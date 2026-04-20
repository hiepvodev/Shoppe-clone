import { useMutation, useQuery } from '@tanstack/react-query'
import { useContext, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import purchaseApi from 'src/apis/purchase.api'
import { purchasesStatus } from 'src/constants/purchase'
import { AppContext } from 'src/contexts/app.context'
import { formatCurrency, generateNameId } from 'src/utils/utils'
import path from 'src/constants/path'
import QuantityController from 'src/components/QuantityController'
import produce from 'immer'
import { Purchase } from 'src/types/purchase.type'
import { toast } from 'react-toastify'

export default function Checkout() {
  const { extendedPurchases, setExtendedPurchases } = useContext(AppContext)
  const { data: purchasesInCartData, refetch } = useQuery({
    queryKey: ['purchases', { status: purchasesStatus.inCart }],
    queryFn: () => purchaseApi.getPurchases({ status: purchasesStatus.inCart })
  })
  const purchasesInCart = purchasesInCartData?.data.data
  const shippingFee = 30000
  const totalProductFee = extendedPurchases.reduce((acc, purchase) => {
    return acc + purchase.product.price * purchase.buy_count
  }
  , 0)
  const checkedPurchases = useMemo(() => extendedPurchases.filter((purchase) => purchase.checked), [extendedPurchases])
  const navigate = useNavigate()

  const handleQuantity = (purchaseIndex: number, value: number, enable: boolean) => {
    if (enable) {
      const purchase = extendedPurchases[purchaseIndex]
      setExtendedPurchases(
        produce((draft) => {
          draft[purchaseIndex].buy_count = value
        })
      )
      updatePurchaseMutation.mutate({ product_id: purchase.product._id, buy_count: value })
    }
  }

  const updatePurchaseMutation = useMutation({
    mutationFn: purchaseApi.updatePurchase,
    onSuccess: () => {
      refetch()
    }
  })

  const handleTypeQuantity = (purchaseIndex: number) => (value: number) => {
    setExtendedPurchases(
      produce((draft) => {
        draft[purchaseIndex].buy_count = value
      })
    )
  }

  const handleBuyPurchases = () => {
    if (checkedPurchases.length > 0) {
      const body = checkedPurchases.map((purchase) => ({
        product_id: purchase.product._id,
        buy_count: purchase.buy_count
      }))
      buyProductsMutation.mutate(body)
      setTimeout(() => {
        navigate({pathname: path.home})
      }, 3000)
    }
  }

  const buyProductsMutation = useMutation({
    mutationFn: purchaseApi.buyProducts,
    onSuccess: (data) => {
      refetch()
      toast.success(data.data.message, {
        position: 'top-center',
        autoClose: 1000
      })
    }
  })

  console.log("purchasesInCartData:", purchasesInCartData)
  return (
    <div className='mx-auto max-w-6xl space-y-5 border-t-4 border-[#ee4d2d] bg-gray-100 p-6'>
      {/* ADDRESS */}
      <section className='rounded-md bg-white p-5 shadow-sm'>
        <h3 className='mb-3 text-lg font-semibold text-[#ee4d2d]'>Địa Chỉ Nhận Hàng</h3>

        <div className='flex flex-col gap-1 text-sm'>
          <div className='flex items-center gap-3'>
            <strong>Võ Văn Hiệp (+84) 379 015 316</strong>
            <button className='font-medium text-[#ee4d2d] hover:underline'>Thay đổi</button>
          </div>

          <span className='text-gray-600'>Số 280, Nguyễn Hữu Thọ, Phường Khuê Trung, Quận Cẩm Lệ, Đà Nẵng</span>
        </div>
      </section>
      {/* PRODUCT */}
      {extendedPurchases.length > 0 && (
        <section className='space-y-4 rounded-md bg-white p-5 shadow-sm'>
          <h3 className='text-lg font-semibold'>Sản phẩm</h3>
          {extendedPurchases.map((purchase, index) => (
            <div className='grid grid-cols-12 items-center gap-4 text-sm'>
              {/* Image */}
              <Link
                className='h-20 w-20 flex-shrink-0'
                to={`${path.home}${generateNameId({
                  name: purchase.product.name,
                  id: purchase.product._id
                })}`}
              >
                <img alt={purchase.product.name} src={purchase.product.image} />
              </Link>

              {/* Info */}
              <div className='col-span-4'>
                <Link
                  to={`${path.home}${generateNameId({
                    name: purchase.product.name,
                    id: purchase.product._id
                  })}`}
                  className='line-clamp-2 text-left'
                >
                  {purchase.product.name}
                </Link>
              </div>

              {/* Price */}
              <div className='col-span-2'>
                <div className='flex items-center justify-center'>
                  <span className='text-gray-300 line-through'>
                    ₫{formatCurrency(purchase.product.price_before_discount)}
                  </span>
                  <span className='ml-3'>₫{formatCurrency(purchase.product.price)}</span>
                </div>
              </div>

              {/* Quantity */}
              <div className='col-span-2 flex w-fit items-center rounded border'>
                <QuantityController
                  max={purchase.product.quantity}
                  value={purchase.buy_count}
                  classNameWrapper='flex items-center'
                  onIncrease={(value) => handleQuantity(index, value, value <= purchase.product.quantity)}
                  onDecrease={(value) => handleQuantity(index, value, value >= 1)}
                  onType={handleTypeQuantity(index)}
                  onFocusOut={(value) =>
                    handleQuantity(
                      index,
                      value,
                      value >= 1 &&
                        value <= purchase.product.quantity &&
                        value !== (purchasesInCart as Purchase[])[index].buy_count
                    )
                  }
                  disabled={purchase.disabled}
                />
              </div>

              {/* Subtotal */}
              <div className='col-span-2 text-right font-semibold text-[#ee4d2d]'>
                ₫{formatCurrency(purchase.product.price * purchase.buy_count)}đ
              </div>
            </div>
          ))}

          {/* Voucher */}
          <div className='border-orange-200 flex justify-between border-t border-dashed pt-3 text-sm'>
            <span>Voucher của Shop</span>
            <button className='font-medium text-[#ee4d2d] hover:underline'>Chọn Voucher</button>
          </div>

          {/* Shipping */}
          <div className='flex justify-between text-sm'>
            <span>Phương thức vận chuyển</span>
            <div className='flex gap-4'>
              <span className='font-medium'>Hàng Cồng Kềnh</span>
              <span className='font-semibold'>{shippingFee.toLocaleString()}đ</span>
            </div>
          </div>

          {/* Total */}
          <div className='flex justify-end gap-2 text-sm'>
            <span>Tổng số tiền:</span>
            <strong className='text-base text-[#ee4d2d]'>
              {formatCurrency(totalProductFee + shippingFee)}₫
            </strong>
          </div>
        </section>
      )}

      {/* PAYMENT */}
      <section className='space-y-4 rounded-md bg-white p-5 shadow-sm'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Phương thức thanh toán</h3>
          <button className='font-medium text-[#ee4d2d] hover:underline'>Thay đổi</button>
        </div>

        <div className='space-y-2 text-sm'>
          <div className='flex justify-between'>
            <span>Tổng tiền hàng</span>
            {formatCurrency(totalProductFee)}₫
          </div>

          <div className='flex justify-between'>
            <span>Phí vận chuyển</span>
            <span>{shippingFee.toLocaleString()}đ</span>
          </div>

          <div className='flex justify-between border-t pt-2 text-base font-semibold'>
            <span>Tổng thanh toán</span>
            <span>{formatCurrency(totalProductFee + shippingFee)}₫</span>
          </div>
        </div>

        <div className='flex justify-end'>
          <button
            className='rounded bg-[#ee4d2d] 
            px-8 py-3 text-white shadow-sm transition hover:bg-[#d8432a]'
            onClick={handleBuyPurchases}
            disabled={buyProductsMutation.isLoading}
          >
            Đặt hàng
          </button>
        </div>
      </section>
    </div>
  )
}
