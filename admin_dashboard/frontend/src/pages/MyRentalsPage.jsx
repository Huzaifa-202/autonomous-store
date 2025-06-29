import Header from '../components/common/Header'
import MyRentals from '../components/myrentals/MyRentals'

const MyRentalsPage = () => {
  return (
    <>
      <div className='flex-1 relative z-10 overflow-auto'>
        <Header title={'My Feed'} />
        <MyRentals />
      </div>
    </>
  )
}

export default MyRentalsPage
