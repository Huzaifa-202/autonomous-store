import Header from '../components/common/Header'
import LocalGuides from '../components/localguide/LocalGuides'

const LocalGuidePage = () => {
  return (
    <>
      <div className='flex-1 relative z-10 overflow-auto'>
        <Header title={'Local Guide'} />

        <LocalGuides />
      </div>
    </>
  )
}

export default LocalGuidePage
