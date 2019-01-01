/** @format */

const React = require('react')

module.exports = class TangleText extends React.Component {
  constructor(props) {
    super(props)

    this.getProp = this.getProp.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onBlur = this.onBlur.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onDoubleClick = this.onDoubleClick.bind(this)

    this.state = {
      value: this.getProp('value')
    }
  }

  componentWillMount() {
    this.__isMouseDown = false
  }

  componentWillReceiveProps(nextProps) {
    this.setState({value: nextProps.value})
  }

  bounds(num) {
    num = Math.max(num, this.getProp('min'))
    num = Math.min(num, this.getProp('max'))
    return num
  }

  onChange(e) {
    this.setState({value: e.target.value})
  }

  onBlur(e) {
    var parsed = parseFloat(this.state.value)
    if (isNaN(parsed)) {
      this.setState({value: this.getProp('value')})
    } else {
      this.getProp('onChange')(this.bounds(parsed))
      this.setState({value: this.bounds(parsed)})
    }
  }

  onMouseMove(e) {
    var change = Math.floor(
      (this.startX - e.screenX) / this.getProp('pixelDistance')
    )
    this.dragged = true
    var value = this.bounds(this.startValue - change * this.getProp('step'))
    this.setState({value: value})
    this.getProp('onInput')(value)
  }

  onMouseDown(e) {
    // short circuit if currently editing number
    if (e.target === document.activeElement || e.button !== 0) return
    this.__isMouseDown = true

    e.preventDefault()

    this.dragged = false
    this.startX = e.screenX
    this.startValue = this.state.value

    window.addEventListener('mousemove', this.onMouseMove)
    window.addEventListener('mouseup', this.onMouseUp)
  }

  onMouseUp(e) {
    if (this.__isMouseDown) {
      e.preventDefault()
      window.removeEventListener('mousemove', this.onMouseMove)
      window.removeEventListener('mouseup', this.onMouseUp)
      if (this.dragged) this.onBlur()
      this.__isMouseDown = false
    }
  }

  onDoubleClick(e) {
    e.target.focus()
  }

  onKeyDown(e) {
    var value
    if (e.which === 38) {
      // UP
      e.preventDefault()
      value = this.state.value + this.getProp('step')
      this.setState({value: value})
      this.getProp('onInput')(value)
    } else if (e.which === 40) {
      // DOWN
      e.preventDefault()
      value = this.state.value - this.getProp('step')
      this.setState({value: value})
      this.getProp('onInput')(value)
    } else if (e.which === 13) {
      // ENTER
      this.onBlur(e)
      e.target.blur()
    }
  }

  getProp(k) {
    return this.props[k] === undefined ? defaultProps[k] : this.props[k]
  }

  render() {
    return React.createElement('div', {}, [
      React.createElement('input', {
        key: '1',
        className: this.getProp('className'),
        style: this.getProp('style'),
        disabled: this.getProp('disabled'),
        type: 'text',
        onChange: this.onChange,
        onMouseDown: this.onMouseDown,
        onKeyDown: this.onKeyDown,
        onMouseUp: this.onMouseUp,
        onDoubleClick: this.onDoubleClick.bind(this),
        onBlur: this.onBlur,
        value: this.getProp('format')(this.state.value)
      })
    ])
  }
}

const defaultProps = {
  min: -Infinity,
  max: Infinity,
  step: 1,
  pixelDistance: 1,
  className: 'react-tangle-input',
  style: {
    border: 0,
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    textAlign: 'left',
    cursor: 'col-resize',
    borderBottom: '1px dashed'
  },
  format: function(x) {
    return x
  },
  onInput: function() {},
  onChange: function() {
    console.warn(
      "react-tangle-text: you didn't pass an onChange handler, we're doing nothing."
    )
  }
}
