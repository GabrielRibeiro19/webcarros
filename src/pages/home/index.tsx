import { useEffect, useState } from 'react'
import { Container } from '../../components/container'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { db } from '../../services/firebaseConnection'
import { Link } from 'react-router-dom'

interface CarImageProps {
  name: string
  url: string
  uid: string
}

interface CarProps {
  id: string
  name: string
  year: string
  ownerUid: string
  price: string | number
  city: string
  km: string
  images: CarImageProps[]
}

export function Home() {
  const [cars, setCars] = useState<CarProps[]>([])
  const [loadImages, setLoadImages] = useState<string[]>([])
  const [inputSearch, setInputSearch] = useState('')

  useEffect(() => {
    loadCars()
  }, [])

  async function loadCars() {
    const carsRef = collection(db, 'cars')
    const queryRef = query(carsRef, orderBy('createdAt', 'desc'))

    await getDocs(queryRef).then((snapshot) => {
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
      })
    })
  }

  function handleImageLoad(id: string) {
    setLoadImages((prevImageLoaded) => [...prevImageLoaded, id])
  }

  async function handleSearchCar() {
    if (inputSearch === '') {
      loadCars()
      return
    }

    setCars([])
    setLoadImages([])
    const q = query(
      collection(db, 'cars'),
      where('name', '>=', inputSearch.toUpperCase()),
      where('name', '<=', inputSearch.toUpperCase() + '\uf8ff'),
      orderBy('name'),
    )

    const querySnapshot = await getDocs(q)

    const listCars: CarProps[] = []

    querySnapshot.forEach((doc) => {
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
    })
    setCars(listCars)
  }

  return (
    <Container>
      <section className="bg-white p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-2">
        <input
          className="w-full border-2 rounded-lg h-9 px-3 outline-none"
          placeholder="Digite o nome do carro..."
          value={inputSearch}
          onChange={(e) => setInputSearch(e.target.value)}
        />
        <button
          className="bg-red-500 h-9 px-8 rounded-lg text-white font-medium text-lg"
          onClick={handleSearchCar}
        >
          Buscar
        </button>
      </section>
      <h1 className="font-bold text-center mt-6 text-2xl mb-4">
        Carros novos e usados em todo o Brasil
      </h1>

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <Link to={`/car/${car.id}`} key={car.id}>
            <section key={car.id} className="w-full bg-white rounded-lg">
              <div
                className="w-full h-72 rounded-lg bg-slate-200 animate-pulse"
                style={{
                  display: loadImages.includes(car.id) ? 'none' : 'block',
                }}
              />
              <img
                className="w-full rounded-lg mb-2 max-h-72 hover:scale-105 transition-all"
                src={car.images[0].url}
                alt={car.name}
                onLoad={() => handleImageLoad(car.id)}
                style={{
                  display: loadImages.includes(car.id) ? 'block' : 'none',
                }}
              />
              <p className="font-bold mt-1 mb-2 px-2 text-lg">{car.name}</p>
              <div className="flex flex-col px-2">
                <span className="text-zinc-700 mb-6">
                  Ano {car.year} | {car.km} km
                </span>
                <strong className="text-black font-medium text-xl">
                  R$ {car.price}
                </strong>
              </div>
              <div className="w-full h-px bg-slate-200 my-2" />
              <div className="px-2 pb-2">
                <span className="text-zinc-700">{car.city}</span>
              </div>
            </section>
          </Link>
        ))}
      </main>
    </Container>
  )
}
