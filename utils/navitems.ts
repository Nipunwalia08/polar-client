import AiAgents from '@assets/navbar/AiAgents.svg'
import Analytics from '@assets/navbar/Analytics.svg'
import CampaignManagement from '@assets/navbar/CampaignManagement.svg'
import Chat from '@assets/navbar/Chat.svg'
// import Customer from '@assets/navbar/Customer.svg'
import Dashboard from '@assets/navbar/Dashboard.svg'
// import Integration from '@assets/navbar/Integration.svg'
import Leads from '@assets/navbar/Leads.svg'
import Settings from '@assets/navbar/Settings.svg'
import TeamManagement from '@assets/navbar/Team.svg'
import YourProduct from '@assets/navbar/YourProduct.svg'


type SideBarLinkType = {
  title: string
  href?: string
  icon?: any
  adminSpecific?: boolean
  subLinks?: SideBarLinkType[]
}

const navbarLinks: SideBarLinkType[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Dashboard,
    adminSpecific: false,
  },
  // {
  //     title: 'Integration',
  //     href: '/integration',
  //     icon: IntegrationSvg,
  //     adminSpecific:false
  // },
  {
    title: 'AI Agents',
    href: '/agentflow',
    icon: AiAgents,
    adminSpecific: true,
  },
  {
    title: 'Your Products',
    href: '/your-products',
    icon: YourProduct,
    adminSpecific: true,
  },
  { title: 'break', href: 'break' },
  {
    title: 'Campaign Management',
    icon: CampaignManagement,
    adminSpecific: false,
    subLinks: [
      { title: 'Manage Template', href: '/template', adminSpecific: true },
      { title: 'Manage Campaign', href: '/campaign/manage' },
      {
        title: 'Manage Campaign Flow',
        href: '/campaign-flow',
        adminSpecific: true,
      },
    ],
  },
  {
    title: 'Team Management',
    href: '/team-management',
    icon: TeamManagement,
    adminSpecific: true,
  },
  {
    title: 'Chat',
    href: '/chat',
    icon: Chat,
    adminSpecific: false,
  },
  {
    title: 'Leads',
    icon: Leads,
    adminSpecific: false,
    subLinks: [
      { title: 'Manage Leads', href: '/leads/manage' },
      { title: 'Scrape Leads', href: '/leads/scrape' },
    ],
  },
  {
    title: 'ISV',
    href: '/isv',
    icon: Settings,
    adminSpecific: false,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: Analytics,
    adminSpecific: false,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    adminSpecific: false,
  },

]

export default navbarLinks
