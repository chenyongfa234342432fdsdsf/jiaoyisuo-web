/**
 * 代理等级图标方法
 * @param {number} val 代理等级
 * @return {string} 图标名称
 */
export function AgentLevelIconMethod(val?: number): string {
  let iconValue = ''
  switch (val) {
    case 1:
      iconValue = 'icon_agent_grade_one'
      break
    case 2:
      iconValue = 'icon_agent_grade_two'
      break
    case 3:
      iconValue = 'icon_agent_grade_three'
      break
    case 4:
      iconValue = 'icon_agent_grade_four'
      break
    case 5:
      iconValue = 'icon_agent_grade_five'
      break
    case 6:
      iconValue = 'icon_agent_grade_six'
      break
    case 7:
      iconValue = 'icon_agent_grade_seven'
      break
    case 8:
      iconValue = 'icon_agent_grade_eight'
      break
    case 9:
      iconValue = 'icon_agent_grade_nine'
      break
    case 10:
      iconValue = 'icon_agent_grade_ten'
      break
    default:
  }
  return iconValue
}
