import { useEffect, useState } from 'react'
import { Container } from '../../components/container'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../services/firebaseConnection'
import { FaWhatsapp } from 'react-icons/fa'
import { Swiper, SwiperSlide } from 'swiper/react'

interface CarImageProps {
  name: string
  url: string
  uid: string
}

interface CarProps {
  id: string
  name: string
  model: string
  city: string
  year: string
  createdAt: string
  km: string
  price: string | number
  description: string
  owner: string
  ownerUid: string
  whatsapp: string
  images: CarImageProps[]
}

export function CarDetail() {
  const { id } = useParams()
  const [car, setCar] = useState<CarProps>()
  const [sliderPerView, setSliderPerView] = useState<number>(2)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadCar() {
      if (!id) return

      const docRef = doc(db, 'cars', id)
      getDoc(docRef).then((snapshot) => {
        if (!snapshot.data()) {
          navigate('/')
          return
        }

        setCar({
          id: snapshot.id,
          name: snapshot.data()?.name,
          model: snapshot.data()?.model,
          city: snapshot.data()?.city,
          year: snapshot.data()?.year,
          km: snapshot.data()?.km,
          price: snapshot.data()?.price,
          description: snapshot.data()?.description,
          owner: snapshot.data()?.owner,
          ownerUid: snapshot.data()?.ownerUid,
          whatsapp: snapshot.data()?.whatsapp,
          images: snapshot.data()?.images,
          createdAt: snapshot.data()?.createdAt,
        })
      })
    }
    loadCar()
  }, [id, navigate])

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 720) {
        setSliderPerView(1)
      } else {
        setSliderPerView(2)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <Container>
      {car && (
        <Swiper
          slidesPerView={sliderPerView}
          pagination={{ clickable: true }}
          navigation
        >
          {car?.images.map((image) => (
            <SwiperSlide key={image.name}>
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-96 object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {car && (
        <main className="w-full bg-white rounded-lg p-6 my-4">
          <div className="flex flex-col sm:flex-row mb-4 items-center justify-between">
            <h1 className="font-bold text-3xl text-black">{car?.name}</h1>
            <h2 className="font-bold text-3xl text-black">R$ {car?.price}</h2>
          </div>
          <p>{car?.model}</p>
          <div className="flex w-full gap-6 my-4">
            <div className="flex flex-col gap-4">
              <div>
                <p>Cidade</p>
                <strong>{car?.city}</strong>
              </div>
              <div>
                <p>Ano</p>
                <strong>{car?.year}</strong>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <p>KM</p>
                <strong>{car?.km}</strong>
              </div>
            </div>
          </div>
          <strong>Descrição</strong>
          <p className="mb-4">{car?.description}</p>

          <strong>Telefone/WhatsApp</strong>
          <p>{car?.whatsapp}</p>
          <a
            href={`https://api.whatsapp.com/send?phone=${car?.whatsapp}&text=Olá, vi esse ${car?.name} no site WebCarros e fiquei interessado!`}
            target="_blank"
            className="bg-green-500 hover:bg-green-700 duration-300 w-full text-white flex items-center justify-center gap-2 my-6 h-11 text-xl rounded-lg font-medium cursor-pointer"
            rel="noreferrer"
          >
            Conversar com o vendedor
            <FaWhatsapp size={26} color="#fff" />
          </a>
        </main>
      )}
    </Container>
  )
}
