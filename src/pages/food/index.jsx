import Taro, { useRouter } from '@tarojs/taro'
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { View, ScrollView } from '@tarojs/components'
import ajax from '@/src/api'
import { H5, WEAPP } from '@/src/config/base'
import { actionGetBatchFilter } from '@/src/redux/actions/filterShop'

import Categories from '@/src/components/Categories/Categories'
import FilterShops from '@/src/components/FilterShops/FilterShops'
import Shop from '@/src/components/Shop/Shop'
import Loading from '@/src/components/Loading/Loading'
import BackButton from '@/src/components/BackButton/BackButton'

import './index.scss'

const Food = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const currentAddress = useSelector(state => state.currentAddress)
  // 用户token
  const token = useSelector(state => state.token)
  // 商家列表请求参数
  const shopParams = useSelector(state => state.shopParams)
  // 筛选条数据
  const batchFilter = useSelector(state => state.batchFilter)
  // 微信 滚动/禁止滚动
  const [weiScroll, setWeiScroll] = useState(true)
  // 头部分类数据
  const [foodsPage, setFoodsPage] = useState([])
  // 当前选择的分类
  const [activeFoodPage, setActiveFoodPage] = useState({})
  // 更多分类数据
  const [foodsClass, setFoodsClass] = useState([])
  // 商家列表
  const [shopList, setShopList] = useState([])
  // 请求条初始区间 + linmit
  const [offset, setOffset] = useState(0)
  // 节流
  const [bottomFlag, setBottomFlag] = useState(true)
  // 筛选ref
  const clearRef = useRef()
  // 复位距离
  const [scTop, setscTop] = useState(0)
  // 是否还有更多
  const [isMore, setIsMore] = useState(true)

  // 用户是否登录,是否有收货地址,是否加载商家筛选条
  const isLogin = useMemo(() => {
    return token && batchFilter.sort.length > 0 && currentAddress.latitude
  }, [token, batchFilter, currentAddress])

  // 获取头部page,更多class 数据
  useEffect(() => {
    const { latitude, longitude } = currentAddress
    const { params } = router
    if (latitude && longitude) {
      Promise.all([
        ajax.reqGetFoodsPage({ latitude, longitude, entry_id: params.id }),
        ajax.reqGetFoodsClass({ latitude, longitude }),
      ]).then(resArr => {
        const [resFoodsPages, resFoodsClass] = resArr
        const [foodsPagesErr, foodsPagesData] = resFoodsPages
        const [foodsClassErr, foodsClassData] = resFoodsClass

        if (foodsPagesErr || foodsClassErr) {
          if (foodsPagesErr.name === '401' || foodsClassErr.name === '401') {
            Taro.showToast({ title: '请先登录', icon: 'none', duration: 1500 })
            setTimeout(() => {
              Taro.redirectTo({ url: '/pages/msite/index' })
            }, 1500)

            return
          }
          return
        }

        if (foodsPagesData.code === 0) {
          setFoodsPage(foodsPagesData.data)
          setActiveFoodPage(foodsPagesData.data[0])
        }

        if (foodsClassData.code === 0) {
          const newData = foodsClassData.data.filter(item => item.id)
          setFoodsClass(newData)
        }
      })
    }
  }, [currentAddress, router])

  // 修改当前快捷导航选中分类
  const onfoodPage = food => {
    setActiveFoodPage(food)
  }

  // 修改当前快捷导航数据
  const onSetFoodsPage = (activeClassContent, item) => {
    setFoodsPage(activeClassContent)
    setActiveFoodPage(item)
  }

  // 获取商家列表
  useEffect(() => {
    if (isLogin && isMore) {
      ajax
        .reqGetMsiteShopList({
          latitude: currentAddress.latitude,
          longitude: currentAddress.longitude,
          ...shopParams,
          offset,
          id: activeFoodPage && activeFoodPage.id,
        })
        .then(([err, result]) => {
          if (err) {
            console.log(err)
            return
          }

          if (result.code === 0) {
            if (offset === 0) {
              setShopList(result.data)
            } else {
              if (result.data.length) {
                setShopList(data => [...data, ...result.data])
              } else {
                // Taro.showToast({ title: '没有更多了', icon: 'none' })
                setIsMore(false)
              }
            }
            setBottomFlag(true)
          } else {
            console.log(result)
          }
        })
    }
  }, [isLogin, shopParams, currentAddress, offset, activeFoodPage, isMore])

  // 滚动到底部加载更多商家列表
  const scrolltolower = useCallback(() => {
    if (bottomFlag && isLogin) {
      setOffset(num => {
        return num + shopParams.limit
      })
      setBottomFlag(false)
    }
  }, [isLogin, bottomFlag, shopParams])

  // 清空offset
  const removeOffset = () => {
    setOffset(0)
    setIsMore(true)
    setscTop(num => {
      if (num === 0) {
        return 0.1
      } else {
        return 0
      }
    })
  }

  // 获取首页筛选条数据
  useEffect(() => {
    dispatch(actionGetBatchFilter())
  }, [dispatch])

  // 禁止滚动
  const weSetScroll = flag => {
    if (H5) {
      const body = document.querySelector('.food')
      if (flag) {
        body.style.overflowY = 'scroll'
      } else {
        body.style.overflowY = 'hidden'
      }
    }

    if (WEAPP) {
      setWeiScroll(flag)
    }
  }

  // 关闭筛选层
  const filterClear = () => {
    const { onClear } = clearRef.current
    onClear()
  }

  // 跳转首页
  const backMsite = () => {
    Taro.redirectTo({ url: '/pages/msite/index' })
  }

  return (
    <View className='food'>
      <View className='food-topbar'>
        {foodsPage.length > 0 && foodsClass.length > 0 && (
          <Categories
            foodsPage={foodsPage}
            foodsClass={foodsClass}
            onfoodPage={onfoodPage}
            activeFoodPage={activeFoodPage}
            onSetFoodsPage={onSetFoodsPage}
            onRemoveOffset={removeOffset}
            onFilterClear={filterClear}
          />
        )}
        {batchFilter.filter.serve.main.length > 0 && (
          <FilterShops
            ref={clearRef}
            batchFilter={batchFilter}
            weSetScroll={weSetScroll}
            onRemoveOffset={removeOffset}
          />
        )}
      </View>
      <ScrollView
        className='food-shoplist'
        scrollY={weiScroll}
        lowerThreshold={150}
        onScrollToLower={scrolltolower}
        scrollTop={scTop}
      >
        {shopList.map(shop => {
          return <Shop key={shop.restaurant.id} restaurant={shop.restaurant} />
        })}
        {!isMore && <Loading title='没有更多了...'></Loading>}
      </ScrollView>

      {H5 && (
        <BackButton
          renderIcon={<View className='icon icon-daohangshouye'></View>}
          onLink={backMsite}
        />
      )}
    </View>
  )
}

export default Food
