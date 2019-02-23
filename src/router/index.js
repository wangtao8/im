import Vue from 'vue'
import Router from 'vue-router'
// import ContactList from '@/components/ContactList'
// import ChatDetails from '../components/chatdetails'
// import ContactInfo from '../components/contactinfo'
// import ContactGroupList from '../components/contactgrouplist'
// import ContactExpertList from '../components/contactexpertlist'
// import Test from '../components/test'

const ContactList = () => import('../components/ContactList')
const ChatDetails = () => import('../components/chatdetails')
const ContactInfo = () => import('../components/contactinfo')
const ContactGroupList = () => import('../components/contactgrouplist')
const ContactExpertList = () => import('../components/contactexpertlist')
const Search = () => import('../components/Search/Search')
const ChatRoomList = () => import('../components/ChatRoomList')
const Test = () => import('../components/test')

Vue.use(Router)

export default new Router({
  // mode: 'history',
  // base: '/im',
  routes: [
    {
      path: '/',
      name: 'ContactList',
      component: ContactList
    },
    {
      path: '/chatDetails',
      name: 'ChatDetails',
      component: ChatDetails
    },
    {
      path: '/contactInfo',
      name: 'ContactInfo',
      component: ContactInfo
    },
    {
      path: '/contactGroupList',
      name: 'ContactGroupList',
      component: ContactGroupList
    },
    {
      path: '/ChatRoomList',
      name: 'ChatRoomList',
      component: ChatRoomList
    },
    {
      path: '/contactExpertList',
      name: 'ContactExpertList',
      component: ContactExpertList
    },
    {
      path: '/search',
      name: 'search',
      component: Search
    },
    {
      path: '/test',
      name: 'Test',
      component: Test
    }
  ]
})
