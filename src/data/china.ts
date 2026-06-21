import type { Question } from '../types'

export const chinaQuestions: Question[] = [
  {
    id: 'cn-001',
    mapType: 'china',
    difficulty: 'easy',
    type: 'province',
    targetId: 'beijing',
    prompt: '请点击中国的首都北京所在的位置',
    explanation: '北京是中华人民共和国的首都，位于中国北方，是全国的政治、文化中心。',
    hints: ['它位于中国的北方地区', '它是直辖市，旁边有河北省和天津市', '它的名字第一个字是"北"']
  },
  {
    id: 'cn-002',
    mapType: 'china',
    difficulty: 'easy',
    type: 'province',
    targetId: 'shanghai',
    prompt: '请点击上海市的位置',
    explanation: '上海是中国最大的城市，位于长江入海口，是国际经济、金融中心。',
    hints: ['它位于中国的东部沿海', '它是直辖市，在长江入海口附近', '它被称为"东方明珠"']
  },
  {
    id: 'cn-003',
    mapType: 'china',
    difficulty: 'easy',
    type: 'province',
    targetId: 'guangdong',
    prompt: '请点击广东省的位置',
    explanation: '广东省位于中国南部沿海，是中国经济最发达的省份之一，省会是广州。',
    hints: ['它位于中国的南方', '它是沿海省份，与香港、澳门相邻', '它的省会是广州']
  },
  {
    id: 'cn-004',
    mapType: 'china',
    difficulty: 'easy',
    type: 'province',
    targetId: 'sichuan',
    prompt: '请点击四川省的位置',
    explanation: '四川省位于中国西南地区，省会是成都，以大熊猫和美食闻名。',
    hints: ['它位于中国的西南部', '它的省会是成都', '大熊猫主要生活在这里']
  },
  {
    id: 'cn-005',
    mapType: 'china',
    difficulty: 'easy',
    type: 'province',
    targetId: 'heilongjiang',
    prompt: '请点击黑龙江省的位置',
    explanation: '黑龙江省位于中国最东北部，是中国纬度最高的省份，冬季寒冷漫长。',
    hints: ['它位于中国的最东北方', '它与俄罗斯相邻', '它的名字里有"龙"字']
  },
  {
    id: 'cn-006',
    mapType: 'china',
    difficulty: 'medium',
    type: 'province',
    targetId: 'xinjiang',
    prompt: '请点击新疆维吾尔自治区的位置',
    explanation: '新疆是中国面积最大的省级行政区，位于西北边陲，有美丽的天山和沙漠。',
    hints: ['它是中国面积最大的省级行政区', '它位于中国的西北部', '那里有著名的天山山脉']
  },
  {
    id: 'cn-007',
    mapType: 'china',
    difficulty: 'medium',
    type: 'province',
    targetId: 'xizang',
    prompt: '请点击西藏自治区的位置',
    explanation: '西藏位于中国西南边陲，平均海拔4000米以上，被称为"世界屋脊"。',
    hints: ['它位于中国的西南部', '它是世界上海拔最高的地区之一', '布达拉宫就在这里']
  },
  {
    id: 'cn-008',
    mapType: 'china',
    difficulty: 'medium',
    type: 'province',
    targetId: 'neimenggu',
    prompt: '请点击内蒙古自治区的位置',
    explanation: '内蒙古位于中国北部边疆，有广阔的草原，以畜牧业闻名。',
    hints: ['它位于中国的北部边疆', '它是一个东西很长的自治区', '那里有美丽的大草原']
  },
  {
    id: 'cn-009',
    mapType: 'china',
    difficulty: 'medium',
    type: 'river',
    targetId: 'yangtze',
    prompt: '请点击长江的位置',
    explanation: '长江是中国最长的河流，全长约6300公里，是世界第三长河，自西向东流入东海。',
    hints: ['它是中国最长的河流', '它从西向东流', '它的入海口在上海附近']
  },
  {
    id: 'cn-010',
    mapType: 'china',
    difficulty: 'medium',
    type: 'river',
    targetId: 'yellow',
    prompt: '请点击黄河的位置',
    explanation: '黄河是中国第二长河，被称为中华民族的"母亲河"，因河水含沙多呈黄色而得名。',
    hints: ['它是中国第二长的河流', '它的形状像一个"几"字', '它被称为"母亲河"']
  },
  {
    id: 'cn-011',
    mapType: 'china',
    difficulty: 'hard',
    type: 'city',
    targetId: 'xian',
    prompt: '请点击西安的位置',
    explanation: '西安是陕西省省会，是中国四大古都之一，有著名的兵马俑。',
    hints: ['它位于陕西省', '它是古代丝绸之路的起点', '那里有世界闻名的兵马俑']
  },
  {
    id: 'cn-012',
    mapType: 'china',
    difficulty: 'hard',
    type: 'city',
    targetId: 'hangzhou',
    prompt: '请点击杭州的位置',
    explanation: '杭州是浙江省省会，以西湖美景闻名，有"上有天堂，下有苏杭"的美誉。',
    hints: ['它位于浙江省', '它在上海的南边', '那里有美丽的西湖']
  },
]

export default chinaQuestions
