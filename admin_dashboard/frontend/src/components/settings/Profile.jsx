import { User } from 'lucide-react'
import SettingSection from './SettingSection'
import { useSelector } from 'react-redux'

const Profile = () => {
  const { currentUser } = useSelector((state) => state.user)
  return (
    <SettingSection icon={User} title={'Profile'}>
      <div className='flex flex-col sm:flex-row items-center mb-6'>
        <img
          src='https://mlvevqkvuo0q.i.optimole.com/cb:SAeg.45b8a/w:111/h:86/q:90/ig:avif/f:best/https://www.bisstek.com/wp-content/uploads/2023/09/bisstek-printer-logo.png'
          alt='Profile'
          className='rounded-full w-20 h-20 object-cover mr-4'
        />

        <div>
          <h3 className='text-lg font-semibold text-gray-100'>
            {currentUser.name}
          </h3>
          <p className='text-gray-400'>{currentUser.email}</p>
        </div>
      </div>

      {/* <button className='bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 w-full sm:w-auto'>
        Edit Profile
      </button> */}
    </SettingSection>
  )
}
export default Profile
