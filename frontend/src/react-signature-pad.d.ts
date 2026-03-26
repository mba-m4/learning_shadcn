declare module 'react-signature-pad' {
  import { Component, Ref } from 'react'

  interface SignaturePadProps {
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>
    ref?: Ref<SignaturePad>
  }

  export default class SignaturePad extends Component<SignaturePadProps> {
    getCanvas(): HTMLCanvasElement
    clear(): void
    isEmpty(): boolean
    toDataURL(type?: string, encoderOptions?: number): string
  }
}
