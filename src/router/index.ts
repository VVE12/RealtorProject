import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import RealtorList from '../views/RealtorList.vue'
import EditDivision from '../views/EditDivision.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'home',
    component: RealtorList
  },
  {
    path: '/edit',
    name: 'edit',
    component: EditDivision
  }
]

const router = new VueRouter({
  routes
})

export default router
