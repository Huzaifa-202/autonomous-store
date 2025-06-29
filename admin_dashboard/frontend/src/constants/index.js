import {
  benefitIcon1,
  benefitIcon2,
  benefitIcon3,
  benefitIcon4,
  benefitImage2,
  chromecast,
  disc02,
  discord,
  discordBlack,
  facebook,
  symbol,
  opencv,
  figma,
  file02,
  framer,
  homeSmile,
  instagram,
  notification2,
  notification3,
  notification4,
  react,
  yolo,
  tensorflow,
  prophet,
  tailwind,
  node,
  photoshop,
  plusSquare,
  protopie,
  raindrop,
  recording01,
  recording03,
  roadmap1,
  roadmap2,
  roadmap3,
  roadmap4,
  searchMd,
  slack,
  sliders04,
  telegram,
  twitter,
  yourlogo,
} from '../assets'

export const navigation = [
  {
    id: '0',
    title: 'Features',
    url: '#features',
  },
  {
    id: '1',
    title: 'Stack',
    url: '#pricing',
  },
  {
    id: '2',
    title: 'Services',
    url: '#services',
  },
  {
    id: '3',
    title: 'Funcitonalities',
    url: '#functionality',
  },
  {
    id: '4',
    title: 'Create Account',
    url: '#signup',
    onlyMobile: true,
  },
  {
    id: '5',
    title: 'Login',
    url: '#login',
    onlyMobile: true,
  },
]

export const heroIcons = [homeSmile, file02, searchMd, plusSquare]

export const notificationImages = [notification4, notification3, notification2]

export const companyLogos = [symbol, symbol, symbol, symbol, symbol]

export const brainwaveServices = [
  'Customer Monitoring',
  'AI-driven Insights',
  'Seamless Checkout',
]

export const brainwaveServicesIcons = [
  recording03,
  recording01,
  disc02,
  chromecast,
  sliders04,
]

export const roadmap = [
  {
    id: '0',
    title: 'AI-based Customer Detection',
    text: 'Deploy real-time AI to monitor customers and detect patterns inside the store.',
    date: 'March 2024',
    status: 'done',
    imageUrl: roadmap1,
    colorful: true,
  },
  {
    id: '1',
    title: 'Facial Recognition Integration',
    text: 'Implement a facial recognition system to personalize shopping experiences for returning customers.',
    date: 'April 2024',
    status: 'progress',
    imageUrl: roadmap2,
  },
  {
    id: '2',
    title: 'Automated Checkout',
    text: 'Enable customers to make payments without standing in queues using contactless payment technology.',
    date: 'June 2024',
    status: 'planned',
    imageUrl: roadmap3,
  },
  {
    id: '3',
    title: 'Customer Insights Dashboard',
    text: 'Provide store owners with an analytics dashboard for real-time customer behavior insights.',
    date: 'August 2024',
    status: 'planned',
    imageUrl: roadmap4,
  },
]

export const collabText =
  'Automate your store operations and secure data with ease, making it the ideal solution for retail management.'

export const collabContent = [
  {
    id: '0',
    title: 'Seamless Integration',
    text: collabText,
  },
  {
    id: '1',
    title: 'AI-Driven Automation',
  },
  {
    id: '2',
    title: 'Enhanced Security',
  },
]

export const collabApps = [
  {
    id: '0',
    title: 'React',
    icon: react,
    width: 34,
    height: 36,
  },
  {
    id: '1',
    title: 'Framer',
    icon: framer,
    width: 34,
    height: 36,
  },
  {
    id: '2',
    title: 'Node',
    icon: tailwind,
    width: 34,
    height: 36,
  },
  {
    id: '3',
    title: 'Node',
    icon: node,
    width: 34,
    height: 36,
  },
  {
    id: '4',
    title: 'Open-cv',
    icon: opencv,
    width: 36,
    height: 28,
  },
  {
    id: '5',
    title: 'Yolo',
    icon: yolo,
    width: 26,
    height: 36,
  },
  {
    id: '6',
    title: 'tensorflow',
    icon: tensorflow,
    width: 34,
    height: 34,
  },
  {
    id: '7',
    title: 'prophet',
    icon: prophet,
    width: 34,
    height: 34,
  },
]

export const pricing = [
  {
    id: '0',
    title: 'Basic',
    description: 'Store monitoring, customer tracking',
    price: '0',
    features: [
      'Real-time store monitoring',
      'Basic customer tracking with alerts',
      'Explore essential features at no cost',
    ],
  },
  {
    id: '1',
    title: 'Premium',
    description: 'Advanced tracking, AI analytics, priority support',
    price: '49.99',
    features: [
      'Advanced customer tracking and behavior analysis',
      'Access to AI-driven insights and predictive analytics',
      'Priority support and technical assistance',
    ],
  },
  {
    id: '2',
    title: 'Enterprise',
    description: 'Custom solutions, dedicated support, detailed reporting',
    price: 99.99,
    features: [
      'Custom solutions tailored for large store operations',
      'Dedicated account manager and advanced AI features',
      'Detailed reporting and in-depth analytics for store optimization',
    ],
  },
]

export const benefits = [
  {
    id: '0',
    title: 'Monitor in Real-Time',
    text: 'Keep track of customers in real-time, ensuring better service and security.',
    backgroundUrl: './src/assets/benefits/card-1.svg',
    iconUrl: benefitIcon1,
    imageUrl: benefitImage2,
  },
  {
    id: '1',
    title: 'Automate Customer Insights',
    text: 'Gain valuable insights into customer behavior with AI automation.',
    backgroundUrl: './src/assets/benefits/card-2.svg',
    iconUrl: benefitIcon2,
    imageUrl: benefitImage2,
    light: true,
  },
  {
    id: '2',
    title: 'Seamless Shopping Experience',
    text: 'Offer a smooth and hassle-free shopping experience with automated checkout systems.',
    backgroundUrl: './src/assets/benefits/card-3.svg',
    iconUrl: benefitIcon3,
    imageUrl: benefitImage2,
  },
  {
    id: '3',
    title: 'Improve Daily Operations',
    text: 'Enhance your store operations with AI insights and automation.',
    backgroundUrl: './src/assets/benefits/card-4.svg',
    iconUrl: benefitIcon4,
    imageUrl: benefitImage2,
    light: true,
  },
  {
    id: '4',
    title: 'Enhanced Security',
    text: 'Keep your store secure with continuous monitoring and tracking.',
    backgroundUrl: './src/assets/benefits/card-5.svg',
    iconUrl: benefitIcon1,
    imageUrl: benefitImage2,
  },
  {
    id: '5',
    title: 'Smart Automation',
    text: 'Leverage automation to reduce manual efforts and enhance accuracy in customer service.',
    backgroundUrl: './src/assets/benefits/card-6.svg',
    iconUrl: benefitIcon2,
    imageUrl: benefitImage2,
  },
]

export const socials = [
  {
    id: '0',
    title: 'Discord',
    iconUrl: discordBlack,
    url: '#',
  },
  {
    id: '1',
    title: 'Twitter',
    iconUrl: twitter,
    url: '#',
  },
  {
    id: '2',
    title: 'Instagram',
    iconUrl: instagram,
    url: '#',
  },
  {
    id: '3',
    title: 'Telegram',
    iconUrl: telegram,
    url: '#',
  },
  {
    id: '4',
    title: 'Facebook',
    iconUrl: facebook,
    url: '#',
  },
]
