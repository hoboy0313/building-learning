import { NativeProps, withNativeProps } from '../../utils/native-props'
import React, { useMemo, useRef, useState } from 'react'
import { useUnmountedRef } from 'ahooks'
import { useLockScroll } from '../../utils/use-lock-scroll'
import { useSpring, animated } from '@react-spring/web'
import {
  renderToContainer,
  GetContainer,
} from '../../utils/render-to-container'
import { mergeProps } from '../../utils/with-default-props'
import { useConfig } from '../config-provider'
import { ShouldRender } from '../../utils/should-render'
import {
  PropagationEvent,
  withStopPropagation,
} from '../../utils/with-stop-propagation'

const classPrefix = `adm-mask`

const opacityRecord = {
  default: 0.55,
  thin: 0.35,
  thick: 0.75,
}
const colorRecord: Record<string, string> = {
  black: '0, 0, 0',
  white: '255, 255, 255',
}

export type MaskProps = {
  visible?: boolean
  onMaskClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  destroyOnClose?: boolean
  forceRender?: boolean
  disableBodyScroll?: boolean
  color?: 'white' | 'black' | (string & {})
  opacity?: 'default' | 'thin' | 'thick' | number
  getContainer?: GetContainer
  afterShow?: () => void
  afterClose?: () => void
  stopPropagation?: PropagationEvent[]
  children?: React.ReactNode
} & NativeProps<'--z-index'>

const defaultProps = {
  visible: true,
  destroyOnClose: false,
  forceRender: false,
  color: 'black',
  opacity: 'default',
  disableBodyScroll: true,
  getContainer: null,
  stopPropagation: ['click'],
}

export const Mask: React.FC<MaskProps> = p => {
  const props = mergeProps(defaultProps, p)
  const { locale } = useConfig()

  const ref = useRef<HTMLDivElement>(null)

  useLockScroll(ref, props.visible && props.disableBodyScroll)

  const background = useMemo(() => {
    const opacity = opacityRecord[props.opacity] ?? props.opacity
    const rgb = colorRecord[props.color]
    return rgb ? `rgba(${rgb}, ${opacity})` : props.color
  }, [props.color, props.opacity])

  const [active, setActive] = useState(props.visible)

  const unmountedRef = useUnmountedRef()
  const { opacity } = useSpring({
    opacity: props.visible ? 1 : 0,
    config: {
      precision: 0.01,
      mass: 1,
      tension: 250,
      friction: 30,
      clamp: true,
    },
    onStart: () => {
      setActive(true)
    },
    onRest: () => {
      if (unmountedRef.current) return
      setActive(props.visible)
      if (props.visible) {
        props.afterShow?.()
      } else {
        props.afterClose?.()
      }
    },
  })

  const node = withStopPropagation(
    props.stopPropagation,
    withNativeProps(
      props,
      <animated.div
        className={classPrefix}
        ref={ref}
        style={{
          ...props.style,
          background,
          opacity,
          display: active ? undefined : 'none',
        }}
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          if (e.target === e.currentTarget) {
            props.onMaskClick?.(e)
          }
        }}
      >
        {props.onMaskClick && (
          <div
            className={`${classPrefix}-aria-button`}
            role='button'
            aria-label={locale.Mask.name}
            onClick={props.onMaskClick}
          />
        )}
        <div className={`${classPrefix}-content`}>{props.children}</div>
      </animated.div>
    )
  )

  return (
    <ShouldRender
      active={active}
      forceRender={props.forceRender}
      destroyOnClose={props.destroyOnClose}
    >
      {renderToContainer(props.getContainer, node)}
    </ShouldRender>
  )
}
