import React, { useState } from 'react'
import { View, Image } from '@tarojs/components'
import imgUrl from '@/src/utils/imgUrl'

import './NavSwiper.scss'

const oss = '?x-oss-process=image/format,webp/resize,w_90,h_90,m_fixed'

const NavSwiper = ({ navList, onGoFood }) => {
  const [framework] = useState(Array(10).fill(1))

  return (
    <View className='navswiper'>
      {navList.length ? (
        // 导航
        <View className='navswiper-main'>
          {navList &&
            navList.map(navItem => {
              return (
                <View className='navswiper-main-item' key={navItem.id}>
                  <View onClick={() => onGoFood(navItem)}>
                    <View className='navswiper-main-item-image'>
                      <Image
                        className='nav-image'
                        src={imgUrl(navItem.image_hash) + oss}
                      ></Image>
                    </View>
                    <View className='navswiper-main-item-title'>
                      {navItem.name}
                    </View>
                  </View>
                </View>
              )
            })}
        </View>
      ) : (
        // 骨架
        <View className='framework'>
          {framework.map((item, i) => {
            return (
              <View className='framework-item' key={i}>
                <View className='framework-item-title'></View>
                <View className='framework-item-txt'></View>
              </View>
            )
          })}
        </View>
      )}
    </View>
  )
}
NavSwiper.defaultProps = {
  navList: [],
}

export default NavSwiper
