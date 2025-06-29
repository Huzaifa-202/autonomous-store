import { useState } from 'react'
import SettingSection from './SettingSection'
import { Bell } from 'lucide-react'
import ToggleSwitch from './ToggleSwitch'
import { useSelector } from 'react-redux'

const Notifications = () => {
  const { currentUser } = useSelector((state) => state.user)
  console.log(currentUser)
  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    sms: true,
  })

  return (
    <SettingSection icon={Bell} title={'Role'}>
      <h3 className='text-lg font-semibold text-gray-100'>
        {currentUser.userType}
      </h3>
    </SettingSection>
  )
}
export default Notifications
