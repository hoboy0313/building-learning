import './date-picker.less'
import { attachPropertiesToComponent } from '../../utils/attach-properties-to-component'
import { DatePicker } from './date-picker'
import { TILL_NOW } from './util'
import { prompt } from './prompt'

export type { DatePickerProps, DatePickerRef } from './date-picker'
export type { DatePickerFilter } from './date-picker-utils'

export default attachPropertiesToComponent(DatePicker, {
  prompt,
  DATE_NOW: TILL_NOW,
})
