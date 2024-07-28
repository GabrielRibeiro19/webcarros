import { FiTrash2 } from 'react-icons/fi'
import { Container } from '../../components/container'
import { DashboardHeader } from '../../components/panelHeader'
import { useContext, useEffect, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { AuthContext } from '../../contexts/AuthContext'
import { db, storage } from '../../services/firebaseConnection'
import { deleteObject, ref } from 'firebase/storage'

interface ImageCarProps {
  uid: string
  name: string
  url: string
}

interface CarProps {
  id: string
  name: string
  year: string
  ownerUid: string
  price: string | number
  city: string
  km: string
  images: ImageCarProps[]
}

export function Dashboard() {
  const [cars, setCars] = useState<CarProps[]>([])
  const { user } = useContext(AuthContext)

  useEffect(() => {
    function loadCars() {
      if (!user?.uid) {
        return
      }

      const carsRef = collection(db, 'cars')
      const queryRef = query(carsRef, where('ownerUid', '==', user.uid))

      getDocs(queryRef).then((snapshot) => {
        const listCars: CarProps[] = []

        snapshot.forEach((doc) => {
          listCars.push({
            id: doc.id,
            name: doc.data().name,
            year: doc.data().year,
            ownerUid: doc.data().ownerUid,
            price: doc.data().price,
            city: doc.data().city,
            km: doc.data().km,
            images: doc.data().images,
          })

          setCars(listCars)
          console.log(listCars)
        })
      })
    }

    loadCars()
  }, [user])

  async function handleDeleteCar(car: CarProps) {
    const itemCar = car

    const docRef = doc(db, 'cars', itemCar.id)
    await deleteDoc(docRef)

    itemCar.images.map(async (image) => {
      const imagePath = `images/${image.uid}/${image.name}`
      const imageRef = ref(storage, imagePath)

      try {
        await deleteObject(imageRef)
        setCars((prevCars) => prevCars.filter((car) => car.id !== itemCar.id))
      } catch (error) {
        console.log('Erro ao deletar imagem', error)
      }
    })
  }

  return (
    <Container>
      <DashboardHeader />
      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <section key={car.id} className="w-full bg-white rounded-lg relative">
            <button
              onClick={() => handleDeleteCar(car)}
              className="absolute cursor-pointer bg-white w-14 h-14 rounded-full flex items-center justify-center right-2 top-2 drop-shadow"
            >
              <FiTrash2 size={26} color="#000" />
            </button>
            <img
              className="w-full rounded-lg mb-2 max-h-72"
              src={car.images[0].url}
              alt={car.name}
            />
            <p className="font-bold mt-1 px-2 mb-2">{car.name}</p>
            <div className="flex flex-col px-2">
              <span className="text-zinc-700">
                Ano {car.year} | {car.km} km
              </span>
              <strong className="text-black font-bold mt-4">
                R$ {car.price}
              </strong>
            </div>
            <div className="w-full h-px bg-slate-200 my-2" />

            <div className="px-2 pb-2">
              <span className="text-zinc-700">{car.city}</span>
            </div>
          </section>
        ))}
      </main>
    </Container>
  )
}
