import { FiTrash, FiUpload } from 'react-icons/fi'
import { Container } from '../../../components/container'
import { DashboardHeader } from '../../../components/panelHeader'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../../../components/input'
import { ChangeEvent, useContext, useState } from 'react'
import { AuthContext } from '../../../contexts/AuthContext'
import { v4 as uuidV4 } from 'uuid'
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage'
import { db, storage } from '../../../services/firebaseConnection'
import { addDoc, collection } from 'firebase/firestore'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  model: z.string().min(1, 'O  modelo é obrigatório'),
  year: z.string().min(1, 'O ano do carro é obrigatório'),
  km: z.string().min(1, 'A quilometragem é obrigatória'),
  price: z.string().min(1, 'O preço é obrigatório'),
  city: z.string().min(1, 'A cidade é obrigatória'),
  whatsapp: z
    .string()
    .min(1, 'O whatsapp é obrigatório')
    .refine((value) => /^(\d{11,12})$/.test(value), {
      message: 'O whatsapp é inválido',
    }),
  description: z.string().min(1, 'A descrição é obrigatória'),
})

type FormType = z.infer<typeof schema>

interface ImageItemProps {
  uid: string
  name: string
  previewUrl: string
  url: string
}

export function New() {
  const { user } = useContext(AuthContext)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormType>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  const [carImages, setCarImages] = useState<ImageItemProps[]>([])

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const image = e.target.files[0]

      if (image.type === 'image/jpeg' || image.type === 'image/png') {
        await handleUploadImage(image)
      } else {
        toast.error('Envie uma imagem jpeg ou png!')
        return
      }

      console.log('tudo certo')
    }
  }

  async function handleUploadImage(image: File) {
    if (!user?.uid) {
      return
    }

    const currentUid = user?.uid
    const uidImage = uuidV4()

    const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`)

    uploadBytes(uploadRef, image).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadUrl) => {
        const imageItem = {
          name: uidImage,
          uid: currentUid,
          previewUrl: URL.createObjectURL(image),
          url: downloadUrl,
        }

        setCarImages((images) => [...images, imageItem])
        toast.success('Imagem enviada com sucesso')
      })
    })
  }

  function onSubmit(data: FormType) {
    if (carImages.length === 0) {
      toast.error('Envie ao menos uma imagem do veículo')
      return
    }

    const carListImages = carImages.map((car) => {
      return {
        uid: car.uid,
        name: car.name,
        url: car.url,
      }
    })

    addDoc(collection(db, 'cars'), {
      name: data.name.toUpperCase(),
      model: data.model,
      whatsapp: data.whatsapp,
      city: data.city,
      year: data.year,
      km: data.km,
      price: data.price,
      description: data.description,
      createdAt: new Date(),
      owner: user?.name,
      ownerUid: user?.uid,
      images: carListImages,
    })
      .then(() => {
        reset()
        setCarImages([])
        toast.success('Cadastro realizado com sucesso')
      })
      .catch((error) => {
        console.error('Erro ao cadastrar o veículo: ', error)
        toast.error('Erro ao cadastrar o veículo')
      })
  }

  async function handleDeleteImage(image: ImageItemProps) {
    const imagePath = `images/${image.uid}/${image.name}`
    const imageRef = ref(storage, imagePath)

    try {
      await deleteObject(imageRef)
      setCarImages(carImages.filter((car) => car.url !== image.url))
    } catch (error) {
      console.log('Erro ao deletar imagem', error)
    }
  }

  return (
    <Container>
      <DashboardHeader />
      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
        <button className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-56">
          <div className="absolute cursor-pointer ">
            <FiUpload size={30} color="#000" />
          </div>
          <div className="cursor-pointer h-full w-full">
            <input
              type="file"
              accept="image/*"
              className="opacity-0 cursor-pointer w-full h-full"
              onChange={handleFile}
            />
          </div>
        </button>

        {carImages.map((image) => (
          <div
            key={image.uid}
            className="w-full h-32 flex items-center justify-center relative"
          >
            <button
              className="absolute"
              onClick={() => handleDeleteImage(image)}
            >
              <FiTrash size={28} color="#fff" />
            </button>
            <img
              src={image.previewUrl}
              alt="Foto do veículo"
              className="rounded-lg w-full h-32 object-cover"
            />
          </div>
        ))}
      </div>

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <p className="mb-2 font-medium">Nome do carro</p>
            <Input
              register={register}
              name="name"
              error={errors.name?.message}
              type="text"
              placeholder='Ex: "Gol G4 1.0"...'
            />
          </div>
          <div className="mb-3">
            <p className="mb-2 font-medium">Modelo do carro</p>
            <Input
              register={register}
              name="model"
              error={errors.model?.message}
              type="text"
              placeholder="Ex: 1.0 8v 4p Manual..."
            />
          </div>
          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Ano</p>
              <Input
                register={register}
                name="year"
                error={errors.year?.message}
                type="text"
                placeholder="Ex: 2016/2016..."
              />
            </div>
            <div className="w-full">
              <p className="mb-2 font-medium">KM Rodados</p>
              <Input
                register={register}
                name="km"
                error={errors.km?.message}
                type="text"
                placeholder="Ex: 26.300..."
              />
            </div>
          </div>
          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Telefone/WhatsApp</p>
              <Input
                register={register}
                name="whatsapp"
                error={errors.whatsapp?.message}
                type="text"
                placeholder="Ex: (19) 99999-9999..."
              />
            </div>
            <div className="w-full">
              <p className="mb-2 font-medium">Cidade</p>
              <Input
                register={register}
                name="city"
                error={errors.city?.message}
                type="text"
                placeholder="Ex: Piracicaba - SP..."
              />
            </div>
          </div>
          <div className="mb-3">
            <p className="mb-2 font-medium">Preço</p>
            <Input
              register={register}
              name="price"
              error={errors.price?.message}
              type="text"
              placeholder="Ex: 75.000..."
            />
          </div>
          <div className="mb-3">
            <p className="mb-2 font-medium">Descrição</p>
            <textarea
              className="border-2 w-full rounded-md h-24 px-2"
              {...register('description')}
              name="description"
              id="description"
              placeholder="Digite a descrição completa sobre o carro..."
            />
            {errors.description && (
              <p className="text-red-500 my-1">{errors.description.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 text-white font-medium h-10"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </Container>
  )
}
