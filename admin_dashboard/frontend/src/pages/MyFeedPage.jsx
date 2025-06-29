import Header from '../components/common/Header'
import Updates from '../components/myfeed/Updates'

const MyFeedPage = () => {
  return (
    <>
      <div className='flex-1 relative z-10 overflow-auto'>
        <Header title={'My Feed'} />
        <Updates />
      </div>
    </>
  )
}

export default MyFeedPage
