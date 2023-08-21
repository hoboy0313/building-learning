import { show } from './show'
import { DialogProps } from './index'
import { ReactNode } from 'react'
import { mergeProps } from '../../utils/with-default-props'
import { getDefaultConfig } from '../config-provider'

export type DialogConfirmProps = Omit<
  DialogProps,
  'visible' | 'closeOnAction' | 'actions'
> & {
  confirmText?: ReactNode
  cancelText?: ReactNode
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void | Promise<void>
}

const defaultProps = {
  confirmText: '确认',
  cancelText: '取消',
}

export function confirm(p: DialogConfirmProps) {
  const { locale } = getDefaultConfig()
  const props = mergeProps(
    defaultProps,
    {
      confirmText: locale.common.confirm,
      cancelText: locale.common.cancel,
    },
    p
  )
  return new Promise<boolean>(resolve => {
    show({
      ...props,
      closeOnAction: true,
      onClose: () => {
        props.onClose?.()
        resolve(false)
      },
      actions: [
        [
          {
            key: 'cancel',
            text: props.cancelText,
            onClick: async () => {
              await props.onCancel?.()
              resolve(false)
            },
          },
          {
            key: 'confirm',
            text: props.confirmText,
            bold: true,
            onClick: async () => {
              await props.onConfirm?.()
              resolve(true)
            },
          },
        ],
      ],
    })
  })
}
