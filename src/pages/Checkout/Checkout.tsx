import { useMutation, useQuery } from '@tanstack/react-query'
import { useContext, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import purchaseApi from 'src/apis/purchase.api'
import { purchasesStatus } from 'src/constants/purchase'
import { cities, districtsByCity, wardsByDistrict } from 'src/constants/address'
import { validCoupons, validateCoupon, getDiscountAmount } from 'src/constants/coupon'
import { AppContext } from 'src/contexts/app.context'
import { formatCurrency, generateNameId } from 'src/utils/utils'
import path from 'src/constants/path'
import QuantityController from 'src/components/QuantityController'
import produce from 'immer'
import { Purchase } from 'src/types/purchase.type'
import { toast } from 'react-toastify'

type PaymentMethod = 'cod' | 'bank_transfer'

interface Address {
  name: string
  phone: string
  address: string
  city: string
  district: string
  ward: string
}

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

  if (checkedPurchases.length === 0) {
    return <Navigate to={path.home} replace />
  }

  const navigate = useNavigate()

  const [showAddressForm, setShowAddressForm] = useState(false)
  const [address, setAddress] = useState<Address>({
    name: 'Võ Văn Hiệp',
    phone: '+84 379 015 316',
    address: 'Số 280, Nguyễn Hữu Thọ',
    city: 'Đà Nẵng',
    district: 'Cẩm Lệ',
    ward: 'Khuê Trung'
  })
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [couponError, setCouponError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')

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

  const handleApplyCoupon = () => {
    setCouponError('')
    if (!couponCode.trim()) {
      setCouponError('Vui lòng nhập mã giảm giá')
      return
    }
    const discount = validateCoupon(couponCode)
    if (discount) {
      setAppliedCoupon(couponCode.toUpperCase())
      toast.success(`Đã áp dụng mã giảm giá ${couponCode.toUpperCase()} -${discount}%`, {
        position: 'top-center',
        autoClose: 2000
      })
    } else {
      setCouponError('Mã giảm giá không hợp lệ')
    }
  }

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0
    return getDiscountAmount(totalProductFee, appliedCoupon)
  }, [appliedCoupon, totalProductFee])

  const formatAddress = () => {
    return `${address.address}, Phường ${address.ward}, Quận ${address.district}, ${address.city}`
  }

  return (
    <div className='mx-auto max-w-6xl space-y-5 border-t-4 border-[#ee4d2d] bg-gray-100 p-6'>
      {/* ADDRESS */}
      <section className='rounded-md bg-white p-5 shadow-sm'>
        <h3 className='mb-3 text-lg font-semibold text-[#ee4d2d]'>Địa Chỉ Nhận Hàng</h3>

        <div className='flex flex-col gap-1 text-sm'>
          <div className='flex items-center gap-3'>
            <strong>{address.name} ({address.phone})</strong>
            <button
              className='font-medium text-[#ee4d2d] hover:underline'
              onClick={() => setShowAddressForm(true)}
            >
              Thay đổi
            </button>
          </div>
          <span className='text-gray-600'>{formatAddress()}</span>
        </div>

        {showAddressForm && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
            <div className='mx-4 w-full max-w-lg rounded-md bg-white p-6 shadow-lg'>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-lg font-semibold'>Thay đổi địa chỉ</h3>
                <button
                  onClick={() => setShowAddressForm(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='h-6 w-6'>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>
              <div className='space-y-3 text-sm'>
                <div className='grid grid-cols-2 gap-3'>
                  <input
                    type='text'
                    placeholder='Họ và tên'
                    className='w-full rounded border border-gray-300 p-3 outline-none focus:border-gray-500'
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                  />
                  <input
                    type='text'
                    placeholder='Số điện thoại'
                    className='w-full rounded border border-gray-300 p-3 outline-none focus:border-gray-500'
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  />
                </div>
                <input
                  type='text'
                  placeholder='Địa chỉ cụ thể (số nhà, đường)'
                  className='w-full rounded border border-gray-300 p-3 outline-none focus:border-gray-500'
                  value={address.address}
                  onChange={(e) => setAddress({ ...address, address: e.target.value })}
                />
                <div className='grid grid-cols-3 gap-3'>
                  <select
                    className='w-full rounded border border-gray-300 p-3 outline-none focus:border-gray-500'
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value, district: '', ward: '' })}
                  >
                    <option value=''>Chọn Tỉnh/TP</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <select
                    className='w-full rounded border border-gray-300 p-3 outline-none focus:border-gray-500'
                    value={address.district}
                    onChange={(e) => setAddress({ ...address, district: e.target.value, ward: '' })}
                    disabled={!address.city}
                  >
                    <option value=''>Chọn Quận/Huyện</option>
                    {address.city && districtsByCity[address.city]?.map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                  <select
                    className='w-full rounded border border-gray-300 p-3 outline-none focus:border-gray-500'
                    value={address.ward}
                    onChange={(e) => setAddress({ ...address, ward: e.target.value })}
                    disabled={!address.district}
                  >
                    <option value=''>Chọn Phường/Xã</option>
                    {address.district && wardsByDistrict[address.district]?.map((ward) => (
                      <option key={ward} value={ward}>{ward}</option>
                    ))}
                  </select>
                </div>
                <div className='flex gap-2 pt-2'>
                  <button
                    className='rounded bg-[#ee4d2d] px-4 py-2 text-white'
                    onClick={() => setShowAddressForm(false)}
                  >
                    Lưu
                  </button>
                  <button
                    className='rounded border border-gray-300 px-4 py-2 hover:bg-gray-50'
                    onClick={() => setShowAddressForm(false)}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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

          {/* Coupon */}
          <div className='border-orange-200 flex flex-col gap-2 border-t border-dashed pt-3 text-sm'>
            <div className='flex items-center gap-3'>
              <input
                type='text'
                placeholder='Nhập mã giảm giá'
                className='w-48 rounded border border-gray-300 p-2 text-sm outline-none focus:border-gray-500'
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button
                className='rounded border border-[#ee4d2d] px-4 py-2 text-[#ee4d2d] hover:bg-orange-50'
                onClick={handleApplyCoupon}
              >
                Áp dụng
              </button>
            </div>
            {couponError && <span className='text-red-500 text-sm'>{couponError}</span>}
            {appliedCoupon && (
              <span className='text-green-600 text-sm'>
                ✓ Đã áp dụng mã {appliedCoupon} - Giảm {formatCurrency(discountAmount)}đ
              </span>
            )}
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
              {formatCurrency(totalProductFee + shippingFee - discountAmount)}₫
            </strong>
          </div>
        </section>
      )}

      {/* PAYMENT */}
      <section className='space-y-4 rounded-md bg-white p-5 shadow-sm'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Phương thức thanh toán</h3>
        </div>

        <div className='space-y-2'>
          <label className='flex cursor-pointer items-center gap-2 rounded border border-[#ee4d2d] p-3'>
            <input
              type='radio'
              name='payment'
              checked={paymentMethod === 'cod'}
              onChange={() => setPaymentMethod('cod')}
              className='accent-[#ee4d2d]'
            />
            <span>Thanh toán khi nhận hàng (COD)</span>
          </label>
          <label className='flex cursor-pointer items-center gap-2 rounded border border-gray-300 p-3 hover:border-[#ee4d2d]'>
            <input
              type='radio'
              name='payment'
              checked={paymentMethod === 'bank_transfer'}
              onChange={() => setPaymentMethod('bank_transfer')}
              className='accent-[#ee4d2d]'
            />
            <span>Chuyển khoản ngân hàng</span>
          </label>
        </div>

        <div className='space-y-2 text-sm'>
          <div className='border-b border-dashed border-gray-200 pb-2'>
            <span className='text-gray-600'>Sản phẩm ({checkedPurchases.length})</span>
          </div>
          {checkedPurchases.map((purchase) => (
            <div key={purchase._id} className='flex justify-between py-1'>
              <div className='flex items-center gap-2'>
                <img src={purchase.product.image} alt={purchase.product.name} className='h-10 w-10 object-cover' />
                <span className='line-clamp-1 max-w-[200px]'>{purchase.product.name}</span>
                <span className='text-gray-500'>x{purchase.buy_count}</span>
              </div>
              <span className='text-[#ee4d2d]'>
                ₫{formatCurrency(purchase.product.price * purchase.buy_count)}
              </span>
            </div>
          ))}

          <div className='flex justify-between'>
            <span>Tổng tiền hàng</span>
            {formatCurrency(totalProductFee)}₫
          </div>

          <div className='flex justify-between'>
            <span>Phí vận chuyển</span>
            <span>{shippingFee.toLocaleString()}đ</span>
          </div>

          {appliedCoupon && (
            <div className='flex justify-between text-green-600'>
              <span>Giảm giá ({appliedCoupon})</span>
              <span>-{formatCurrency(discountAmount)}đ</span>
            </div>
          )}

          <div className='flex justify-between border-t pt-2 text-base font-semibold'>
            <span>Tổng thanh toán</span>
            <span>{formatCurrency(totalProductFee + shippingFee - discountAmount)}₫</span>
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
