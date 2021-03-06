import Taro from '@tarojs/taro'
import ajax from '@/src/api'
import {
  USERADDRESS,
  SETUSERADDRESS,
  REMOVEUSERADDRESS,
  GETUSERADDRESSLIST,
  SETTOKEN,
  REMOVETOKEN,
  CURRENTADDRESS,
} from '../action-types'
// 设置token
export const setToken = token => {
  token = `Bearer ${token}`
  Taro.setStorageSync('token', token)
  return { type: SETTOKEN, payload: token }
}

// 删除token
export const removeToken = () => {
  Taro.removeStorageSync('token')
  return { type: REMOVETOKEN }
}

// 设置地址信息
export const setCurrentAddress = address => ({
  type: CURRENTADDRESS,
  payload: address,
})

// 初始化ip定位地址
export const initCurrentAddress = () => {
  return async dispatch => {
    const [err, result] = await ajax.reqIpAddress()

    if (err) {
      console.log(err)
      return
    }

    if (result.code === 0) {
      const { city, latitude, longitude, recommend } = result.data
      // 保存地址到redux
      dispatch(
        setCurrentAddress({
          city,
          address: recommend,
          latitude,
          longitude,
        })
      )
    } else {
      // console.log(result)
    }
  }
}

// 编辑用户收货地址
export const atUserAddress = userAddress => ({
  type: USERADDRESS,
  payload: userAddress,
})

// 修改用户收货地址
export const setAtUserAddress = userAddress => ({
  type: SETUSERADDRESS,
  payload: userAddress,
})

// 清空用户收货地址
export const removeUserAddress = () => ({ type: REMOVEUSERADDRESS })

// 获取用户收货地址列表
const getUserAddressListSync = userAddressList => ({
  type: GETUSERADDRESSLIST,
  payload: userAddressList,
})
export const getUserAddressList = () => {
  return async dispatch => {
    const [err, result] = await ajax.reqUserAddress()

    if (err) {
      if (err.name === '401') {
        dispatch(removeToken())
        return
      }
      return
    }

    if (result.code === 0) {
      dispatch(getUserAddressListSync(result.data))
    } else {
      // console.log(result)
    }
  }
}
