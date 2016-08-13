import * as Tether from '../helpers/tether'
import { query } from '../../util'
import { on, offAll } from '../helpers/dom'
import render from './render'

export default {
  name: 'VkDropdown',
  render,
  props: {
    target: {
      default: false
    },
    blank: {
      type: Boolean,
      default: false
    },
    fixWidth: {
      type: Boolean,
      default: false
    },
    position: {
      type: String,
      default: 'bottom left'
    },
    scrollable: {
      type: Boolean,
      default: false
    },
    offset: {
      type: String,
      default: '0 0'
    },
    offsetTarget: {
      type: String,
      default: '0 0'
    },
    constrainToWindow: {
      type: Boolean,
      default: true
    },
    constrainToParent: {
      type: Boolean,
      default: true
    },
    tetherOptions: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    isOpen () {
      // return v-show directive value
      const data = this.$vnode.data
      const show = data.directives && data.directives.find(dir => dir.name === 'show')
      return !data.directives || !show
        ? false
        : show.value
    },
    targetNode () {
      return (typeof this.target === 'string')
        ? query(this.target)
        : this.target
    }
  },
  mounted () {
    if (this.targetNode) {
      this.init()
    }
  },
  methods: {
    beforeEnter () {
      this.$nextTick(() => this.$tether.enable())
    },
    afterLeave () {
      this.$nextTick(() => this.$tether.disable())
    },
    init () {
      this.initEvents()
      this.$tether = Tether.init(
        this.$el,
        this.targetNode,
        this.isOpen,
        this.position,
        this.offset,
        this.offsetTarget,
        this.constrainToParent,
        this.constrainToWindow,
        this.tetherOptions
      )
    },
    initEvents () {
      // click events
      let clickEvents = ['click']
      if ('ontouchstart' in document.documentElement) {
        clickEvents.push('touchstart')
      }
      const clickHandler = event => {
        if (this.isOpen) {
          // clicking target
          if (event.target === this.targetNode || this.targetNode.contains(event.target)) {
            return
          }
          // click in/out dropdown
          if (event.target === this.$el || this.$el.contains(event.target)) {
            this.$emit('clickIn', event)
          } else {
            this.$emit('clickOut', event)
          }
        }
      }
      for (let i = 0; i < clickEvents.length; ++i) {
        this.on(document, clickEvents[i], clickHandler)
      }
      this.on(this.targetNode, 'mouseover', event => {
        // ignore childs triggers
        if (this.targetNode.contains(event.fromElement)) {
          return
        }
        this.$emit('targetHoverIn', event)
      })
      this.on(this.targetNode, 'mouseout', event => {
        // ignore childs triggers
        if (event.relatedTarget === this.targetNode || this.targetNode.contains(event.relatedTarget)) {
          return
        }
        this.$emit('targetHoverOut', event)
      })
    },
    // just a shortcut to avoid setting up
    // the namespace every time
    on (el, event, handler) {
      on(el, event, handler, this._uid)
    }
  },
  beforeDestroy () {
    if (this.$tether !== undefined) {
      this.$tether.destroy()
    }
    offAll(this._uid)
    this.$el.parentNode.removeChild(this.$el)
  }
}