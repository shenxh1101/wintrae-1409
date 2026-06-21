import type { Question } from '../types'

export const worldQuestions: Question[] = [
  {
    id: 'wd-001',
    mapType: 'world',
    difficulty: 'easy',
    type: 'continent',
    targetId: 'asia',
    prompt: '请点击亚洲的位置',
    explanation: '亚洲是世界上面积最大、人口最多的大洲，中国就位于亚洲东部。',
    hints: ['它是世界上最大的洲', '中国就在这个大洲上', '它位于东半球和北半球']
  },
  {
    id: 'wd-002',
    mapType: 'world',
    difficulty: 'easy',
    type: 'continent',
    targetId: 'africa',
    prompt: '请点击非洲的位置',
    explanation: '非洲是世界第二大洲，有广阔的热带草原和丰富的野生动物资源。',
    hints: ['它的形状像一个倒三角形', '它在亚洲的西南边', '那里有撒哈拉沙漠']
  },
  {
    id: 'wd-003',
    mapType: 'world',
    difficulty: 'easy',
    type: 'continent',
    targetId: 'north-america',
    prompt: '请点击北美洲的位置',
    explanation: '北美洲位于西半球北部，有美国、加拿大等国家。',
    hints: ['它位于西半球', '它在南美洲的北边', '美国和加拿大都在这个洲']
  },
  {
    id: 'wd-004',
    mapType: 'world',
    difficulty: 'easy',
    type: 'continent',
    targetId: 'south-america',
    prompt: '请点击南美洲的位置',
    explanation: '南美洲位于西半球南部，有世界最大的热带雨林——亚马逊雨林。',
    hints: ['它位于西半球的南部', '它的形状像一个倒三角形', '那里有亚马逊雨林']
  },
  {
    id: 'wd-005',
    mapType: 'world',
    difficulty: 'easy',
    type: 'continent',
    targetId: 'europe',
    prompt: '请点击欧洲的位置',
    explanation: '欧洲位于亚洲的西边，是世界上发达国家最多的大洲。',
    hints: ['它在亚洲的西边', '它的面积不大但国家很多', '英国、法国、德国都在这里']
  },
  {
    id: 'wd-006',
    mapType: 'world',
    difficulty: 'easy',
    type: 'continent',
    targetId: 'oceania',
    prompt: '请点击大洋洲的位置',
    explanation: '大洋洲是世界上最小的一个大洲，澳大利亚是大洋洲最大的国家。',
    hints: ['它是面积最小的大洲', '它主要在南半球', '澳大利亚是这个洲最大的国家']
  },
  {
    id: 'wd-007',
    mapType: 'world',
    difficulty: 'medium',
    type: 'continent',
    targetId: 'antarctica',
    prompt: '请点击南极洲的位置',
    explanation: '南极洲位于地球最南端，是世界上最寒冷的大陆，常年被冰雪覆盖。',
    hints: ['它在地球的最南边', '它是世界上最冷的大陆', '那里有很多企鹅']
  },
  {
    id: 'wd-008',
    mapType: 'world',
    difficulty: 'medium',
    type: 'direction',
    targetId: 'pacific',
    prompt: '请点击太平洋的位置',
    explanation: '太平洋是世界上最大、最深的海洋，位于亚洲和美洲之间。',
    hints: ['它是世界上最大的海洋', '它在中国的东边', '它在亚洲和美洲之间']
  },
  {
    id: 'wd-009',
    mapType: 'world',
    difficulty: 'medium',
    type: 'direction',
    targetId: 'atlantic',
    prompt: '请点击大西洋的位置',
    explanation: '大西洋是世界第二大洋，位于美洲和欧洲、非洲之间。',
    hints: ['它是世界第二大洋', '它在美洲和非洲之间', '它的形状像字母"S"']
  },
  {
    id: 'wd-010',
    mapType: 'world',
    difficulty: 'hard',
    type: 'direction',
    targetId: 'indian',
    prompt: '请点击印度洋的位置',
    explanation: '印度洋是世界第三大洋，位于亚洲南部、非洲东部和大洋洲西部之间。',
    hints: ['它是世界第三大洋', '它在亚洲的南边', '它的名字和一个国家的名字一样']
  },
  {
    id: 'wd-011',
    mapType: 'world',
    difficulty: 'hard',
    type: 'direction',
    targetId: 'arctic',
    prompt: '请点击北冰洋的位置',
    explanation: '北冰洋是世界上最小最浅的大洋，位于地球最北端，常年结冰。',
    hints: ['它在地球的最北边', '它是世界上最小的大洋', '那里常年有冰']
  },
]

export default worldQuestions
