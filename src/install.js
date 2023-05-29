import View from './components/view'
import Link from './components/link'

export let _Vue

export function install (Vue) {
  if (install.installed && _Vue === Vue) return
  install.installed = true
  debugger
  _Vue = Vue

  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (
      isDef(i) &&
      isDef((i = i.data)) &&
      isDef((i = i.registerRouteInstance))
    ) {
      i(vm, callVal)
    }
  }

  // 向根Vue混入beforeCreate和destroyed
  Vue.mixin({
    beforeCreate () {
      // 判断new Vue的时候有没有传router这个参数
      if (isDef(this.$options.router)) {
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this)

        // 将this._route 设置为响应式数据，这也是为什么改变路径页面可以重新渲染的原因
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })

  // 访问Vue.prototype.$router 其实是访问 this._routerRoot._router
  Object.defineProperty(Vue.prototype, '$router', {
    get () {
      return this._routerRoot._router
    }
  })

  // 访问Vue.prototype.$route 其实是访问 this._routerRoot._route
  Object.defineProperty(Vue.prototype, '$route', {
    get () {
      return this._routerRoot._route
    }
  })

  // 注册RouterView和RouterLink 两个全局组件
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  // 对于beforeRouteEnter beforeRouteLeave beforeRouteUpdate 这三个router hook都使用与created相同的合并策略
  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate =
    strats.created
}
